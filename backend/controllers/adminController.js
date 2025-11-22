const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const Message = require('../models/Message');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const ProductView = require('../models/ProductView');
const { createNotification } = require('./notificationController');
const { createAndEmitNotification } = require('../utils/notifications');

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
    const userId = req.params.id;
    const currentAdminId = req.user.id;
    const isCurrentUserSuperAdmin = req.user.isSuperAdmin;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if trying to modify admin status
    if (isAdmin !== undefined) {
      // Only super admin can promote/demote admins
      if (!isCurrentUserSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ admin tổng mới có quyền bổ nhiệm hoặc xóa quyền admin'
        });
      }

      // Prevent removing admin role from yourself
      if (userId === currentAdminId && isAdmin === false) {
        return res.status(400).json({
          success: false,
          message: 'Bạn không thể xóa quyền admin của chính mình'
        });
      }

      // Prevent removing super admin status
      if (user.isSuperAdmin && isAdmin === false) {
        return res.status(403).json({
          success: false,
          message: 'Không thể xóa quyền admin của admin tổng'
        });
      }
    }

    const updates = {};
    const messages = [];

    if (isActive !== undefined) {
      user.isActive = isActive;
      updates.isActive = isActive;
      messages.push(isActive ? 'Kích hoạt tài khoản' : 'Khóa tài khoản');
    }

    if (isAdmin !== undefined) {
      const wasAdmin = user.isAdmin;
      user.isAdmin = isAdmin;
      updates.isAdmin = isAdmin;
      
      if (isAdmin && !wasAdmin) {
        messages.push('Bổ nhiệm làm admin');
      } else if (!isAdmin && wasAdmin) {
        messages.push('Xóa quyền admin');
      }
    }

    await user.save();

    const actionMessage = messages.length > 0 
      ? messages.join(' và ') 
      : 'Cập nhật người dùng';

    console.log(`✅ ${isCurrentUserSuperAdmin ? 'Super Admin' : 'Admin'} ${req.user.email} ${actionMessage.toLowerCase()} cho ${user.email}`);

    res.json({
      success: true,
      data: user,
      message: `${actionMessage} thành công`
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

    // Create and emit notification for the seller
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      product.userId,
      'product_approved',
      'Sản phẩm đã được duyệt',
      `Sản phẩm "${product.title}" của bạn đã được duyệt và hiển thị trên website.`,
      { productId: product._id, productName: product.title }
    );

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

// @desc    Reject product
// @route   PUT /api/admin/products/:id/reject
// @access  Admin
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Cập nhật trạng thái sản phẩm: đánh dấu là đã từ chối (có thể xóa hoặc đánh dấu)
    product.status = 'Deleted';
    product.isApproved = false;
    await product.save();

    // Create and emit notification for the seller
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      product.userId,
      'product_rejected',
      'Sản phẩm đã bị từ chối',
      `Sản phẩm "${product.title}" của bạn đã bị từ chối.`,
      { productId: product._id, productName: product.title }
    );

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

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentAdminId = req.user.id;

    // Prevent self-deletion
    if (userId === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể xóa chính tài khoản của mình'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Only super admin can delete admins
    if (user.isAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin tổng mới có quyền xóa tài khoản admin'
      });
    }

    // Prevent deleting super admin
    if (user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản admin tổng'
      });
    }

    // Delete or update related data
    // 1. Delete user's products (or mark as deleted)
    await Product.updateMany(
      { userId: userId },
      { status: 'Deleted', isApproved: false }
    );

    // 2. Delete user's orders (or mark as cancelled)
    await Order.updateMany(
      { $or: [{ buyerId: userId }, { sellerId: userId }] },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // 3. Delete user's offers
    await Offer.deleteMany({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    });

    // 4. Delete user's messages
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    // 5. Delete user's comments
    await Comment.deleteMany({ userId: userId });
    // Also remove user from comment replies
    await Comment.updateMany(
      { 'replies.userId': userId },
      { $pull: { replies: { userId: userId } } }
    );

    // 6. Delete user's reviews
    await Review.deleteMany({
      $or: [{ reviewerId: userId }, { reviewedUserId: userId }]
    });

    // 7. Delete user's bookmarks
    await Bookmark.deleteMany({ userId: userId });

    // 8. Delete user's notifications
    await Notification.deleteMany({ userId: userId });

    // 9. Delete user's product views
    await ProductView.deleteMany({ userId: userId });

    // 10. Remove user from other users' favorites
    await User.updateMany(
      { favorites: userId },
      { $pull: { favorites: userId } }
    );

    // 11. Remove user from followers/following of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // 12. Finally, delete the user
    // Store email and phone before deletion for logging
    const deletedEmail = user.email;
    const deletedPhone = user.phone;
    
    const deleteResult = await User.findByIdAndDelete(userId);
    
    if (!deleteResult) {
      return res.status(500).json({
        success: false,
        message: 'Không thể xóa tài khoản người dùng'
      });
    }

    // Verify deletion
    const verifyDeleted = await User.findById(userId);
    if (verifyDeleted) {
      console.error('Warning: User still exists after deletion!', userId);
      return res.status(500).json({
        success: false,
        message: 'Xóa tài khoản không thành công. Vui lòng thử lại.'
      });
    }

    console.log(`✅ User deleted successfully: ${deletedEmail} (${deletedPhone})`);

    res.json({
      success: true,
      message: `Đã xóa tài khoản của ${user.name} thành công`,
      deletedEmail: deletedEmail,
      deletedPhone: deletedPhone
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể xóa tài khoản người dùng'
    });
  }
};

// @desc    Check email configuration
// @route   GET /api/admin/check-email-config
// @access  Admin
exports.checkEmailConfig = async (req, res) => {
  try {
    const config = {
      EMAIL_HOST: process.env.EMAIL_HOST || null,
      EMAIL_PORT: process.env.EMAIL_PORT || null,
      EMAIL_USER: process.env.EMAIL_USER || null,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***configured***' : null
    };

    const isConfigured = config.EMAIL_HOST && config.EMAIL_PORT && config.EMAIL_USER && process.env.EMAIL_PASSWORD;

    res.json({
      success: true,
      configured: isConfigured,
      config: config,
      message: isConfigured 
        ? 'Email đã được cấu hình' 
        : 'Email chưa được cấu hình. Vui lòng kiểm tra file backend/.env'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





