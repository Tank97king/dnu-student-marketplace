const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getUserReviewStats,
  syncAllUserRatings
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Tạo đánh giá mới (cần đăng nhập)
router.post('/', protect, createReview);

// Sync lại rating cho tất cả users (chỉ admin)
router.post('/sync-ratings', protect, syncAllUserRatings);

// Lấy đánh giá của một sản phẩm (public)
router.get('/product/:productId', getProductReviews);

// Lấy đánh giá của một user (public)
router.get('/user/:userId', getUserReviews);

// Lấy thống kê đánh giá của user (public)
router.get('/user/:userId/stats', getUserReviewStats);

// Cập nhật đánh giá (cần đăng nhập và là chủ sở hữu)
router.put('/:reviewId', protect, updateReview);

// Xóa đánh giá (cần đăng nhập và là chủ sở hữu)
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
