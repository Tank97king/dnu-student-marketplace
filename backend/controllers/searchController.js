const Product = require('../models/Product');
const SearchHistory = require('../models/SearchHistory');
const Review = require('../models/Review');
const ProductView = require('../models/ProductView');
const User = require('../models/User');
const { generateContent } = require('../utils/gemini');
const { semanticSearch } = require('../utils/embeddingService');

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeQuery(q) {
  const t = normalizeText(q);
  const tokens = t.split(' ').filter(Boolean);
  // bỏ token quá ngắn để giảm nhiễu (vd: "a", "i")
  return tokens.filter(x => x.length >= 2);
}

function lexicalScore(queryTokens, product) {
  if (!queryTokens || queryTokens.length === 0) return 0;
  const hay = normalizeText(
    [
      product?.title,
      product?.category,
      Array.isArray(product?.tags) ? product.tags.join(' ') : product?.tags,
      product?.description
    ].filter(Boolean).join(' ')
  );

  const words = hay.split(' ').filter(Boolean);
  const wordSet = new Set(words);

  let hit = 0;
  for (const tok of queryTokens) {
    // token ngắn (vd "xe") chỉ tính khi match đúng 1 từ, tránh match kiểu "xep", "xach", ...
    if (tok.length <= 2) {
      if (wordSet.has(tok)) hit++;
      continue;
    }

    // token dài hơn: match theo từ hoặc prefix (vd "laptop" vs "laptopgaming")
    if (wordSet.has(tok)) {
      hit++;
      continue;
    }
    if (words.some(w => w.startsWith(tok))) {
      hit++;
    }
  }

  // bonus nếu match cụm từ (vd "xe dap") như một phrase
  const phrase = queryTokens.join(' ');
  const phraseHit = phrase.length >= 5 && hay.includes(phrase) ? 1 : 0;

  // tỉ lệ token match (0..1) + phrase bonus (tối đa +0.25)
  const base = hit / queryTokens.length;
  return Math.min(1, base + phraseHit * 0.25);
}


