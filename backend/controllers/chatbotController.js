/**
 * chatbotController.js — RAG-powered chatbot
 *
 * Kiến trúc RAG:
 *   User message → Embed → Parallel search:
 *     ├── semanticSearch(products)   → top-5 sản phẩm liên quan
 *     └── knowledgeSearch(knowledge) → top-3 chunks FAQ/guide/policy
 *   → buildRAGContext() → buildSystemPrompt() → Gemini → Response
 */

const Product = require('../models/Product');
const { generateContent, generateEmbedding } = require('../utils/gemini');
const { semanticSearch } = require('../utils/embeddingService');
const {
  knowledgeSearch,
  buildRAGContext,
  buildSystemPrompt,
} = require('../utils/ragService');

// ─── In-memory session store (RAM) ────────────────────────────────────────
// Key: sessionId → Array<{role, content}>
const chatHistory = new Map();
const MAX_HISTORY = 10; // Giữ tối đa 10 lượt hội thoại (20 messages)

// ─── Helper: Fetch product docs từ MongoDB theo ids ─────────────────────
async function fetchProductsByIds(semanticHits) {
  if (!semanticHits || semanticHits.length === 0) return [];
  try {
    const ids = semanticHits.map(h => h.productId);
    const scoreMap = {};
    semanticHits.forEach(h => { scoreMap[h.productId] = h.score; });

    const products = await Product.find({
      _id: { $in: ids },
      isApproved: true,
      status: 'Available',
    })
      .select('title price category location images description')
      .lean();

    // Sắp xếp toàn bộ sản phẩm theo score từ cao xuống thấp
    const sortedProducts = products.sort((a, b) =>
      (scoreMap[b._id.toString()] || 0) - (scoreMap[a._id.toString()] || 0)
    );

    // Lấy top 5 sản phẩm có score khớp nhất
    return sortedProducts.slice(0, 5);
  } catch (err) {
    console.error('[chatbot] fetchProductsByIds error:', err.message);
    return [];
  }
}

// ─── Helper: Detect xem câu hỏi có liên quan đến sản phẩm không ────────
function isProductQuery(message) {
  const keywords = [
    'tìm', 'có', 'mua', 'sách', 'laptop', 'điện thoại', 'giá', 'sản phẩm',
    'đồ', 'xem', 'bán', 'giáo trình', 'áo', 'bàn', 'ghế', 'điện tử', 'máy',
    'tivi', 'quần', 'nội thất', 'thể thao', 'rẻ', 'cũ', 'dùng', 'cần', 'muốn',
    'cho mình', 'gợi ý', 'recommend', 'thiết bị', 'dụng cụ', 'tai nghe',
    // Bổ sung các hãng công nghệ, điện thoại và từ khóa thông dụng của sinh viên DNU
    'oppo', 'reno', 'renno', 'iphone', 'samsung', 'xiaomi', 'redmi', 'realme', 'vivo',
    'asus', 'dell', 'hp', 'lenovo', 'macbook', 'ipad', 'nokia', 'sony',
    'nồi', 'bếp', 'tủ', 'giường', 'xe', 'giày', 'vợt', 'casio'
  ];
  const msg = message.toLowerCase();
  return keywords.some(kw => msg.includes(kw)) && message.length >= 2;
}


