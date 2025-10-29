import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import StarRating from './StarRating';

const ReviewSection = ({ productId, sellerId, onReviewAdded }) => {
  const { user } = useSelector(state => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    isSeller: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    loadReviews();
    loadReviewStats();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const response = await api.get(`/reviews/user/${sellerId}/stats`);
      setReviewStats(response.data.data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        transactionId: `transaction_${Date.now()}`, // Tạm thời, cần có transaction thực tế
        reviewedUserId: sellerId,
        productId: productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        isSeller: reviewForm.isSeller
      };

      const response = await api.post('/reviews', reviewData);
      setReviews([response.data.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '', isSeller: false });
      setShowReviewForm(false);
      
      // Reload stats
      loadReviewStats();
      
      if (onReviewAdded) {
        onReviewAdded(response.data.data);
      }
      
      alert('Đánh giá thành công!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    if (interactive) {
      return (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`text-2xl ${
                star <= rating
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } hover:text-yellow-400 cursor-pointer`}
            >
              ★
            </button>
          ))}
        </div>
      );
    }
    return <StarRating rating={rating} size="lg" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Đánh giá sản phẩm
      </h3>

      {/* Review Stats */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {reviewStats.averageRating.toFixed(1)}
            </span>
            <div className="ml-2">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({reviewStats.totalReviews} đánh giá)
          </span>
        </div>
        
        {/* Rating Distribution */}
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <span className="text-sm w-8 text-gray-600 dark:text-gray-400">
                {rating}★
              </span>
              <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${reviewStats.totalReviews > 0 
                      ? (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 
                      : 0}%`
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                {reviewStats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {user && user.id !== sellerId && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Viết đánh giá
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Đánh giá của bạn
                </label>
                {renderStars(reviewForm.rating, true, (rating) => 
                  setReviewForm({ ...reviewForm, rating })
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhận xét
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="4"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSeller"
                  checked={reviewForm.isSeller}
                  onChange={(e) => setReviewForm({ ...reviewForm, isSeller: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isSeller" className="text-sm text-gray-700 dark:text-gray-300">
                  Tôi là người bán sản phẩm này
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <img
                    src={review.reviewerId.avatar || 'https://via.placeholder.com/40'}
                    alt={review.reviewerId.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.reviewerId.name}
                    </h4>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {review.isSeller && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Người bán
                  </span>
                )}
              </div>
              
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 ml-13">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
