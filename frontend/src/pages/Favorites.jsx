import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchFavorites, removeFromFavorites } from '../store/slices/userSlice'

export default function Favorites() {
  const dispatch = useDispatch()
  const { favorites, loading } = useSelector(state => state.user)
  const { user } = useSelector(state => state.auth)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites())
    }
  }, [dispatch, user])

  const handleRemoveFavorite = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
      return
    }

    setRemovingId(productId)
    try {
      await dispatch(removeFromFavorites(productId)).unwrap()
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Không thể xóa sản phẩm khỏi danh sách yêu thích')
    } finally {
      setRemovingId(null)
    }
  }

  const getFavoriteProducts = () => {
    if (!favorites || favorites.length === 0) return []
    // Favorites can be array of product objects or array of IDs
    return favorites.filter(fav => fav && (typeof fav === 'object' ? fav.title : false))
  }

  const favoriteProducts = getFavoriteProducts()

  if (!user) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Vui lòng đăng nhập để xem sản phẩm đã lưu</p>
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Sản phẩm đã lưu</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-800 dark:text-gray-200">Đang tải...</div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => {
              const productId = product._id || product
              const productData = typeof product === 'object' ? product : null
              
              // If product is not populated, we can't display it properly
              if (!productData) {
                return null
              }

              return (
                <div key={productId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                  <button
                    onClick={() => handleRemoveFavorite(productId)}
                    disabled={removingId === productId}
                    className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    {removingId === productId ? (
                      <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <Link to={`/products/${productId}`}>
                    <img
                      src={productData.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={productData.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800 dark:text-gray-200">{productData.title}</h3>
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                        {productData.price?.toLocaleString()} VNĐ
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {productData.location === 'Campus' ? '🏫 Khuôn viên' :
                         productData.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                      </p>
                      {productData.status === 'Sold' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          Đã bán
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Bạn chưa lưu sản phẩm nào</p>
            <Link to="/products" className="text-primary-600 dark:text-primary-400 hover:underline">
              Xem sản phẩm ngay →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