// ─── Main handler: chatWithGemini ─────────────────────────────────────────
const chatWithGemini = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn',
      });
    }

    const userMessage = message.trim();
    const currentSessionId = sessionId || 'default';

    // ── RAG Step 1: Single Embedding & Parallel Retrieval ──────────────────
    // Tạo embedding 1 lần duy nhất để giảm latency và tránh rate limit / phí API
    const queryVector = await generateEmbedding(userMessage).catch(err => {
      console.warn('[chatbot] generateEmbedding failed:', err.message);
      return null;
    });

    // Chạy song song tìm kiếm ngữ nghĩa
    const retrievalTasks = [
      // Knowledge base search (luôn chạy)
      knowledgeSearch(queryVector || userMessage, 3).catch(err => {
        console.warn('[chatbot] knowledgeSearch failed:', err.message);
        return [];
      }),
      // Product search (chỉ khi câu hỏi liên quan đến sản phẩm)
      isProductQuery(userMessage)
        ? semanticSearch(queryVector || userMessage, 8).catch(err => {
          console.warn('[chatbot] semanticSearch failed:', err.message);
          return [];
        })
        : Promise.resolve([]),
    ];

    const [knowledgeHits, productHits] = await Promise.all(retrievalTasks);

    // ── RAG Step 2: Fetch product details từ MongoDB ─────────────────────
    const productDocs = await fetchProductsByIds(productHits);

    // Chuẩn bị productsFound để trả về frontend (hiển thị card sản phẩm)
    const productsFound = productDocs.map(p => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      images: p.images || [],
    }));

    // ── RAG Step 3: Build Augmented Context ──────────────────────────────
    const ragContext = buildRAGContext(productHits, knowledgeHits, productDocs);
    const systemPrompt = buildSystemPrompt(ragContext);

    // ── RAG Step 4: Build conversation history for Gemini ────────────────
    // Lấy history lưu trữ của session này
    const history = chatHistory.get(currentSessionId) || [];
    const geminiHistory = [...history];

    // Tin nhắn hiện tại của user (kèm context mới nếu có)
    const userMessageWithContext = ragContext
      ? `${userMessage}\n\n[RAG Context - Chỉ dùng nội bộ, không hiển thị ra ngoài]\n${ragContext}`
      : userMessage;

    // ── RAG Step 5: Call Gemini ───────────────────────────────────────────
    // Thứ tự ưu tiên các model
    const MODEL_NAMES = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot chưa được cấu hình. Vui lòng kiểm tra GEMINI_API_KEY trong file .env.',
      });
    }
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    let responseText = null;
    let lastError = null;

    for (const modelName of MODEL_NAMES) {
      try {
        // Cung cấp systemInstruction trực tiếp cho mô hình để đảm bảo
        // chỉ dẫn hệ thống có hiệu lực cho tất cả các lượt hội thoại.
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemPrompt 
        });
        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(userMessageWithContext);
        responseText = result.response.text();
        console.log(`[chatbot] OK model: ${modelName}`);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`[chatbot] Model ${modelName} thất bại: ${err.message?.slice(0, 100)}`);
        // Quota tracked per model, tiếp tục fallback sang model khác
        continue;
      }
    }

    if (!responseText) {
      console.error('[chatbot] All models exhausted:', lastError?.message);
      
      const errMsg = (lastError?.message || '').toLowerCase();
      const is429 = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('resource_exhausted') || errMsg.includes('too many');
      const is403 = errMsg.includes('403') || errMsg.includes('forbidden') || errMsg.includes('permission');

      if (is429) {
        return res.status(429).json({
          success: false,
          message: 'Chatbot đang bận (hết quota API). Vui lòng thử lại sau ít phút ⏰',
        });
      }
      if (is403) {
        return res.status(403).json({
          success: false,
          message: 'API key không có quyền truy cập Gemini. Kiểm tra GEMINI_API_KEY trong file .env.',
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Tất cả model AI không khả dụng. Vui lòng thử lại sau.',
      });
    }

    // ── Step 6: Lưu history ───────────────────────────────────────────────
    history.push({
      role: 'user',
      parts: [{ text: userMessage }], // Lưu message gốc (không kèm context để tránh phình to prompt ở lượt sau)
    });
    history.push({
      role: 'model',
      parts: [{ text: responseText }],
    });

    // Giới hạn history (giữ MAX_HISTORY lượt gần nhất, mỗi lượt = 2 message)
    if (history.length > MAX_HISTORY * 2) {
      const slicedHistory = history.slice(-MAX_HISTORY * 2);
      chatHistory.set(currentSessionId, slicedHistory);
    } else {
      chatHistory.set(currentSessionId, history);
    }

    // ── Step 7: Response ──────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: responseText,
      sessionId: currentSessionId,
      products: productsFound.length > 0 ? productsFound : undefined,
      _rag: process.env.NODE_ENV === 'development' ? {
        knowledgeHits: knowledgeHits.length,
        productHits: productHits.length,
        contextLength: ragContext.length,
      } : undefined,
    });

  } catch (error) {
    console.error('[chatbot] Error:', error.message);

    let message = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    if (error.message?.includes('API_KEY') || error.status === 400) {
      message = 'API key không hợp lệ. Vui lòng kiểm tra lại GEMINI_API_KEY.';
    } else if (error.status === 403) {
      message = 'API key không có quyền truy cập. Kiểm tra cài đặt Gemini API.';
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      message = 'Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau ít phút.';
    }

    return res.status(error.status || 500).json({
      success: false,
      message,
    });
  }
};

// ─── Clear History ────────────────────────────────────────────────────────
const clearChatHistory = (req, res) => {
  try {
    const { sessionId } = req.body;
    chatHistory.delete(sessionId || 'default');
    res.status(200).json({ success: true, message: 'Đã xóa lịch sử chat' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xóa lịch sử' });
  }
};

module.exports = { chatWithGemini, clearChatHistory };
