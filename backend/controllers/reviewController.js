const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { createAndEmitNotification } = require('../utils/notifications');
const { uploadToCloudinary } = require('../utils/uploadImage');

// Helper function để cập nhật average rating của user
const updateUserRating = async (userId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { reviewedUserId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(userId, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].totalReviews
      });
    } else {
      // Nếu không có review nào, reset về 0
      await User.findByIdAndUpdate(userId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

// Tạo đánh giá mới
const createReview = async (req, res) => {
  try {
    const { transactionId, reviewedUserId, productId, rating, comment, isSeller, orderId } = req.body;
    const reviewerId = req.user.id;

    // Validate order if orderId provided (review based on transaction)
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Check if order is completed
      if (order.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể đánh giá sau khi giao dịch hoàn thành'
        });
      }

      // Check if user is part of this order
      const isBuyer = order.buyerId.toString() === reviewerId;
      const isSeller = order.sellerId.toString() === reviewerId;
      
      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền đánh giá đơn hàng này'
        });
      }

      // Check if already reviewed this order
      const existingReview = await Review.findOne({
        orderId,
        reviewerId,
        reviewedUserId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá giao dịch này rồi'
        });
      }
    } else {
      // For reviews without order (legacy support)
      const existingReview = await Review.findOne({
        transactionId,
        reviewerId,
        reviewedUserId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá giao dịch này rồi'
        });
      }
    }

    // Handle image uploads
    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, 'dnu-marketplace/reviews')
        );
        const results = await Promise.all(uploadPromises);
        reviewImages = results.map(result => result.secure_url);
      } catch (uploadError) {
        console.error('Error uploading review images:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi upload hình ảnh'
        });
      }
    }

    // Tạo review mới
    const review = new Review({
      transactionId: transactionId || orderId?.toString() || `review_${Date.now()}`,
      orderId: orderId || null,
      reviewerId,
      reviewedUserId,
      productId,
      rating,
      comment,
      images: reviewImages,
      isSeller
    });

    await review.save();

    // Populate thông tin người đánh giá
    await review.populate('reviewerId', 'name email avatar');

    // Cập nhật average rating cho user được đánh giá
    await updateUserRating(reviewedUserId);

    // Create notification for product owner if review is for a product
    try {
      if (productId) {
        const product = await Product.findById(productId).populate('userId');
        if (product && product.userId._id.toString() !== reviewerId.toString()) {
          const io = req.app.get('io');
          await createAndEmitNotification(
            io,
            product.userId._id,
            'new_review',
            'Có đánh giá mới',
            `${req.user.name} đã đánh giá sản phẩm "${product.title}" của bạn`,
            { productId: product._id, reviewId: review._id, productName: product.title, rating }
          );
        }
      }
    } catch (notifError) {
      console.error('Error creating review notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đánh giá'
    });
  }
};

// Lấy đánh giá của một sản phẩm
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ productId })
      .populate('reviewerId', 'name email avatar')
      .populate('reviewedUserId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ productId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error getting product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá'
    });
  }
};

// Lấy đánh giá của một user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ reviewedUserId: userId })
      .populate('reviewerId', 'name email avatar')
      .populate('productId', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewedUserId: userId });

    // Tính average rating
    const avgRating = await Review.aggregate([
      { $match: { reviewedUserId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: reviews,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.count || 0,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá người dùng'
    });
  }
};

// Cập nhật đánh giá
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId, reviewerId: userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa'
      });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Cập nhật lại average rating
    await updateUserRating(review.reviewedUserId);

    res.json({
      success: true,
      message: 'Cập nhật đánh giá thành công',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật đánh giá'
    });
  }
};

// Xóa đánh giá
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: reviewId, reviewerId: userId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
      });
    }

    const reviewedUserId = review.reviewedUserId;
    await Review.findByIdAndDelete(reviewId);

    // Cập nhật lại average rating
    await updateUserRating(reviewedUserId);

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đánh giá'
    });
  }
};

// Lấy thống kê đánh giá của user
const getUserReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Review.aggregate([
      { $match: { reviewedUserId: new mongoose.Types.ObjectId(userId) } },
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

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });

    res.json({
      success: true,
      data: {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error getting user review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê đánh giá'
    });
  }
};

// Sync lại rating cho tất cả users (chạy một lần để cập nhật data cũ)
const syncAllUserRatings = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền thực hiện thao tác này'
      });
    }

    // Lấy tất cả users có reviews
    const usersWithReviews = await Review.distinct('reviewedUserId');
    
    let updatedCount = 0;
    for (const userId of usersWithReviews) {
      await updateUserRating(userId);
      updatedCount++;
    }

    // Reset rating cho users không có reviews
    await User.updateMany(
      { _id: { $nin: usersWithReviews } },
      { 'rating.average': 0, 'rating.count': 0 }
    );

    res.json({
      success: true,
      message: `Đã đồng bộ rating cho ${updatedCount} users`,
      updatedCount
    });
  } catch (error) {
    console.error('Error syncing user ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đồng bộ rating'
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getUserReviewStats,
  syncAllUserRatings,
  updateUserRating // Export để có thể dùng ở nơi khác nếu cần
};
