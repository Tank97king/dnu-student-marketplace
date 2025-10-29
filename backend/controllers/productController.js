const Product = require('../models/Product');
const Comment = require('../models/Comment');
const { upload, uploadToCloudinary } = require('../utils/uploadImage');

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

    const product = await Product.create(productData);

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
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    
    // Search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filters
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (location) query.location = location;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Status
    query.status = 'Available';
    query.isApproved = true; // Chỉ hiển thị sản phẩm đã được duyệt

    // Sort
    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 }
    };
    
    const sortOption = sortOptions[sort] || { createdAt: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name avatar')
      .select('-__v');

    const total = await Product.countDocuments(query);

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
    const product = await Product.findById(req.params.id)
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
    const { title, description, price, category, condition, tags, location, images } = req.body;
    
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (tags) product.tags = tags.split(',').map(tag => tag.trim());
    if (location) product.location = location;
    if (images) product.images = images;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'dnu-marketplace/products')
      );
      const results = await Promise.all(uploadPromises);
      product.images = [...product.images, ...results.map(result => result.secure_url)];
    }

    product = await product.save();

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
