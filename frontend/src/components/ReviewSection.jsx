import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StarRating from './StarRating';

const ReviewSection = ({ productId, sellerId, onReviewAdded }) => {
  const { user } = useSelector(state => state.auth);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0, // 0 means no rating (just comment)
    comment: '',
    isSeller: false
  });
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    rating: 0,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    loadReviews();
    loadComments();
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

  const loadComments = async () => {
    try {
      const response = await api.get(`/products/${productId}/comments`);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để bình luận hoặc đánh giá');
      return;
    }

    if (!formData.comment.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);
    try {
      // Nếu có rating thì là review, không có thì là comment
      if (formData.rating > 0) {
        // Gửi review
        const reviewData = {
          transactionId: `transaction_${Date.now()}`,
          reviewedUserId: sellerId,
          productId: productId,
          rating: formData.rating,
          comment: formData.comment,
          isSeller: formData.isSeller
        };

        const response = await api.post('/reviews', reviewData);
        setReviews([response.data.data, ...reviews]);
        loadReviewStats();
        
        if (onReviewAdded) {
          onReviewAdded(response.data.data);
        }
      } else {
        // Gửi comment
        const response = await api.post(`/products/${productId}/comments`, { 
          content: formData.comment 
        });
        setComments([response.data.data, ...comments]);
      }

      // Reset form
      setFormData({ rating: 0, comment: '', isSeller: false });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Không thể gửi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await api.put(`/products/${productId}/comments/${commentId}`, {
        content: editContent
      });
      setComments(comments.map(c => c._id === commentId ? response.data.data : c));
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Không thể cập nhật bình luận');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    
    try {
      await api.delete(`/products/${productId}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Không thể xóa bình luận');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setEditReviewData({
      rating: review.rating,
      comment: review.comment || ''
    });
  };

  const handleCancelEditReview = () => {
    setEditingReview(null);
    setEditReviewData({ rating: 0, comment: '' });
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editReviewData.comment.trim()) {
      alert('Vui lòng nhập nội dung nhận xét');
      return;
    }

    if (editReviewData.rating < 1 || editReviewData.rating > 5) {
      alert('Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return;
    }

    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating: editReviewData.rating,
        comment: editReviewData.comment
      });
      
      setReviews(reviews.map(r => r._id === reviewId ? response.data.data : r));
      setEditingReview(null);
      setEditReviewData({ rating: 0, comment: '' });
      loadReviewStats();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Không thể cập nhật đánh giá');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      loadReviewStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Không thể xóa đánh giá');
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
                  : 'text-gray-300 dark:text-gray-600'
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
        Bình luận & Đánh giá ({comments.length + reviews.length})
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

      {/* Combined Comment & Review Form */}
      <div className="mb-6">
        {user ? (
          <>
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Viết bình luận / Đánh giá
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Đánh giá (tùy chọn)
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(formData.rating, true, (rating) => 
                        setFormData({ ...formData, rating })
                      )}
                    </div>
                    {formData.rating > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.rating} sao
                      </span>
                    )}
                    {formData.rating > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: 0 })}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-2"
                      >
                        Bỏ đánh giá
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.rating > 0 ? 'Bạn đang đánh giá sản phẩm' : 'Chỉ bình luận (không đánh giá)'}
                  </p>
                </div>
                
                {/* Comment/Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.rating > 0 ? 'Nhận xét' : 'Bình luận'} *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="4"
                    placeholder={formData.rating > 0 
                      ? "Chia sẻ trải nghiệm của bạn về sản phẩm này..." 
                      : "Thêm bình luận..."}
                    required
                  />
                </div>

                {/* Is Seller Checkbox (only for reviews) */}
                {formData.rating > 0 && user.id !== sellerId && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSeller"
                      checked={formData.isSeller}
                      onChange={(e) => setFormData({ ...formData, isSeller: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isSeller" className="text-sm text-gray-700 dark:text-gray-300">
                      Tôi là người bán sản phẩm này
                    </label>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    {submitting ? 'Đang gửi...' : formData.rating > 0 ? 'Gửi đánh giá' : 'Gửi bình luận'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ rating: 0, comment: '', isSeller: false });
                    }}
                    className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để bình luận hoặc đánh giá</p>
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>

      {/* Combined Comments and Reviews List */}
      <div className="space-y-4">
        {comments.length === 0 && reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        ) : (
          <>
            {/* Comments */}
            {comments.map((comment) => (
              <div key={`comment-${comment._id}`} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <img
                      src={comment.userId?.avatar || 'https://via.placeholder.com/40'}
                      className="w-10 h-10 rounded-full mr-3"
                      alt={comment.userId?.name}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {comment.userId?.name}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  
                  {user && user.id === comment.userId?._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  )}
                </div>
                
                {editingComment === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                      rows="3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 ml-13">{comment.content}</p>
                )}
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-6 space-y-2">
                    {comment.replies.map((reply, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <div className="flex items-center mb-1">
                          <img
                            src={reply.userId?.avatar || 'https://via.placeholder.com/24'}
                            className="w-6 h-6 rounded-full mr-2"
                            alt={reply.userId?.name}
                          />
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">{reply.userId?.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Reviews */}
            {reviews.map((review) => (
              <div key={`review-${review._id}`} className="border-b border-gray-200 dark:border-gray-700 pb-4">
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
                        {editingReview === review._id ? (
                          <div className="flex items-center">
                            {renderStars(editReviewData.rating, true, (rating) => 
                              setEditReviewData({ ...editReviewData, rating })
                            )}
                          </div>
                        ) : (
                          renderStars(review.rating)
                        )}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {review.isSeller && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                        Người bán
                      </span>
                    )}
                    {user && user.id === review.reviewerId._id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {editingReview === review._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editReviewData.comment}
                      onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                      rows="4"
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateReview(review._id)}
                        className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEditReview}
                        className="bg-gray-500 text-white px-4 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 ml-13">
                      {review.comment}
                    </p>
                  )
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
