/**
 * ragService.js
 * RAG (Retrieval-Augmented Generation) Service
 * Kết hợp:
 *   1. Semantic Search sản phẩm (Vectra vector index có sẵn)
 *   2. Knowledge Base Search (FAQ, chính sách, hướng dẫn)
 * để tạo context chất lượng cao cho Gemini trả lời.
 */

const path = require('path');
const fs = require('fs');
const { LocalIndex } = require('vectra');
const { generateEmbedding } = require('./gemini');
const { semanticSearch } = require('./embeddingService');

// ─── Knowledge Base Index (riêng biệt với product index) ───────────────────
const KNOWLEDGE_INDEX_PATH = path.join(__dirname, '../data/knowledge_index');
const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

let _knowledgeIndex = null;

/**
 * Lấy (hoặc tạo) knowledge vector index.
 */
async function getKnowledgeIndex() {
  if (_knowledgeIndex) return _knowledgeIndex;
  _knowledgeIndex = new LocalIndex(KNOWLEDGE_INDEX_PATH);
  if (!(await _knowledgeIndex.isIndexCreated())) {
    await _knowledgeIndex.createIndex();
    console.log('[ragService] Knowledge index created at:', KNOWLEDGE_INDEX_PATH);
  }
  return _knowledgeIndex;
}

// ─── Chunk Knowledge Base ───────────────────────────────────────────────────

/**
 * Chia nội dung Markdown thành các chunks theo heading (###, ##).
 * Mỗi chunk = 1 đoạn kiến thức có thể embed riêng.
 * @param {string} content - Nội dung file markdown
 * @param {string} source - Tên nguồn (faq, guide, policy)
 * @returns {Array<{id: string, text: string, source: string}>}
 */
