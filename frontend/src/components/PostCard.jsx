import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { likePost, sharePost } from '../store/slices/postSlice'
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import api from '../utils/api'

export default function PostCard({ post }) {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [isLiked, setIsLiked] = useState(
    user && post.likes ? post.likes.some(like => like.toString() === user.id || like._id === user.id) : false
  )
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const formatPrice = (price) => {
    if (!price) return ''
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const getCategoryLabel = (category) => {
    const categoryMap = {
      'Books': 'Sách',
      'Electronics': 'Điện tử',
      'Furniture': 'Nội thất',
      'Clothing': 'Quần áo',
      'Stationery': 'Văn phòng phẩm',
      'Sports': 'Thể thao',
      'Other': 'Khác'
    }
    return categoryMap[category] || category
  }

  const getConditionLabel = (condition) => {
    // Map cả giá trị cũ (tiếng Anh) và mới (tiếng Việt)
    const conditionMap = {
      // Giá trị mới (tiếng Việt)
      'Rất tốt': 'Rất tốt',
      'Tốt': 'Tốt',
      'Khá': 'Khá',
      'Đã dùng nhiều': 'Đã dùng nhiều',
      'Cần sửa chữa': 'Cần sửa chữa',
      // Giá trị cũ (tiếng Anh) - map sang tiếng Việt
      'New': 'Mới',
      'Like New': 'Như mới',
      'Excellent': 'Rất tốt',
      'Good': 'Tốt',
      'Fair': 'Khá',
      'Used': 'Đã dùng nhiều',
      'NeedsRepair': 'Cần sửa chữa'
    }
    return conditionMap[condition] || condition || ''
  }

  const handleLike = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để like bài đăng')
      return
    }
    
    try {
      const result = await dispatch(likePost(post._id)).unwrap()
      setIsLiked(result.isLiked)
      setLikeCount(result.likeCount)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để share bài đăng')
      return
    }
    
    try {
      await dispatch(sharePost(post._id)).unwrap()
      
      // Copy link to clipboard
      const postUrl = `${window.location.origin}/posts/${post._id}`
      await navigator.clipboard.writeText(postUrl)
      alert('Đã copy link bài đăng!')
    } catch (error) {
      console.error('Error sharing post:', error)
    }
  }

  const handleSave = async () => {
    // TODO: Implement save to collection
    alert('Tính năng đang phát triển')
  }

  const caption = post.caption || ''
  const shouldTruncate = caption.length > 150
  const displayCaption = shouldTruncate && !showFullCaption 
    ? caption.substring(0, 150) + '...' 
    : caption

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/users/${post.userId._id}/profile`} className="flex items-center space-x-3">
          <img
            src={post.userId.avatar || 'https://via.placeholder.com/40'}
            alt={post.userId.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {post.userId.nickname || post.userId.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </Link>
        {post.location && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {post.location === 'Campus' ? '🏫' : post.location === 'Dormitory' ? '🏠' : '📍'}
          </span>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="relative group">
          <Link to={`/posts/${post._id}`}>
            <img
              src={post.images[currentImageIndex]}
              alt={post.caption}
              className="w-full max-h-96 object-cover cursor-pointer"
              loading="lazy"
            />
          </Link>
          
          {/* Multiple images indicator */}
          {post.images.length > 1 && (
            <>
              {/* Previous button */}
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(currentImageIndex - 1)
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>
              )}
              
              {/* Next button */}
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(currentImageIndex + 1)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh sau"
                >
                  ›
                </button>
              )}
              
              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1}/{post.images.length}
              </div>
              
              {/* Dots indicator */}
              {post.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                      aria-label={`Xem ảnh ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              {isLiked ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">{likeCount}</span>
            </button>
            <Link
              to={`/posts/${post._id}`}
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{post.commentCount || 0}</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{post.shareCount || 0}</span>
            </button>
          </div>
          <button
            onClick={handleSave}
            className="hover:opacity-70 transition-opacity"
          >
            <BookmarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Caption */}
        {caption && (
          <div className="mb-2">
            <Link
              to={`/users/${post.userId._id}/profile`}
              className="font-semibold text-gray-800 dark:text-gray-200 mr-2"
            >
              {post.userId.nickname || post.userId.name}
            </Link>
            <span 
              className="text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {displayCaption}
            </span>
            {shouldTruncate && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-gray-500 dark:text-gray-400 ml-1 text-sm"
              >
                {showFullCaption ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.hashtags.map((tag, index) => (
              <Link
                key={index}
                to={`/hashtags/${tag}`}
                className="text-blue-500 dark:text-blue-400 text-sm hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Price, Category and Condition */}
        {(post.price || post.category || post.condition) && (
          <div className="space-y-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {post.price && (
              <div className="text-lg font-bold text-orange-500">
                {formatPrice(post.price)} VNĐ
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {post.category && (
                <span>
                  Danh mục: <span className="font-medium">{getCategoryLabel(post.category)}</span>
                </span>
              )}
              {post.condition && (
                <span>
                  Tình trạng: <span className="font-medium">{getConditionLabel(post.condition)}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* View comments */}
        {post.commentCount > 0 && (
          <Link
            to={`/posts/${post._id}`}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2 block hover:underline"
          >
            Xem tất cả {post.commentCount} bình luận
          </Link>
        )}

        {/* Link to Product if exists */}
        {post.productId && (
          <Link
            to={`/products/${post.productId._id || post.productId}`}
            className="mt-3 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Xem chi tiết sản phẩm →
          </Link>
        )}
      </div>
    </div>
  )
}

