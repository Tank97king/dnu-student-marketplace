const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const Message = require('../models/Message');
const ProductView = require('../models/ProductView');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar, bio, nickname } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (nickname !== undefined) user.nickname = nickname;

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my products
// @route   GET /api/users/products
// @access  Private
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
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

// @desc    Add to favorites
// @route   POST /api/users/favorites/:productId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    if (user.favorites.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong danh sách yêu thích'
      });
    }

    user.favorites.push(productId);
    await user.save();

    // Update product favoriteCount
    await Product.findByIdAndUpdate(productId, { $inc: { favoriteCount: 1 } });

    res.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/users/favorites/:productId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(
      id => id.toString() !== productId
    );
    await user.save();

    // Update product favoriteCount
    await Product.findByIdAndUpdate(productId, { $inc: { favoriteCount: -1 } });

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalProducts = await Product.countDocuments({ userId });
    const soldProducts = await Product.countDocuments({ userId, status: 'Sold' });
    const totalFavorites = (await User.findById(userId)).favorites.length;

    res.json({
      success: true,
      data: {
        totalProducts,
        soldProducts,
        totalFavorites
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get public user profile
// @route   GET /api/users/:userId/public
// @access  Public
exports.getUserPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Calculate rating from reviews
    const ratingStats = await Review.aggregate([
      { $match: { reviewedUserId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (ratingStats.length > 0) {
      const averageRating = Math.round(ratingStats[0].averageRating * 10) / 10;
      const totalReviews = ratingStats[0].totalReviews;

      // Update user rating if different
      if (user.rating.average !== averageRating || user.rating.count !== totalReviews) {
        await User.findByIdAndUpdate(userId, {
          'rating.average': averageRating,
          'rating.count': totalReviews
        });
        user.rating = { average: averageRating, count: totalReviews };
      }
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user public profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user products
// @route   GET /api/users/:userId/products
// @access  Public
exports.getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId, isApproved: true };

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit);

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

// @desc    Follow user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể theo dõi chính mình'
      });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if already following
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã theo dõi người dùng này rồi'
      });
    }

    // Add to following and followers
    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userId);

    await userToFollow.save();
    await currentUser.save();

    // Create notification
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      userId,
      'user_followed',
      'Có người theo dõi bạn',
      `${currentUser.name} đã bắt đầu theo dõi bạn`,
      { followerId: currentUserId, followerName: currentUser.name }
    );

    res.json({
      success: true,
      message: 'Đã theo dõi người dùng',
      data: {
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:userId/follow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if not following
    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa theo dõi người dùng này'
      });
    }

    // Remove from following and followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({
      success: true,
      message: 'Đã bỏ theo dõi người dùng',
      data: {
        followersCount: userToUnfollow.followers.length,
        followingCount: currentUser.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller stats
// @route   GET /api/users/:userId/seller-stats
// @access  Private
exports.getSellerStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = 'month' } = req.query; // 'week', 'month', 'year', 'all'
    const Payment = require('../models/Payment');
    const Review = require('../models/Review');

    // Calculate date range
    const now = new Date();
    let startDate = null;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    // Get user's products
    const products = await Product.find({ userId, ...dateFilter });
    const productIds = products.map(p => p._id);

    // Calculate basic stats
    const totalProducts = await Product.countDocuments({ userId });
    const availableProducts = await Product.countDocuments({ userId, status: 'Available' });
    const soldProducts = await Product.countDocuments({ userId, status: 'Sold', ...dateFilter });

    // Total views
    const totalViews = await ProductView.countDocuments({ 
      productId: { $in: productIds },
      ...dateFilter
    });

    // Total favorites (sum of favoriteCount from products)
    const totalFavorites = products.reduce((sum, p) => sum + (p.favoriteCount || 0), 0);

    // Total messages
    const totalMessages = await Message.countDocuments({
      receiverId: userId,
      ...dateFilter
    });

    // Total offers
    const totalOffers = await Offer.countDocuments({
      sellerId: userId,
      ...dateFilter
    });

    // Total orders
    const totalOrders = await Order.countDocuments({
      sellerId: userId,
      ...dateFilter
    });

    // Get orders for revenue calculation
    const orders = await Order.find({
      sellerId: userId,
      ...dateFilter
    }).populate('productId', 'title category');

    // Total revenue from confirmed payments
    const orderIds = orders.map(o => o._id);
    const confirmedPayments = await Payment.find({
      orderId: { $in: orderIds },
      status: 'confirmed'
    });
    const totalRevenue = confirmedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Revenue by time period (daily for last 30 days, monthly for last 12 months)
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          status: 'confirmed',
          confirmedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.sellerId': mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$confirmedAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          status: 'confirmed',
          confirmedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.sellerId': mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$confirmedAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products by revenue (sold products)
    const topProductsByRevenue = await Payment.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.sellerId': mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'order.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          title: { $first: '$product.title' },
          images: { $first: '$product.images' },
          category: { $first: '$product.category' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Top products by views
    const topProductsByViews = await Product.find({ userId })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title images price viewCount favoriteCount category');

    // Conversion rates
    const conversionRates = {
      viewToOffer: totalViews > 0 ? ((totalOffers / totalViews) * 100).toFixed(2) : 0,
      offerToOrder: totalOffers > 0 ? ((totalOrders / totalOffers) * 100).toFixed(2) : 0,
      orderToPayment: totalOrders > 0 ? ((confirmedPayments.length / totalOrders) * 100).toFixed(2) : 0,
      overall: totalViews > 0 ? ((confirmedPayments.length / totalViews) * 100).toFixed(2) : 0
    };

    // Review stats
    const reviewStats = await Review.aggregate([
      {
        $match: {
          reviewedUserId: mongoose.Types.ObjectId(userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let reviewData = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (reviewStats.length > 0) {
      const stats = reviewStats[0];
      reviewData.averageRating = Math.round((stats.averageRating || 0) * 10) / 10;
      reviewData.totalReviews = stats.totalReviews || 0;
      
      // Calculate rating distribution
      if (stats.ratingDistribution) {
        stats.ratingDistribution.forEach(rating => {
          if (rating >= 1 && rating <= 5) {
            reviewData.ratingDistribution[rating] = (reviewData.ratingDistribution[rating] || 0) + 1;
          }
        });
      }
    }

    // Revenue by category
    const revenueByCategory = await Payment.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $match: {
          'order.sellerId': mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'order.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        soldProducts,
        totalViews,
        totalFavorites,
        totalMessages,
        totalOffers,
        totalOrders,
        totalRevenue,
        topProductsByViews,
        topProductsByRevenue,
        conversionRates,
        reviewStats: reviewData,
        dailyRevenue,
        monthlyRevenue,
        revenueByCategory
      }
    });
  } catch (error) {
    console.error('Error getting seller stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
