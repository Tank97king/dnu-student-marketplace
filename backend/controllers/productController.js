const Product = require('../models/Product');
const Comment = require('../models/Comment');
const { upload, uploadToCloudinary } = require('../utils/uploadImage');
const { moderateContent } = require('../utils/contentModeration');
const { generateContent } = require('../utils/gemini');
const { embedAndSaveProduct } = require('../utils/embeddingService');


// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, tags, location } = req.body;
    
    const productData = {
      userId: req.user.id,
      title,
      description,
      price,
      category,
      condition,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      location
    };

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      // Kiểm tra số lượng ảnh
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Tối đa 5 ảnh cho mỗi sản phẩm'
        });
      }

      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, 'dnu-marketplace/products')
        );
        const results = await Promise.all(uploadPromises);
        productData.images = results.map(result => result.secure_url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi upload hình ảnh: ' + uploadError.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ít nhất 1 hình ảnh'
      });
    }

    // AI Moderation: kiểm duyệt nội dung
    const moderation = await moderateContent(title, description);
    if (moderation.status === 'reject') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung chưa phù hợp: ' + (moderation.reason || 'Vui lòng chỉnh sửa lại.')
      });
    }
    productData.moderationStatus = moderation.status;
    productData.moderationReason = moderation.reason || null;

    const product = await Product.create(productData);

    // Tạo embedding ngầm (background) để hỗ trợ Semantic Search
    embedAndSaveProduct(product).catch(err =>
      console.warn('[embeddingService] Embed after create failed:', err.message)
    );

    res.status(201).json({
      success: true,
      data: product,
      message: 'Tạo bài đăng thành công! Sản phẩm đang chờ admin duyệt.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      condition, 
      location, 
      minPrice, 
      maxPrice, 
      sort,
      dateRange,
      minRating,
      tags,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    
    // Search: tìm theo cụm từ hoặc theo LOẠI (subcategory) — loại phải khớp đúng như lúc đăng bán
    if (search) {
      const trimmed = search.trim();
      const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
      // Khi là subcategory (nhiều từ, ví dụ "giáo trình đại học môn học ngành"): sản phẩm phải có ĐỦ các từ
      // (đúng với loại đã chọn khi đăng bán — tags đã lưu các từ đó)
      if (words.length >= 3) {
        const mustMatchAll = words.map(word => ({
          $or: [
            { title: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } },
            { tags: { $in: [new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')] } }
          ]
        }));
        query.$and = query.$and || [];
        query.$and.push(...mustMatchAll);
      } else {
        // 1–2 từ: match cụm (điện thoại, laptop cũ, ...)
        query.$or = [
          { title: { $regex: trimmed, $options: 'i' } },
          { description: { $regex: trimmed, $options: 'i' } },
          { tags: { $in: [new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')] } }
        ];
      }
    }
    
    // Filters
    if (category) {
      let decodedCategory = decodeURIComponent(category).trim()
      const categoryEnToVi = {
        Electronics: 'Điện tử',
        Books: 'Sách',
        Furniture: 'Nội thất',
        Clothing: 'Quần áo',
        Stationery: 'Văn phòng phẩm',
        Sports: 'Thể thao',
        Other: 'Khác'
      }
      if (categoryEnToVi[decodedCategory]) decodedCategory = categoryEnToVi[decodedCategory]
      // Hiển thị cả sản phẩm có category tiếng Anh (Electronics, Books...) hoặc tiếng Việt (Điện tử, Sách...)
      const categoryViToEn = {
        'Điện tử': ['Điện tử', 'Electronics'],
        'Sách': ['Sách', 'Books'],
        'Nội thất': ['Nội thất', 'Furniture'],
        'Quần áo': ['Quần áo', 'Clothing'],
        'Văn phòng phẩm': ['Văn phòng phẩm', 'Stationery'],
        'Thể thao': ['Thể thao', 'Sports'],
        'Khác': ['Khác', 'Other']
      }
      const toMatch = categoryViToEn[decodedCategory] || [decodedCategory]
      query.category = toMatch.length > 1 ? { $in: toMatch } : toMatch[0]
    }
    if (condition) query.condition = condition;
    if (location) query.location = location;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Date range filter
    if (dateRange) {
      query.createdAt = { $gte: new Date(dateRange) };
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray.map(tag => tag.trim()) };
    }
    
    // Status - chỉ hiển thị sản phẩm Available và đã được duyệt
    query.status = 'Available';
    query.isApproved = true; // Chỉ hiển thị sản phẩm đã được duyệt (áp dụng cho tất cả)

    // Sort - improved with relevance
    let sortOption = { createdAt: -1 }; // default
    
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest' || sort === '-createdAt') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest' || sort === 'createdAt') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1, totalReviews: -1 };
    } else if (sort === 'popular') {
      sortOption = { viewCount: -1, favoriteCount: -1 };
    } else if (sort === 'relevance') {
      sortOption = search ? { viewCount: -1, averageRating: -1 } : { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Debug: log query để kiểm tra
    if (query.category) {
      console.log('Query object:', JSON.stringify(query, null, 2))
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name avatar')
      .select('-__v');

    const total = await Product.countDocuments(query);
    
    // Debug: log số lượng sản phẩm tìm được
    if (query.category) {
      const catLabel = query.category.$in ? query.category.$in.join(', ') : query.category
      console.log(`Found ${total} products with category: ${catLabel}`)
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isApproved: true,  // Chỉ cho phép xem sản phẩm đã được duyệt
      status: { $ne: 'Deleted' }  // Không cho phép xem sản phẩm đã xóa
    })
      .populate('userId', 'name avatar phone studentId rating')
      .populate('comments.userId', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Increase view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Make sure user is product owner
    if (product.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật sản phẩm này'
      });
    }

    // Update fields
    const { title, description, price, category, condition, tags, location } = req.body;
    
    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (tags) product.tags = tags.split(',').map(tag => tag.trim());
    if (location) product.location = location;

    // Handle images - có thể là JSON string hoặc array
    let imagesToKeep = product.images || [];
    if (req.body.images) {
      try {
        // Thử parse nếu là JSON string
        const parsedImages = typeof req.body.images === 'string' 
          ? JSON.parse(req.body.images) 
          : req.body.images;
        if (Array.isArray(parsedImages)) {
          imagesToKeep = parsedImages;
        }
      } catch (e) {
        // Nếu không parse được, giữ nguyên images hiện tại
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'dnu-marketplace/products')
      );
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.secure_url);
      
      let finalImages = [];
      let fileIndex = 0;
      
      imagesToKeep.forEach(img => {
        if (img.startsWith('new-file-') || img === 'new-file-placeholder') {
          if (fileIndex < newImages.length) {
            finalImages.push(newImages[fileIndex++]);
          }
        } else {
          finalImages.push(img);
        }
      });
      
      // Nếu còn ảnh mới chưa được map (đề phòng trường hợp frontend không dùng placeholder hoặc gửi thừa)
      while (fileIndex < newImages.length) {
        finalImages.push(newImages[fileIndex++]);
      }
      
      const totalImages = finalImages.length;
      if (totalImages > 5) {
        return res.status(400).json({
          success: false,
          message: `Tổng số ảnh không được vượt quá 5. Hiện tại có ${totalImages} ảnh.`
        });
      }
      
      product.images = finalImages;
    } else {
      // Nếu không có ảnh mới, cập nhật danh sách ảnh hiện tại
      product.images = imagesToKeep;
    }

    // Đảm bảo có ít nhất 1 ảnh
    if (!product.images || product.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm phải có ít nhất 1 ảnh'
      });
    }

    // AI Moderation khi cập nhật title/description
    const modTitle = product.title || '';
    const modDesc = product.description || '';
    const moderation = await moderateContent(modTitle, modDesc);
    if (moderation.status === 'reject') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung chưa phù hợp: ' + (moderation.reason || 'Vui lòng chỉnh sửa lại.')
      });
    }
    product.moderationStatus = moderation.status;
    product.moderationReason = moderation.reason || null;

    product = await product.save();

    // Cập nhật embedding ngầm (background)
    embedAndSaveProduct(product).catch(err =>
      console.warn('[embeddingService] Embed after update failed:', err.message)
    );

    res.json({
      success: true,
      data: product,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Make sure user is product owner
    if (product.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa sản phẩm này'
      });
    }

    product.status = 'Deleted';
    await product.save();

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark product as sold
// @route   PUT /api/products/:id/sold
// @access  Private
exports.markAsSold = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Make sure user is product owner
    if (product.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đánh dấu sản phẩm này'
      });
    }

    product.status = 'Sold';
    await product.save();

    res.json({
      success: true,
      message: 'Đã đánh dấu sản phẩm là đã bán'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Report product
// @route   POST /api/products/:id/report
// @access  Private
exports.reportProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const { reason } = req.body;

    product.reports.push({
      userId: req.user.id,
      reason
    });

    await product.save();

    res.json({
      success: true,
      message: 'Báo cáo sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve product (Admin only)
// @route   PUT /api/products/:id/approve
// @access  Private (Admin)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền duyệt sản phẩm'
      });
    }

    product.isApproved = true;
    await product.save();

    res.json({
      success: true,
      message: 'Duyệt sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending products (Admin only)
// @route   GET /api/products/pending
// @access  Private (Admin)
exports.getPendingProducts = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem sản phẩm chờ duyệt'
      });
    }

    const products = await Product.find({ 
      isApproved: false,
      status: 'Available'
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject product (Admin only)
// @route   PUT /api/products/:id/reject
// @access  Private (Admin)
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền từ chối sản phẩm'
      });
    }

    product.status = 'Deleted';
    await product.save();

    res.json({
      success: true,
      message: 'Từ chối sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hàm fallback gợi ý danh mục và tags cục bộ bằng từ khóa nếu AI lỗi/hết quota
function fallbackSuggestMetadata(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  const rules = [
    {
      category: 'Sách',
      keywords: ['sách', 'truyện', 'giáo trình', 'vở', 'tài liệu', 'đề cương', 'ôn thi', 'bài tập', 'tiểu thuyết', 'novel', 'manga', 'tạp chí', 'ielts', 'toeic', 'hsk', 'giải tích', 'đại số', 'vật lý', 'hóa học'],
      tags: ['sách cũ', 'tài liệu học tập', 'sách sinh viên', 'giáo trình']
    },
    {
      category: 'Điện tử',
      keywords: ['điện thoại', 'laptop', 'máy tính', 'tai nghe', 'sạc', 'pin', 'tivi', 'loa', 'camera', 'màn hình', 'keyboard', 'chuột', 'mouse', 'ipad', 'tablet', 'iphone', 'samsung', 'oppo', 'xiaomi', 'asus', 'dell', 'macbook', 'lenovo', 'hp', 'ram', 'cpu', 'card', 'linh kiện', 'usb', 'smartwatch'],
      tags: ['thiết bị điện tử', 'phụ kiện công nghệ', 'đồ dùng điện tử', 'thanh lý điện tử']
    },
    {
      category: 'Quần áo',
      keywords: ['áo', 'quần', 'giày', 'dép', 'váy', 'đầm', 'mũ', 'nón', 'balo', 'túi xách', 'sneaker', 'thắt lưng', 'jacket', 't-shirt', 'hoodie', 'đồng phục', 'áo khoác', 'sơ mi', 'áo thun'],
      tags: ['thời trang', 'quần áo cũ', 'phụ kiện thời trang', 'sinh viên']
    },
    {
      category: 'Nội thất',
      keywords: ['bàn', 'ghế', 'giường', 'nệm', 'chăn', 'gối', 'tủ', 'kệ', 'đèn', 'gương', 'decor', 'rèm', 'thảm', 'tranh', 'tủ lạnh', 'bếp', 'nồi', 'chén', 'bát', 'đồ gia dụng', 'móc treo'],
      tags: ['nội thất phòng trọ', 'đồ gia dụng', 'decor phòng', 'đồ dùng phòng trọ']
    },
    {
      category: 'Văn phòng phẩm',
      keywords: ['bút', 'thước', 'sổ', 'tập', 'kẹp', 'băng dính', 'văn phòng phẩm', 'giấy', 'note', 'compas', 'hồ sơ', 'bảng vẽ', 'bullet journal', 'sticker'],
      tags: ['dụng cụ học tập', 'văn phòng phẩm', 'học tập']
    },
    {
      category: 'Thể thao',
      keywords: ['bóng', 'vợt', 'cầu lông', 'giày thể thao', 'gym', 'yoga', 'xe đạp', 'thể thao', 'áo đấu', 'thảm tập', 'kính bơi', 'đồ bơi', 'nón bảo hiểm', 'chạy bộ'],
      tags: ['dụng cụ thể thao', 'rèn luyện sức khỏe', 'đồ thể thao']
    }
  ];

  let matchedCategory = 'Khác';
  let matchedTags = ['đồ dùng sinh viên', 'thanh lý'];
  let maxMatches = 0;

  for (const rule of rules) {
    let matches = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedCategory = rule.category;
      matchedTags = [...rule.tags];
    }
  }

  // Thêm tags từ tiêu đề
  const words = (title || '').split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim().toLowerCase()).filter(w => w.length > 2);
  const wordsSet = new Set(words);
  const commonWordsToExclude = ['bán', 'thanh', 'lý', 'cần', 'mua', 'giá', 'rẻ', 'cho', 'tốt', 'mới', 'đẹp', 'như', 'hình', 'sinh', 'viên', 'dnu'];
  
  for (const word of wordsSet) {
    if (!commonWordsToExclude.includes(word) && matchedTags.length < 8) {
      matchedTags.push(word);
    }
  }

  return {
    category: matchedCategory,
    tags: matchedTags.slice(0, 10)
  };
}

