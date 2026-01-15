import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPost, likePost, deletePost } from '../store/slices/postSlice'
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import api from '../utils/api'

export default function PostDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { post, loading } = useSelector(state => state.post)
  const { user } = useSelector(state => state.auth)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      dispatch(fetchPost(id))
      loadComments()
    }
  }, [id, dispatch])

  useEffect(() => {
    if (post && user) {
      setIsLiked(post.likes?.some(like => like.toString() === user.id || like._id === user.id) || false)
    }
  }, [post, user])

  const loadComments = async () => {
    try {
      const response = await api.get(`/posts/${id}/comments`)
      setComments(response.data.data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để like bài đăng')
      return
    }
    try {
      const result = await dispatch(likePost(id)).unwrap()
      setIsLiked(result.isLiked)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await api.post(`/posts/${id}/comments`, { content: newComment })
      setNewComment('')
      loadComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Lỗi khi đăng bình luận')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài đăng này?')) return

    try {
      await dispatch(deletePost(id)).unwrap()
      navigate('/feed')
    } catch (error) {
      alert('Lỗi khi xóa bài đăng')
    }
  }

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

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  if (!post) {
    return <div className="text-center py-8">Không tìm thấy bài đăng</div>
  }

  const canDelete = user && (user.id === post.userId._id || user.isAdmin)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
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
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </Link>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="relative max-h-[600px] overflow-hidden">
            <img
              src={post.images[currentImageIndex]}
              alt={post.caption}
              className="w-full h-full max-h-[600px] object-contain"
              loading="lazy"
            />
            {post.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(post.images.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === post.images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {post.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
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
                <span className="text-sm text-gray-600 dark:text-gray-400">{post.likeCount || 0}</span>
              </button>
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{post.commentCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{post.shareCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
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
                {post.caption}
              </span>
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
            <div className="space-y-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {post.price && (
                <div className="text-xl font-bold text-orange-500">
                  {formatPrice(post.price)} VNĐ
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {post.category && (
                  <span>
                    Danh mục: <span className="font-medium text-gray-700 dark:text-gray-300">{getCategoryLabel(post.category)}</span>
                  </span>
                )}
                {post.condition && (
                  <span>
                    Tình trạng: <span className="font-medium text-gray-700 dark:text-gray-300">{getConditionLabel(post.condition)}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Link to Product if exists */}
          {post.productId && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/products/${post.productId._id || post.productId}`}
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Xem chi tiết sản phẩm →
              </Link>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="p-4">
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {comments.map(comment => (
              <div key={comment._id} className="flex items-start space-x-3">
                <img
                  src={comment.userId?.avatar || 'https://via.placeholder.com/32'}
                  alt={comment.userId?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {comment.userId?.nickname || comment.userId?.name}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleComment} className="flex items-center space-x-2">
              <img
                src={user.avatar || 'https://via.placeholder.com/32'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Đăng
              </button>
            </form>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-blue-500 hover:underline">Đăng nhập</Link> để bình luận
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

