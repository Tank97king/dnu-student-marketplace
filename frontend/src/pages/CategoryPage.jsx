import React, { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function CategoryPage() {
  const { categoryName } = useParams()
  const navigate = useNavigate()

  // Mapping category name từ URL sang category value
  const categoryMap = {
    'Electronics': 'Electronics',
    'Books': 'Books',
    'Furniture': 'Furniture',
    'Clothing': 'Clothing',
    'Stationery': 'Stationery',
    'Sports': 'Sports',
    'Other': 'Other'
  }

  const categoryValue = categoryMap[categoryName] || categoryName

  // Redirect nếu không phải Electronics
  useEffect(() => {
    if (categoryValue !== 'Electronics') {
      navigate(`/products?category=${categoryValue}`, { replace: true })
    }
  }, [categoryValue, navigate])

  // Chỉ hiển thị trang nếu là Electronics
  if (categoryValue !== 'Electronics') {
    return null
  }

  // Subcategories cho Điện tử
  const electronicsSubcategories = [
    {
      name: 'Điện thoại',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'điện thoại smartphone iphone android'
    },
    {
      name: 'Máy tính bảng',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'máy tính bảng tablet ipad'
    },
    {
      name: 'Laptop',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'laptop máy tính xách tay notebook'
    },
    {
      name: 'Máy tính để bàn',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'máy tính để bàn desktop pc máy tính'
    },
    {
      name: 'Máy ảnh, Máy quay',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      searchTerm: 'máy ảnh camera máy quay camcorder'
    },
    {
      name: 'Tivi, Âm thanh',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'tivi tv âm thanh loa speaker'
    },
    {
      name: 'Thiết bị đeo thông minh',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      searchTerm: 'đồng hồ thông minh smartwatch thiết bị đeo'
    },
    {
      name: 'Phụ kiện (Màn hình,...)',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      searchTerm: 'màn hình monitor phụ kiện phụ kiện điện tử'
    },
    {
      name: 'Linh kiện (RAM,...)',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      searchTerm: 'ram cpu card màn hình linh kiện'
    }
  ]

  // Category names mapping
  const categoryNames = {
    'Electronics': 'Điện tử',
    'Books': 'Sách',
    'Furniture': 'Nội thất',
    'Clothing': 'Quần áo',
    'Stationery': 'Văn phòng phẩm',
    'Sports': 'Thể thao',
    'Other': 'Khác'
  }

  const categoryDisplayName = categoryNames[categoryValue] || categoryValue

  const handleSubcategoryClick = (subcategory) => {
    // Khi click vào subcategory, điều hướng đến trang products với filter
    const params = new URLSearchParams()
    params.append('category', categoryValue)
    params.append('search', subcategory.searchTerm)
    navigate(`/products?${params.toString()}`)
  }

  const handleViewAll = () => {
    navigate(`/products?category=${categoryValue}`)
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">DNU Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200">{categoryDisplayName}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200">{categoryDisplayName} Hà Nội</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {categoryDisplayName} chính hãng, giá rẻ Hà Nội 11/2025
        </h1>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Lọc</span>
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <span className="text-primary-800 dark:text-primary-200">{categoryDisplayName}</span>
              <button 
                onClick={handleViewAll}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <select className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none">
              <option>Giá</option>
            </select>

            <select className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none">
              <option>Tình trạng</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span onClick={handleViewAll}>Xóa lọc</span>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {electronicsSubcategories.map((subcategory, index) => (
            <button
              key={index}
              onClick={() => handleSubcategoryClick(subcategory)}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center group border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
            >
              <div className="flex justify-center mb-3 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {subcategory.icon}
              </div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {subcategory.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