// Hàm fallback gợi ý mô tả cục bộ nếu AI lỗi/hết quota
function fallbackSuggestDescription(title, description) {
  const cleanTitle = String(title).trim();
  let desc = `Mình cần thanh lý ${cleanTitle} với giá cả cực kỳ hợp lý cho các bạn sinh viên DNU. `;
  if (description && String(description).trim()) {
    desc += `Sản phẩm có đặc điểm: ${String(description).trim().slice(0, 150)}. `;
  } else {
    desc += `Mặt hàng này còn sử dụng rất tốt, chất lượng đảm bảo và hình thức còn đẹp. `;
  }
  desc += `Giao dịch trực tiếp, thuận tiện xem đồ quanh khu vực trường hoặc ký túc xá. Mọi người quan tâm nhắn tin mình nhé!`;
  return desc;
}

// @desc    AI gợi ý category và tags từ title + description
// @route   POST /api/products/ai-suggest-metadata
// @access  Public
exports.suggestCategoryAndTags = async (req, res) => {
  try {
    const { title, description } = req.body;
    const text = [title, description].filter(Boolean).join(' ');
    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập ít nhất tiêu đề hoặc mô tả'
      });
    }
    const prompt = `Dựa trên tiêu đề và mô tả sản phẩm sau, trả về ĐÚNG 1 JSON với 2 trường (không thêm gì khác):
- category: chỉ một trong: "Sách", "Điện tử", "Quần áo", "Nội thất", "Văn phòng phẩm", "Thể thao", "Khác"
- tags: mảng 5-10 từ khóa tiếng Việt hoặc tiếng Anh, ví dụ: ["sách giáo trình", "toán học"]

Nội dung:
---
${text.slice(0, 1500)}
---`;

    let response;
    try {
      response = await generateContent(prompt);
    } catch (apiError) {
      console.warn('[Gemini API Error] Failed to generate content:', apiError.message);
      response = null;
    }

    if (!response) {
      console.log('[AI Fallback] Using local rule-based category & tags suggestion');
      const fallbackData = fallbackSuggestMetadata(title, description);
      return res.json({
        success: true,
        data: fallbackData,
        message: 'Gợi ý tự động từ hệ thống (Fallback)'
      });
    }

    try {
      const jsonStr = response.replace(/```json?\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const category = ['Sách', 'Điện tử', 'Quần áo', 'Nội thất', 'Văn phòng phẩm', 'Thể thao', 'Khác'].includes(parsed.category) ? parsed.category : 'Khác';
      const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [];
      return res.json({
        success: true,
        data: { category, tags }
      });
    } catch (e) {
      console.warn('[AI JSON Parse Error] Using local fallback:', e.message);
      const fallbackData = fallbackSuggestMetadata(title, description);
      return res.json({
        success: true,
        data: fallbackData,
        message: 'Gợi ý tự động từ hệ thống (Fallback do lỗi định dạng AI)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    AI gợi ý mô tả sản phẩm từ title (và mô tả thô nếu có)
// @route   POST /api/products/ai-suggest-description
// @access  Public
exports.suggestDescription = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tiêu đề'
      });
    }
    const prompt = `Bạn viết một đoạn mô tả sản phẩm ngắn gọn, thân thiện cho sàn mua bán đồ cũ sinh viên.
- Tiêu đề sản phẩm: ${String(title).trim()}
${description ? `- Mô tả thô (có thể dựa vào): ${String(description).slice(0, 500)}` : ''}

Viết 2-4 câu mô tả bằng tiếng Việt, không chèn từ "mô tả" hay "sản phẩm này". Chỉ trả về đoạn mô tả, không giải thích.`;

    let response;
    try {
      response = await generateContent(prompt);
    } catch (apiError) {
      console.warn('[Gemini API Error] Failed to generate description:', apiError.message);
      response = null;
    }

    if (!response) {
      console.log('[AI Fallback] Using local description generator');
      const fallbackDesc = fallbackSuggestDescription(title, description);
      return res.json({
        success: true,
        data: { description: fallbackDesc },
        message: 'Gợi ý tự động từ hệ thống (Fallback)'
      });
    }

    const desc = response.trim();
    return res.json({
      success: true,
      data: { description: desc }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