// @desc    Get search autocomplete suggestions
// @route   GET /api/search/autocomplete
// @access  Public
exports.getAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search in product titles and tags
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ],
      isApproved: true,
      status: 'Available'
    })
    .select('title tags category')
    .limit(10);

    // Extract unique suggestions
    const suggestions = new Set();
    products.forEach(product => {
      // Add title if matches
      if (product.title.toLowerCase().includes(q.toLowerCase())) {
        suggestions.add(product.title);
      }
      // Add matching tags
      product.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    // Get popular search terms from history
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          searchTerm: { $regex: q, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$searchTerm',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 5 }
    ]);

    popularSearches.forEach(item => {
      suggestions.add(item._id);
    });

    res.json({
      success: true,
      data: Array.from(suggestions).slice(0, 10)
    });
  } catch (error) {
    console.error('Error getting autocomplete:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save search history
// @route   POST /api/search/history
// @access  Private
exports.saveSearchHistory = async (req, res) => {
  try {
    const { searchTerm, filters } = req.body;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    // Count results
    const query = buildSearchQuery(searchTerm, filters);
    const resultCount = await Product.countDocuments(query);

    // Save to history
    const history = await SearchHistory.create({
      userId: req.user.id,
      searchTerm: searchTerm.trim(),
      filters: filters || {},
      resultCount
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error saving search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user search history
// @route   GET /api/search/history
// @access  Private
exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('searchTerm filters resultCount createdAt');

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete search history
// @route   DELETE /api/search/history/:id
// @access  Private
exports.deleteSearchHistory = async (req, res) => {
  try {
    await SearchHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Search history deleted'
    });
  } catch (error) {
    console.error('Error deleting search history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Parse đơn giản câu tìm kiếm khi không có Gemini: trích "dưới/trên X tr" và từ khóa
// Hỗ trợ cả có dấu (trên, dưới, triệu) và không dấu (tren, duoi, trieu)
function parseNaturalFallback(text) {
  const t = String(text).toLowerCase().replace(/\s+/g, ' ');
  const filters = {};
  let search = t;
  // dưới/duoi X tr/triệu → maxPrice
  const matchDuoi = t.match(/(?:dưới|duoi)\s*(\d+)\s*(?:tr|triệu|trieu)/);
  if (matchDuoi) {
    filters.maxPrice = Number(matchDuoi[1]) * 1e6;
    search = search.replace(/(?:dưới|duoi)\s*\d+\s*(?:tr|triệu|trieu)/gi, '').trim();
  }
  // trên/tren X tr/triệu → minPrice
  const matchTren = t.match(/(?:trên|tren)\s*(\d+)\s*(?:tr|triệu|trieu)/);
  if (matchTren) {
    filters.minPrice = Number(matchTren[1]) * 1e6;
    search = search.replace(/(?:trên|tren)\s*\d+\s*(?:tr|triệu|trieu)/gi, '').trim();
  }
  search = search.replace(/\s*,\s*|\s+/g, ' ').trim();
  return { search: search || null, ...filters };
}

// @desc    Tìm kiếm bằng ngôn ngữ tự nhiên (Gemini parse → query)
// @route   POST /api/search/natural
// @access  Public
exports.searchNatural = async (req, res) => {
  try {
    const { query: naturalQuery } = req.body;
    if (!naturalQuery || !String(naturalQuery).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu tìm kiếm'
      });
    }
    const prompt = `Bạn phân tích câu tìm kiếm sản phẩm (sàn đồ cũ sinh viên) và trả về JSON với các trường sau (chỉ trả JSON, không giải thích):
- search: từ khóa tìm kiếm (rút ra từ câu), nếu không có thì ""
- category: chỉ một trong các giá trị sau hoặc "": "Sách", "Điện tử", "Quần áo", "Nội thất", "Văn phòng phẩm", "Thể thao", "Khác"
- minPrice: số VNĐ (ví dụ 100000) hoặc null
- maxPrice: số VNĐ (ví dụ 5000000 cho "dưới 5 triệu") hoặc null
- location: chỉ một trong "Campus", "Dormitory", "Nearby" hoặc ""

Câu tìm kiếm: "${String(naturalQuery).trim()}"`;

    const response = await generateContent(prompt);
    if (!response) {
      // Fallback: parse đơn giản "dưới 5tr", "trên 10tr" + từ khóa rồi tìm
      const { search: fallbackSearch, minPrice, maxPrice } = parseNaturalFallback(naturalQuery);
      const filters = {};
      if (minPrice != null) filters.minPrice = minPrice;
      if (maxPrice != null) filters.maxPrice = maxPrice;
      const searchTerm = fallbackSearch || '';
      const query = buildSearchQuery(searchTerm, filters);
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'name avatar')
        .select('-__v');
      const total = await Product.countDocuments(query);
      return res.json({
        success: true,
        data: products,
        pagination: { total, limit: 50 },
        fallback: true,
        message: 'Đang dùng tìm theo từ khóa và giá (trên/dưới X tr). Gõ ví dụ: "laptop tren 5tr" hoặc "sách duoi 100k".'
      });
    }
    const validCategories = ['Sách', 'Điện tử', 'Quần áo', 'Nội thất', 'Văn phòng phẩm', 'Thể thao', 'Khác'];
    const validLocations = ['Campus', 'Dormitory', 'Nearby'];
    let filters = {};
    try {
      const jsonStr = response.replace(/```json?\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const searchTerm = parsed.search || '';
      if (parsed.category && validCategories.includes(parsed.category)) filters.category = parsed.category;
      if (parsed.location && validLocations.includes(parsed.location)) filters.location = parsed.location;
      if (parsed.minPrice != null) filters.minPrice = Number(parsed.minPrice);
      if (parsed.maxPrice != null) filters.maxPrice = Number(parsed.maxPrice);
      const query = buildSearchQuery(searchTerm, filters);
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'name avatar')
        .select('-__v');
      const total = await Product.countDocuments(query);
      return res.json({
        success: true,
        data: products,
        pagination: { total, limit: 50 }
      });
    } catch (parseErr) {
      console.error('Natural search parse error:', parseErr);
      const { search: fallbackSearch, minPrice, maxPrice } = parseNaturalFallback(naturalQuery);
      const filters = {};
      if (minPrice != null) filters.minPrice = minPrice;
      if (maxPrice != null) filters.maxPrice = maxPrice;
      const query = buildSearchQuery(fallbackSearch || '', filters);
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'name avatar')
        .select('-__v');
      const total = await Product.countDocuments(query);
      return res.json({
        success: true,
        data: products,
        pagination: { total, limit: 50 },
        fallback: true
      });
    }
  } catch (error) {
    console.error('Search natural error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to build search query
const buildSearchQuery = (searchTerm, filters = {}) => {
  const query = {
    isApproved: true,
    status: 'Available'
  };

  // Text search
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }

  // Filters
  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.location) query.location = filters.location;
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  if (filters.dateRange) {
    query.createdAt = { $gte: new Date(filters.dateRange) };
  }

  // Tag filter
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Rating filter
  if (filters.minRating) {
    query.averageRating = { $gte: Number(filters.minRating) };
  }

  return query;
};

module.exports.buildSearchQuery = buildSearchQuery;

// @desc    Semantic Search — Gemini Embedding + Vectra file-based index
// @route   POST /api/search/semantic
// @access  Public
exports.searchSemantic = async (req, res) => {
  try {
    const { query: queryText, filters = {} } = req.body;
    if (!queryText || !String(queryText).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập câu tìm kiếm' });
    }

    // 1. Tìm ngữ nghĩa qua embedding
    const semanticResults = await semanticSearch(String(queryText).trim(), 30);

    // Fallback về regex nếu embedding thất bại (chưa index, hết quota, ...)
    if (!semanticResults || semanticResults.length === 0) {
      const fallbackQuery = buildSearchQuery(String(queryText).trim(), filters);
      const products = await Product.find(fallbackQuery)
        .sort({ viewCount: -1, averageRating: -1, createdAt: -1 })
        .limit(30)
        .populate('userId', 'name avatar')
        .select('-__v');
      const total = await Product.countDocuments(fallbackQuery);
      return res.json({
        success: true,
        data: products.map(p => ({ ...p.toObject(), aiScore: null })),
        pagination: { total, limit: 30 },
        aiEnabled: false,
        message: 'Dùng tìm kiếm thường (chưa có dữ liệu AI hoặc hết quota Gemini).'
      });
    }

    // 2. Lấy id + score
    const productIds = semanticResults.map(r => r.productId);
    const scoreMap = {};
    semanticResults.forEach(r => { scoreMap[r.productId] = r.score; });

    // 3. Fetch từ MongoDB — chỉ Available + isApproved
    const mongoQuery = { _id: { $in: productIds }, isApproved: true, status: 'Available' };
    if (filters.category) mongoQuery.category = filters.category;
    if (filters.location) mongoQuery.location = filters.location;
    if (filters.minPrice || filters.maxPrice) {
      mongoQuery.price = {};
      if (filters.minPrice) mongoQuery.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) mongoQuery.price.$lte = Number(filters.maxPrice);
    }

    const products = await Product.find(mongoQuery)
      .populate('userId', 'name avatar')
      .select('-__v');

    // 4. Re-rank + lọc:
    // - Embedding score thường "nén" nên nhiều kết quả không liên quan vẫn >0.6
    // - Kết hợp thêm điểm lexical (từ khóa xuất hiện trong title/tags/desc) để kéo đúng sản phẩm lên
    // - Lọc theo ngưỡng tương đối so với top-1 để loại nhiễu
    const qTokens = tokenizeQuery(queryText);

    const rescored = products.map(p => {
      const raw = Number(scoreMap[p._id.toString()] || 0); // 0..1
      const lex = lexicalScore(qTokens, p);
      // trọng số: embedding chủ đạo, lexical giúp loại nhiễu với query "cụ thể"
      const final = Math.max(0, Math.min(1, raw * 0.78 + lex * 0.22));
      return {
        ...p.toObject(),
        aiScore: Math.round(final * 100),
        _aiRaw: raw,
        _aiLex: lex
      };
    });

    const top = rescored.reduce((m, x) => Math.max(m, x._aiRaw), 0);
    const minAbs = 0.62; // chặn bớt kết quả "lụm" không liên quan
    const minRel = Math.max(minAbs, top - 0.08);

    const sorted = rescored
      .filter(x => {
        // query rất ngắn (vd "xe dap") → cần lexical match rõ ràng để tránh nhiễu
        const isShortQuery = qTokens.length <= 2 && qTokens.every(t => t.length <= 3);
        if (isShortQuery) {
          // Nếu match từ khoá rất mạnh (vd title có đúng "xe dap") thì nới raw để không mất kết quả đúng
          const strongLex = x._aiLex >= 0.75;
          if (strongLex) {
            return x._aiRaw >= Math.max(0.55, top - 0.12);
          }
          return (x._aiRaw >= Math.max(minRel, 0.7) && x._aiLex >= 0.34) || x._aiRaw >= 0.82;
        }
        return x._aiRaw >= minRel || x._aiLex >= 0.5;
      })
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 30)
      .map(({ _aiRaw, _aiLex, ...rest }) => rest);

    return res.json({
      success: true,
      data: sorted,
      pagination: { total: sorted.length, limit: 30 },
      aiEnabled: true
    });
  } catch (error) {
    console.error('searchSemantic error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
