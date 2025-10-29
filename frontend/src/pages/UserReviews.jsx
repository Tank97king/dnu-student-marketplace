import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/StarRating';

const UserReviews = () => {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
    loadReviewStats();
  }, [userId, currentPage]);

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/user/${userId}?page=${currentPage}&limit=10`);
      setReviews(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      const response = await api.get(`/reviews/user/${userId}/stats`);
      setReviewStats(response.data.data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
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
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-300 h-24 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Đánh giá người dùng
        </h1>

        {/* Review Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white mr-4">
                {reviewStats.averageRating.toFixed(1)}
              </span>
              <div>
                <StarRating rating={Math.round(reviewStats.averageRating)} size="xl" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {reviewStats.totalReviews} đánh giá
                </p>
              </div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Phân bố đánh giá
            </h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm w-8 text-gray-600 dark:text-gray-400">
                  {rating}★
                </span>
                <div className="flex-1 mx-3 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full"
                    style={{
                      width: `${reviewStats.totalReviews > 0 
                        ? (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {reviewStats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có đánh giá nào cho người dùng này.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
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
                        <StarRating rating={review.rating} size="sm" />
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

                {review.productId && (
                  <div className="mt-3 ml-13 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sản phẩm: {review.productId.title}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Trước
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;
