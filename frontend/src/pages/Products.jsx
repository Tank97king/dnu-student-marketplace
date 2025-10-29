import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'

export default function Products() {
  const dispatch = useDispatch()
  const { products, loading, pagination } = useSelector(state => state.product)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  })

  useEffect(() => {
    dispatch(fetchProducts(filters))
  }, [dispatch, filters])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Danh sách sản phẩm</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                name="search"
                placeholder="Tìm kiếm..."
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <select
                name="category"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả danh mục</option>
                <option value="Books">Sách</option>
                <option value="Electronics">Điện tử</option>
                <option value="Furniture">Nội thất</option>
                <option value="Clothing">Quần áo</option>
                <option value="Stationery">Văn phòng phẩm</option>
                <option value="Sports">Thể thao</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div>
              <select
                name="location"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={filters.location}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả khu vực</option>
                <option value="Campus">Khuôn viên</option>
                <option value="Dormitory">Ký túc xá</option>
                <option value="Nearby">Lân cận</option>
              </select>
            </div>
            <div>
              <select
                name="sort"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                onChange={(e) => dispatch(fetchProducts({ ...filters, sort: e.target.value }))}
              >
                <option value="-createdAt">Mới nhất</option>
                <option value="createdAt">Cũ nhất</option>
                <option value="price">Giá thấp đến cao</option>
                <option value="-price">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-800 dark:text-gray-200">Đang tải...</div>
        ) : products?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800 dark:text-gray-200">{product.title}</h3>
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">{product.price?.toLocaleString()} VNĐ</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {product.location === 'Campus' ? '🏫 Khuôn viên' :
                         product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination?.pages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => dispatch(fetchProducts({ ...filters, page: i + 1 }))}
                    className="px-4 py-2 border dark:border-gray-600 rounded-md hover:bg-primary-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  )
}






