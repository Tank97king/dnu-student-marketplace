import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../store/slices/productSlice'
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../store/slices/userSlice'
import api from '../utils/api'
import ReviewSection from '../components/ReviewSection'
import OfferModal from '../components/OfferModal'
import BuyNowModal from '../components/BuyNowModal'
import ShareProduct from '../components/ShareProduct'
import ProductRecommendations from '../components/ProductRecommendations'
import { addToCompare } from '../pages/CompareProducts'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading } = useSelector(state => state.product)
  const { user } = useSelector(state => state.auth)
  const { favorites } = useSelector(state => state.user)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showBuyNowModal, setShowBuyNowModal] = useState(false)

  useEffect(() => {
    dispatch(fetchProduct(id))
    setMainImageIndex(0)
    setCurrentImageIndex(0)
  }, [dispatch, id])

  // Track product view
  useEffect(() => {
    if (user && product && product.userId?._id !== user.id) {
      api.post(`/products/${id}/view`).catch(console.error);
    }
  }, [user, product, id])

  // Load favorites for logged in users
  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites())
    }
  }, [dispatch, user])

  // Check if product is in favorites
  useEffect(() => {
    if (favorites && id) {
      const favoriteIds = favorites.map(fav => typeof fav === 'object' ? fav._id : fav)
      setIsFavorite(favoriteIds.includes(id))
    }
  }, [favorites, id])

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

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu sản phẩm')
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(id)).unwrap()
      } else {
        await dispatch(addToFavorites(id)).unwrap()
      }
      // isFavorite will be updated automatically via useEffect when favorites change
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Không thể cập nhật yêu thích'
      alert(errorMessage)
    }
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

  const nextMainImage = () => {
    if (product?.images) {
      setMainImageIndex((prev) => {
        const newIndex = prev === product.images.length - 1 ? 0 : prev + 1
        setCurrentImageIndex(newIndex)
        return newIndex
      })
    }
  }

  const prevMainImage = () => {
    if (product?.images) {
      setMainImageIndex((prev) => {
        const newIndex = prev === 0 ? product.images.length - 1 : prev - 1
        setCurrentImageIndex(newIndex)
        return newIndex
      })
    }
  }

  const selectMainImage = (index) => {
    setMainImageIndex(index)
    setCurrentImageIndex(index)
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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
    <div className="py-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <nav className="flex text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sản phẩm</Link>
          {product && (
            <>
              <span className="mx-2">/</span>
              <Link 
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
        </nav>
      </div>

      {loading ? (
        <div className="text-center text-gray-900 dark:text-white">Đang tải...</div>
      ) : product ? (
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Images */}
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
                <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg" style={{ minHeight: '300px', maxHeight: '450px' }}>
                  <img
                    src={product.images?.[mainImageIndex] || product.images?.[0] || 'https://via.placeholder.com/500'}
                    alt={product.title}
                    className="w-full h-auto max-w-full max-h-[450px] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(mainImageIndex)}
                    loading="lazy"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  
                  {/* Navigation Buttons */}
                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevMainImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                        aria-label="Ảnh trước"
                      >
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextMainImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                        aria-label="Ảnh sau"
                      >
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {mainImageIndex + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.images.map((img, i) => (
                    <div 
                      key={i} 
                      className={`bg-white dark:bg-gray-800 rounded-lg p-1 border-2 shadow-sm cursor-pointer transition-all ${
                        i === mainImageIndex 
                          ? 'border-orange-500 dark:border-orange-400' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                      onClick={() => selectMainImage(i)}
                    >
                      <img 
                        src={img} 
                        alt={`Product ${i + 1}`} 
                        className="w-full h-20 md:h-24 object-cover rounded hover:opacity-80 transition-opacity" 
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                    product.status === 'Available' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {product.status === 'Available' ? 'Còn hàng' : 'Đã bán'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xl font-bold text-orange-600/80 dark:text-orange-400/80 uppercase">VNĐ</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tình trạng</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <span className="text-orange-500">✨</span> {product.condition}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Khu vực</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    {product.location === 'Campus' ? '🏫' : product.location === 'Dormitory' ? '🏠' : '📍'} {
                      product.location === 'Campus' ? 'Khuôn viên' :
                      product.location === 'Dormitory' ? 'Ký túc xá' : 'Lân cận'
                    }
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Người bán</h3>
                <Link to={`/user/${product.userId?._id}`} className="group flex items-center p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                  <div className="relative">
                    <img
                      src={product.userId?.avatar || 'https://via.placeholder.com/50'}
                      alt={product.userId?.name}
                      className="w-14 h-14 rounded-xl object-cover mr-4 border-2 border-white dark:border-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {product.userId?.name}
                    </p>
                    {product.userId?.studentId && (
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">MSSV: {product.userId.studentId}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {user?.id !== product.userId?._id ? (
                  <>
                    {product.status === 'Available' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowBuyNowModal(true)}
                          className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Mua ngay
                        </button>
                        <button
                          onClick={() => setShowOfferModal(true)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Trả giá
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleChat}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary-200 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Liên hệ người bán
                    </button>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={handleToggleFavorite}
                        className={`flex-1 px-6 py-3 border-2 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                          isFavorite 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {isFavorite ? '❤️ Đã lưu' : '🤍 Yêu thích'}
                      </button>
                      <button
                        onClick={() => {
                          if (addToCompare(id)) {
                            alert('Đã thêm vào danh sách so sánh. Xem tại /compare');
                            navigate('/compare');
                          }
                        }}
                        className="flex-1 px-6 py-3 border-2 border-blue-500/30 dark:border-blue-400/30 text-blue-600 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                      >
                        ⚖️ So sánh
                      </button>
                      <ShareProduct productId={id} productTitle={product.title} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to={`/products/${id}/edit`}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-bold text-center block shadow-lg shadow-primary-200 dark:shadow-none hover:-translate-y-0.5 transition-all"
                    >
                      Chỉnh sửa sản phẩm
                    </Link>
                    <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn đánh dấu sản phẩm này là đã bán?')) {
                            try {
                              await api.put(`/products/${id}/sold`);
                              dispatch(fetchProduct(id));
                              alert('Đã đánh dấu sản phẩm là đã bán');
                            } catch (error) {
                              alert('Không thể cập nhật trạng thái');
                            }
                          }
                        }}
                        className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        Đánh dấu đã bán
                      </button>
                      <Link
                        to="/seller-dashboard"
                        className="flex-1 px-6 py-3 border-2 border-blue-500/30 dark:border-blue-400/30 text-blue-600 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 text-center transition-all"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </div>
                )}
                
                <button className="w-full text-xs font-bold text-red-400 hover:text-red-600 dark:hover:text-red-300 uppercase tracking-widest mt-2 transition-colors">
                  Báo cáo sản phẩm vi phạm
                </button>
              </div>
            </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mô tả sản phẩm</h2>
            <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Reviews Section */}
          <div className="mt-8">
            <ReviewSection 
              productId={id} 
              sellerId={product.userId._id}
              onReviewAdded={(review) => {
                console.log('New review added:', review);
              }}
            />
          </div>

          {/* Product Recommendations */}
          <div className="mt-8 max-w-7xl mx-auto px-4">
            <ProductRecommendations type="ai-similar" productId={id} />
            <ProductRecommendations type="similar" productId={id} />
            <ProductRecommendations type="also-viewed" productId={id} />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-900 dark:text-white">Không tìm thấy sản phẩm</div>
      )}

      {/* Offer Modal */}
      {product && (
        <OfferModal
          product={product}
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onOfferCreated={(offer) => {
            console.log('Offer created:', offer);
            navigate('/orders');
          }}
        />
      )}

      {/* Buy Now Modal */}
      {product && (
        <BuyNowModal
          product={product}
          isOpen={showBuyNowModal}
          onClose={() => setShowBuyNowModal(false)}
          onOrderCreated={(order) => {
            console.log('Order created:', order);
            navigate('/orders');
          }}
        />
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





