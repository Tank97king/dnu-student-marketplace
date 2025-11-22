const ProductView = require('../models/ProductView');
const Product = require('../models/Product');

// @desc    Track product view
// @route   POST /api/products/:id/view
// @access  Private
exports.trackView = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Don't track views for own products
    if (product.userId.toString() === userId) {
      return res.json({
        success: true,
        message: 'Không lưu lượt xem cho sản phẩm của chính mình'
      });
    }

    // Check if viewed today (avoid duplicate entries)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingView = await ProductView.findOne({
      userId,
      productId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (!existingView) {
      await ProductView.create({
        userId,
        productId
      });

      // Increment view count on product
      await Product.findByIdAndUpdate(productId, {
        $inc: { viewCount: 1 }
      });
    }

    res.json({
      success: true,
      message: 'Đã lưu lượt xem'
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recently viewed products
// @route   GET /api/products/views/recent
// @access  Private
exports.getRecentViews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const views = await ProductView.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Filter out deleted products
    const products = views
      .map(v => v.productId)
      .filter(p => p && p.status === 'Available' && p.isApproved);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting recent views:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Find similar products by category
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'Available',
      isApproved: true
    })
      .populate('userId', 'name avatar')
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    console.error('Error getting similar products:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

