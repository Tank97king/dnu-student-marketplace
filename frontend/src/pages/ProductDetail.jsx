import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../store/slices/productSlice'
import api from '../utils/api'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading } = useSelector(state => state.product)
  const { user } = useSelector(state => state.auth)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    dispatch(fetchProduct(id))
  }, [dispatch, id])

  // Load comments separately
  useEffect(() => {
    const loadComments = async () => {
      try {
        console.log('Loading comments for product:', id)
        const response = await api.get(`/products/${id}/comments`)
        console.log('Comments loaded:', response.data.data)
        setComments(response.data.data)
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
    loadComments()
  }, [id])

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal || !product?.images) return
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          setShowImageModal(false)
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, product])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    try {
      console.log('Adding comment:', comment, 'for product:', id)
      const response = await api.post(`/products/${id}/comments`, { content: comment })
      console.log('Comment added successfully:', response.data.data)
      setComments([response.data.data, ...comments])
      setComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Không thể thêm bình luận. Vui lòng đăng nhập để bình luận.')
    }
  }

  const handleEditComment = (comment) => {
    setEditingComment(comment._id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return
    
    try {
      const response = await api.put(`/comments/${commentId}`, { content: editContent })
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data.data : comment
      ))
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating comment:', error)
      alert('Không thể cập nhật bình luận')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
    
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(comments.filter(comment => comment._id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Không thể xóa bình luận')
    }
  }

  const handleChat = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để liên hệ người bán')
      navigate('/login')
      return
    }
    
    if (user.id === product.userId._id) {
      alert('Bạn không thể liên hệ với chính mình')
      return
    }
    
    // Navigate to chat with seller
    navigate(`/chat/${product.userId._id}?productId=${id}`)
  }

  const openImageModal = (index) => {
    setCurrentImageIndex(index)
    setImageZoom(1)
    setShowImageModal(true)
  }

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  const resetZoom = () => {
    setImageZoom(1)
  }

  return (
    <div className="py-6">
      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : product ? (
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/500'}
                alt={product.title}
                className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageModal(0)}
              />
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.images.slice(1, 5).map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt={`Product ${i + 1}`} 
                      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => openImageModal(i + 1)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <p className="text-4xl font-bold text-primary-600 mb-4">
                {product.price?.toLocaleString()} VNĐ
              </p>

              <div className="space-y-3 mb-6">
                <p><span className="font-semibold">Danh mục:</span> {product.category}</p>
                <p><span className="font-semibold">Tình trạng:</span> {product.condition}</p>
                <p><span className="font-semibold">Khu vực:</span> {
                  product.location === 'Campus' ? '🏫 Khuôn viên' :
                  product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'
                }</p>
                <p><span className="font-semibold">Trạng thái:</span> {
                  product.status === 'Available' ? 'Còn hàng' : 'Đã bán'
                }</p>
              </div>

              <h3 className="font-semibold text-lg mb-2">Người bán</h3>
              <div className="flex items-center mb-6">
                <img
                  src={product.userId?.avatar || 'https://via.placeholder.com/50'}
                  alt={product.userId?.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <Link to={`/profile/${product.userId?._id}`} className="font-semibold">
                    {product.userId?.name}
                  </Link>
                  {product.userId?.studentId && (
                    <p className="text-sm text-gray-500">MSSV: {product.userId.studentId}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {user?.id !== product.userId?._id ? (
                  <>
                    <button
                      onClick={handleChat}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                    >
                      Liên hệ người bán
                    </button>
                    <button className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                      ❤️ Yêu thích
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/products/${id}/edit`}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 text-center"
                    >
                      Chỉnh sửa
                    </Link>
                    <button className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                      Đánh dấu đã bán
                    </button>
                  </>
                )}
              </div>

              <button className="w-full mt-4 px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50">
                Báo cáo
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Bình luận ({comments.length})</h2>
            {user ? (
              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Thêm bình luận..."
                  className="w-full px-4 py-2 border rounded-lg mb-2"
                  rows="3"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Gửi bình luận
                </button>
              </form>
            ) : (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-600">Vui lòng đăng nhập để bình luận</p>
                <Link to="/login" className="text-primary-600 hover:underline">
                  Đăng nhập ngay
                </Link>
              </div>
            )}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <img
                          src={comment.userId?.avatar || 'https://via.placeholder.com/30'}
                          className="w-8 h-8 rounded-full mr-2"
                          alt={comment.userId?.name}
                        />
                        <div>
                          <span className="font-semibold">{comment.userId?.name}</span>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons for comment owner */}
                      {user && user.id === comment.userId?._id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Comment content or edit form */}
                    {editingComment === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg mb-2"
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
                      <p className="text-gray-700">{comment.content}</p>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-6 space-y-2">
                        {comment.replies.map((reply, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center mb-1">
                              <img
                                src={reply.userId?.avatar || 'https://via.placeholder.com/24'}
                                className="w-6 h-6 rounded-full mr-2"
                                alt={reply.userId?.name}
                              />
                              <span className="font-semibold text-sm">{reply.userId?.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">Không tìm thấy sản phẩm</div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && product?.images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex flex-col">
            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={zoomOut}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-full text-sm hover:bg-opacity-80"
              >
                {Math.round(imageZoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image Area */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Main Image */}
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.title} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${imageZoom})` }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}

              {/* Thumbnail Navigation */}
              {product.images.length > 1 && (
                <div className="flex justify-center space-x-2 pb-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-white' 
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





