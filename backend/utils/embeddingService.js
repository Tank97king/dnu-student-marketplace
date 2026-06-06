/**
 * embeddingService.js
 * Semantic Search dùng Vectra (file-based vector store) + Gemini Embedding API.
 * Không cần MongoDB Atlas — lưu vector vào thư mục backend/data/vector_index/
 */

const path = require('path');
const { LocalIndex } = require('vectra');
const { generateEmbedding } = require('./gemini');

// Thư mục lưu vector index (tạo tự động nếu chưa có)
const INDEX_PATH = path.join(__dirname, '../data/vector_index');

let _index = null;

/**
 * Lấy (hoặc tạo) vector index. Singleton để tránh tạo lại nhiều lần.
 */
async function getIndex() {
  if (_index) return _index;
  _index = new LocalIndex(INDEX_PATH);
  if (!(await _index.isIndexCreated())) {
    await _index.createIndex();
    console.log('[embeddingService] Vector index đã được tạo tại:', INDEX_PATH);
  }
  return _index;
}

/**
 * Tạo chuỗi text đại diện cho 1 sản phẩm (dùng để embed).
 * Ghép: title + category + tags + description (tối đa 500 ký tự)
 */
function buildProductText(product) {
  const tags = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');
  const parts = [
    product.title || '',
    product.category || '',
    tags,
    (product.description || '').slice(0, 500)
  ].filter(Boolean);
  return parts.join('. ');
}

/**
 * Tạo embedding cho 1 sản phẩm và lưu vào vector index.
 * @param {object} product - Mongoose document hoặc plain object có _id, title, description, category, tags
 * @returns {Promise<boolean>} true nếu thành công
 */
async function embedAndSaveProduct(product) {
  try {
    const text = buildProductText(product);
    if (!text.trim()) return false;

    const vector = await generateEmbedding(text);
    if (!vector) return false;

    const index = await getIndex();
    const productId = product._id ? product._id.toString() : String(product.id);

    // Xóa item cũ nếu đã tồn tại (update)
    try {
      await index.deleteItem(productId);
    } catch (_) {
      // Bỏ qua nếu chưa có
    }

    await index.insertItem({
      id: productId,
      vector,
      metadata: {
        productId,
        title: product.title || '',
        category: product.category || '',
      }
    });

    return true;
  } catch (err) {
    console.error('[embeddingService] embedAndSaveProduct error:', err.message);
    return false;
  }
}

/**
 * Xóa embedding của 1 sản phẩm khỏi vector index.
 * @param {string} productId
 */
async function deleteProductEmbedding(productId) {
  try {
    const index = await getIndex();
    await index.deleteItem(String(productId));
  } catch (err) {
    // Bỏ qua nếu không có
  }
}

/**
 * Tìm kiếm ngữ nghĩa: nhận câu query → embed → so sánh cosine → trả về top-k productId + score
 * @param {string} queryText - Câu tìm kiếm của user
 * @param {number} topK - Số kết quả tối đa (mặc định 20)
 * @returns {Promise<Array<{productId: string, score: number}>>}
 */
async function semanticSearch(query, topK = 20) {
  try {
    let vector;
    if (Array.isArray(query)) {
      vector = query;
    } else {
      vector = await generateEmbedding(query);
    }
    if (!vector) return [];

    const index = await getIndex();
    const results = await index.queryItems(vector, topK);

    return results.map(r => ({
      productId: r.item.id,
      score: r.score, // cosine similarity: 0–1, càng cao càng phù hợp
    }));
  } catch (err) {
    console.error('[embeddingService] semanticSearch error:', err.message);
    return [];
  }
}

/**
 * Đếm số sản phẩm đã có embedding trong index.
 */
async function countIndexedProducts() {
  try {
    const index = await getIndex();
    const stats = await index.listItems();
    return Array.isArray(stats) ? stats.length : 0;
  } catch {
    return 0;
  }
}

module.exports = {
  embedAndSaveProduct,
  deleteProductEmbedding,
  semanticSearch,
  buildProductText,
  countIndexedProducts,
};
