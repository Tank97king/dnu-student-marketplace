const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

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
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

// Tạo đánh giá mới
const createReview = async (req, res) => {
  try {
    const { transactionId, reviewedUserId, productId, rating, comment, isSeller } = req.body;
    const reviewerId = req.user.id;

    // Kiểm tra xem đã đánh giá chưa
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

    // Tạo review mới
    const review = new Review({
      transactionId,
      reviewerId,
      reviewedUserId,
      productId,
      rating,
      comment,
      isSeller
    });

    await review.save();

    // Populate thông tin người đánh giá
    await review.populate('reviewerId', 'name email avatar');

    // Cập nhật average rating cho user được đánh giá
    await updateUserRating(reviewedUserId);

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

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getUserReviewStats
};