function chunkMarkdown(content, source) {
  const lines = content.split('\n');
  const chunks = [];
  let currentTitle = '';
  let currentLines = [];
  let chunkIndex = 0;

  const flushChunk = () => {
    const text = currentLines.join('\n').trim();
    if (text.length > 30) { // Bỏ chunk quá ngắn
      chunks.push({
        id: `${source}_${chunkIndex++}`,
        text: currentTitle ? `${currentTitle}\n${text}` : text,
        source,
      });
    }
    currentLines = [];
  };

  for (const line of lines) {
    // Khi gặp heading level 2 hoặc 3 → tạo chunk mới
    if (line.startsWith('## ') || line.startsWith('### ')) {
      flushChunk();
      currentTitle = line.replace(/^#+\s*/, '').trim();
    } else {
      currentLines.push(line);
    }
  }
  flushChunk(); // Flush chunk cuối

  return chunks;
}

/**
 * Đọc tất cả file knowledge base và chia thành chunks.
 * @returns {Array<{id: string, text: string, source: string}>}
 */
function loadKnowledgeChunks() {
  const files = [
    { name: 'faq.md', source: 'faq' },
    { name: 'guide.md', source: 'guide' },
    { name: 'policy.md', source: 'policy' },
  ];

  const allChunks = [];
  for (const { name, source } of files) {
    const filePath = path.join(KNOWLEDGE_DIR, name);
    if (!fs.existsSync(filePath)) {
      console.warn(`[ragService] Knowledge file not found: ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkMarkdown(content, source);
    allChunks.push(...chunks);
    console.log(`[ragService] Loaded ${chunks.length} chunks from ${name}`);
  }
  return allChunks;
}

// ─── Index Knowledge Base ───────────────────────────────────────────────────

/**
 * Embed tất cả knowledge chunks và lưu vào knowledge index.
 * Chạy khi khởi động (nếu index chưa có) hoặc khi gọi script indexKnowledge.js
 */
async function indexKnowledgeBase(force = false) {
  try {
    // Đảm bảo index tồn tại trước (tạo mới nếu chưa có)
    _knowledgeIndex = null; // Reset singleton để force re-create
    const index = await getKnowledgeIndex();

    let existingItems = [];
    try {
      existingItems = await index.listItems();
    } catch (_) {
      existingItems = [];
    }

    if (!force && existingItems.length > 0) {
      console.log(`[ragService] Knowledge index already has ${existingItems.length} chunks. Skipping.`);
      return existingItems.length;
    }

    const chunks = loadKnowledgeChunks();
    if (chunks.length === 0) {
      console.warn('[ragService] No knowledge chunks found!');
      return 0;
    }

    console.log(`[ragService] Indexing ${chunks.length} knowledge chunks...`);
    let success = 0;

    for (const chunk of chunks) {
      try {
        const vector = await generateEmbedding(chunk.text);
        if (!vector) continue;

        // Xóa item cũ nếu có
        try { await index.deleteItem(chunk.id); } catch (_) {}

        await index.insertItem({
          id: chunk.id,
          vector,
          metadata: {
            id: chunk.id,
            source: chunk.source,
            text: chunk.text.slice(0, 500), // Lưu preview
          },
        });
        success++;
      } catch (err) {
        console.error(`[ragService] Failed to index chunk ${chunk.id}:`, err.message);
      }

      // Delay nhỏ để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`[ragService] ✅ Indexed ${success}/${chunks.length} knowledge chunks.`);
    return success;
  } catch (err) {
    console.error('[ragService] indexKnowledgeBase error:', err.message);
    return 0;
  }
}

// ─── Knowledge Search ───────────────────────────────────────────────────────

/**
 * Tìm kiếm ngữ nghĩa trong knowledge base.
 * @param {string} queryText - Câu hỏi của user
 * @param {number} topK - Số kết quả trả về
 * @returns {Promise<Array<{text: string, source: string, score: number}>>}
 */
async function knowledgeSearch(queryText, topK = 3) {
  try {
    const vector = await generateEmbedding(queryText);
    if (!vector) return [];

    const index = await getKnowledgeIndex();
    const items = await index.listItems();
    if (items.length === 0) {
      // Index chưa có → không trả về gì
      return [];
    }

    const results = await index.queryItems(vector, topK);
    return results.map(r => ({
      text: r.item.metadata?.text || '',
      source: r.item.metadata?.source || 'unknown',
      score: r.score,
    }));
  } catch (err) {
    console.error('[ragService] knowledgeSearch error:', err.message);
    return [];
  }
}

// ─── Build RAG Context ──────────────────────────────────────────────────────

/**
 * Tạo context block từ kết quả RAG để đưa vào prompt.
 * @param {Array} productHits - Kết quả từ product semantic search
 * @param {Array} knowledgeHits - Kết quả từ knowledge search
 * @param {Array} productDocs - Mongoose documents của sản phẩm tìm được
 * @returns {string} Context block để inject vào prompt
 */
function buildRAGContext(productHits, knowledgeHits, productDocs) {
  let context = '';

  // 1. Knowledge Base context
  if (knowledgeHits.length > 0) {
    const sourceLabel = { faq: 'FAQ', guide: 'Hướng dẫn', policy: 'Chính sách' };
    context += '=== THÔNG TIN TỪ KNOWLEDGE BASE ===\n';
    for (const hit of knowledgeHits) {
      if (hit.score > 0.3) { // Chỉ dùng nếu đủ liên quan
        const label = sourceLabel[hit.source] || hit.source;
        context += `[${label}]\n${hit.text}\n\n`;
      }
    }
  }

  // 2. Product context
  if (productDocs && productDocs.length > 0) {
    context += '=== SẢN PHẨM ĐANG CÓ TRÊN SÀN ===\n';
    context += 'Dưới đây là danh sách sản phẩm phù hợp với yêu cầu của người dùng:\n';
    productDocs.forEach((p, i) => {
      const price = Number(p.price || 0).toLocaleString('vi-VN');
      context += `${i + 1}. "${p.title}" - Giá: ${price} VNĐ - Danh mục: ${p.category} - Khu vực: ${p.location || 'N/A'}\n`;
    });
    context += '\n';
  }

  return context.trim();
}

/**
 * Build system prompt cho RAG chatbot.
 * @param {string} ragContext - Context từ buildRAGContext
 * @returns {string}
 */
function buildSystemPrompt(ragContext) {
  return `Bạn là trợ lý AI thông minh của sàn giao dịch đồ cũ sinh viên Đại học Đại Nam.
Nhiệm vụ của bạn là hỗ trợ sinh viên mua bán, tìm sản phẩm và giải đáp thắc mắc về ứng dụng.

${ragContext ? `--- THÔNG TIN THAM KHẢO (sử dụng để trả lời chính xác) ---\n${ragContext}\n---` : ''}

NGUYÊN TẮC TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn
- Nếu có danh sách sản phẩm trong thông tin tham khảo → PHẢI liệt kê cụ thể (tên + giá)
- Nếu có thông tin từ knowledge base → dựa vào đó để trả lời chính xác
- Nếu không có thông tin liên quan → trả lời trung thực rằng không biết và gợi ý liên hệ admin
- KHÔNG bịa đặt thông tin không có trong dữ liệu được cung cấp
- Ưu tiên câu trả lời ngắn gọn, dễ hiểu`;
}

// ─── Auto-init knowledge index when module loads ────────────────────────────
// Chỉ log cảnh báo nếu index chưa có — không tự index để tránh xung đột
// Chạy `npm run index-knowledge` để build knowledge index
(async () => {
  try {
    const index = await getKnowledgeIndex();
    const items = await index.listItems().catch(() => []);
    if (items.length === 0) {
      console.log('[ragService] ⚠️  Knowledge index trống. Chạy: npm run index-knowledge');
    } else {
      console.log(`[ragService] ✅ Knowledge index sẵn sàng: ${items.length} chunks.`);
    }
  } catch (err) {
    // Bỏ qua nếu không thể load
  }
})();

module.exports = {
  knowledgeSearch,
  buildRAGContext,
  buildSystemPrompt,
  indexKnowledgeBase,
  loadKnowledgeChunks,
};
