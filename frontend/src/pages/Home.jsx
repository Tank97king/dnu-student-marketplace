import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'

export default function Home() {
  const dispatch = useDispatch()
  const { products, loading } = useSelector(state => state.product)

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: '-createdAt' }))
  }, [dispatch])

  const categories = [
    { name: 'Sách', icon: '📚' },
    { name: 'Điện tử', icon: '💻' },
    { name: 'Nội thất', icon: '🪑' },
    { name: 'Quần áo', icon: '👕' },
    { name: 'Văn phòng phẩm', icon: '✏️' },
    { name: 'Thể thao', icon: '⚽' }
  ]

  return (
    <div>
      {/* Hero Section với banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '350px' }}>
        <img 
          src="./banner.png" 
          alt="DNU Marketplace Banner" 
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div style="background: linear-gradient(to right, #ff7a00, white, #3b82f6); height: 100%; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h1 style="font-size: 48px; font-weight: bold; color: #1f2937; margin-bottom: 20px;">DNU Marketplace</h1>
                  <p style="font-size: 20px; color: #4b5563; margin-bottom: 30px;">Mua bán đồ dùng cũ dành riêng cho sinh viên Đại học Đại Nam</p>
                  <div style="display: flex; gap: 15px; justify-content: center;">
                    <a href="/products" style="background: white; color: #3b82f6; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Xem sản phẩm</a>
                    <a href="/register" style="background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Đăng ký ngay</a>
                  </div>
                </div>
              </div>
            `;
          }}
        />
      </div>

      {/* Categories */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">Danh mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto px-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.name}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">Sản phẩm mới nhất</h2>
          {loading ? (
            <div className="text-center text-gray-800 dark:text-gray-200">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products?.slice(0, 8).map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/300'} 
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800 dark:text-gray-200">{product.title}</h3>
                      <p className="text-primary-600 dark:text-primary-400 font-bold">{product.price?.toLocaleString()} VNĐ</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {product.location === 'Campus' ? '🏫 Khuôn viên' : 
                         product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/products" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

