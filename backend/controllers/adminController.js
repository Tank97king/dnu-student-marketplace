const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { createNotification } = require('./notificationController');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  try {
    const { isActive, isAdmin } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending products with pagination
// @route   GET /api/admin/products/pending
// @access  Admin
exports.getPendingProducts = async (req, res) => {
  try {
    console.log('Admin getPendingProducts called by:', req.user?.email);
    
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      isApproved: false, 
      status: 'Available' 
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({ 
      isApproved: false, 
      status: 'Available' 
    });

    console.log(`Found ${products.length} pending products out of ${total} total`);

    res.json({
      success: true,
      count: products.length,
      total,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getPendingProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve product
// @route   PUT /api/admin/products/:id/approve
// @access  Admin
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    product.isApproved = true;
    await product.save();

    // Create notification for the seller
    await createNotification(
      product.userId,
      'product_approved',
      'Sản phẩm đã được duyệt',
      `Sản phẩm "${product.name}" của bạn đã được duyệt và hiển thị trên website.`,
      { productId: product._id, productName: product.name }
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${product.userId}`).emit('new-notification', {
        type: 'product_approved',
        title: 'Sản phẩm đã được duyệt',
        message: `Sản phẩm "${product.name}" của bạn đã được duyệt và hiển thị trên website.`
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Đã duyệt sản phẩm'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    const products = await Product.find({ 'reports.0': { $exists: true } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ status: 'Available', isApproved: true });
    const soldProducts = await Product.countDocuments({ status: 'Sold' });
    const pendingProducts = await Product.countDocuments({ isApproved: false });
    
    // Category stats
    const categoryStats = await Product.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        products: {
          total: totalProducts,
          available: availableProducts,
          sold: soldProducts,
          pending: pendingProducts
        },
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





