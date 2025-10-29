import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { products, loading } = useSelector(state => state.product)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: '-createdAt' }))
  }, [dispatch])

  const categories = [
    { name: 'Sách', icon: '📚', value: 'Books' },
    { name: 'Điện tử', icon: '💻', value: 'Electronics' },
    { name: 'Nội thất', icon: '🪑', value: 'Furniture' },
    { name: 'Quần áo', icon: '👕', value: 'Clothing' },
    { name: 'Văn phòng phẩm', icon: '✏️', value: 'Stationery' },
    { name: 'Thể thao', icon: '⚽', value: 'Sports' }
  ]

  const allCategories = [
    { value: '', label: 'Tất cả danh mục' },
    ...categories.map(cat => ({ value: cat.value, label: cat.name }))
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim())
    }
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    navigate(`/products?${params.toString()}`)
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

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

      {/* Search Bar */}
      <div className="pt-4 pb-6 max-w-6xl mx-auto px-4">
        <form onSubmit={handleSearch} className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden">
          {/* Category Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-transparent text-gray-700 dark:text-gray-200 px-5 py-4 pr-10 border-r border-gray-200 dark:border-gray-600 focus:outline-none cursor-pointer font-semibold text-sm min-w-[200px]"
            >
              {allCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="flex-1 flex items-center bg-transparent">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="flex-1 px-4 py-4 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm"
            />
          </div>
          
          {/* Search Button */}
          <button
            type="submit"
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white transition-colors font-semibold text-sm flex-shrink-0"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="pt-6 pb-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Danh mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto px-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${category.value}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="pt-8 pb-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Sản phẩm mới nhất</h2>
          {loading ? (
            <div className="text-center text-gray-800 dark:text-gray-200">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.slice(0, 8).map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                    <div className="w-full h-48 overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image'} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="p-2 flex flex-col flex-1">
                      <h3 className="product-title font-semibold line-clamp-2 text-gray-800 dark:text-gray-200 min-h-[3rem] leading-tight mb-0">{product.title}</h3>
                      <div className="mt-auto -mt-4">
                        <p className="product-price text-primary-600 dark:text-primary-400 font-bold text-lg leading-tight mb-0.5">{formatPrice(product.price)} VNĐ</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.location === 'Campus' ? '🏫 Khuôn viên' : 
                           product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-5">
            <Link to="/products" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

