import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'
import SearchAutocomplete from '../components/SearchAutocomplete'

export default function Products() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { products, loading, pagination } = useSelector(state => state.product)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    dateRange: '', // 'today', 'week', 'month', 'all'
    subcategory: '',
    minRating: '',
    tags: ''
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000000]) // Min và Max giá
  
  // Subcategories cho tất cả các danh mục
  const categorySubcategories = {
    Electronics: [
      { value: '', label: 'Tất cả loại điện tử' },
      { value: 'điện thoại smartphone iphone android', label: 'Điện thoại' },
      { value: 'máy tính bảng tablet ipad', label: 'Máy tính bảng' },
      { value: 'laptop máy tính xách tay notebook', label: 'Laptop' },
      { value: 'máy tính để bàn desktop pc', label: 'Máy tính để bàn' },
      { value: 'máy ảnh camera máy quay camcorder', label: 'Máy ảnh, Máy quay' },
      { value: 'tivi tv âm thanh loa speaker', label: 'Tivi, Âm thanh' },
      { value: 'đồng hồ thông minh smartwatch thiết bị đeo', label: 'Thiết bị đeo thông minh' },
      { value: 'màn hình monitor phụ kiện điện tử', label: 'Phụ kiện (Màn hình,...)' },
      { value: 'ram cpu card linh kiện', label: 'Linh kiện (RAM,...)' }
    ],
    Books: [
      { value: '', label: 'Tất cả loại sách' },
      { value: 'giáo trình đại học môn học ngành', label: 'Sách giáo trình đại học' },
      { value: 'tham khảo bài tập đề cương ôn thi', label: 'Sách tham khảo, bài tập, đề cương' },
      { value: 'ngoại ngữ toeic ielts hsk', label: 'Sách ngoại ngữ (TOEIC, IELTS, HSK)' },
      { value: 'kỹ năng sống khởi nghiệp', label: 'Sách kỹ năng sống, khởi nghiệp' },
      { value: 'tiểu thuyết truyện light novel manga', label: 'Tiểu thuyết, truyện, light novel, manga' },
      { value: 'tạp chí học lập trình marketing', label: 'Tạp chí, sách học lập trình, marketing' }
    ],
    Clothing: [
      { value: '', label: 'Tất cả loại quần áo' },
      { value: 'áo thun áo sơ mi áo khoác', label: 'Áo thun, áo sơ mi, áo khoác' },
      { value: 'quần jeans quần tây quần thể thao', label: 'Quần jeans, quần tây, quần thể thao' },
      { value: 'đồ mùa đông áo hoodie', label: 'Đồ mùa đông, áo hoodie' },
      { value: 'đồng phục sinh viên áo khoác khoa áo lớp', label: 'Đồng phục sinh viên, áo khoác khoa, áo lớp' },
      { value: 'giày dép balo túi xách', label: 'Giày, dép, balo, túi xách' },
      { value: 'phụ kiện mũ nón đồng hồ thắt lưng', label: 'Phụ kiện: mũ, nón, đồng hồ, thắt lưng' }
    ],
    Stationery: [
      { value: '', label: 'Tất cả loại văn phòng phẩm' },
      { value: 'bút bi bút chì bút highlight', label: 'Bút các loại (bút bi, bút chì, bút highlight)' },
      { value: 'tập vở sổ tay giấy note', label: 'Tập vở, sổ tay, giấy note' },
      { value: 'file tài liệu bìa hồ sơ kẹp giấy', label: 'File tài liệu, bìa hồ sơ, kẹp giấy' },
      { value: 'máy tính cầm tay thước compa', label: 'Máy tính cầm tay, thước, compa' },
      { value: 'bảng vẽ kẹp tài liệu khay để bút', label: 'Bảng vẽ, kẹp tài liệu, khay để bút' },
      { value: 'handmade sổ bullet journal sticker', label: 'Sản phẩm handmade học tập (sổ bullet journal, sticker...)' }
    ],
    Sports: [
      { value: '', label: 'Tất cả loại thể thao' },
      { value: 'bóng đá giày bóng áo đấu', label: 'Bóng đá: giày, bóng, áo đấu' },
      { value: 'cầu lông vợt cầu túi thể thao', label: 'Cầu lông: vợt, cầu, túi thể thao' },
      { value: 'gym yoga thảm tập găng tay dây kháng lực', label: 'Gym – Yoga: thảm tập, găng tay, dây kháng lực' },
      { value: 'xe đạp nón bảo hiểm chai nước thể thao', label: 'Xe đạp, nón bảo hiểm, chai nước thể thao' },
      { value: 'đồ bơi kính bơi áo khoác thể thao', label: 'Đồ bơi, kính bơi, áo khoác thể thao' },
      { value: 'đồng hồ đếm bước dây nhảy thiết bị', label: 'Thiết bị nhỏ: đồng hồ đếm bước, dây nhảy' }
    ],
    Furniture: [
      { value: '', label: 'Tất cả loại nội thất' },
      { value: 'giường nệm chăn ga gối', label: 'Giường, nệm, chăn ga gối' },
      { value: 'bàn học ghế học đèn bàn', label: 'Bàn học, ghế học, đèn bàn' },
      { value: 'tủ quần áo kệ sách tab đầu giường', label: 'Tủ quần áo, kệ sách, tab đầu giường' },
      { value: 'rèm cửa gương thảm trải sàn', label: 'Rèm cửa, gương, thảm trải sàn' },
      { value: 'bàn ăn mini ghế xếp', label: 'Bàn ăn mini, ghế xếp' },
      { value: 'tủ lạnh mini kệ chén bếp điện nhỏ', label: 'Tủ lạnh mini, kệ chén, bếp điện nhỏ' },
      { value: 'kệ để đồ giá phơi quần áo', label: 'Kệ để đồ, giá phơi quần áo' },
      { value: 'thùng rác kệ giày dép hộp nhựa đựng đồ', label: 'Thùng rác, kệ giày dép, hộp nhựa đựng đồ' },
      { value: 'tranh treo tường cây cảnh nhỏ', label: 'Tranh treo tường, cây cảnh nhỏ' },
      { value: 'đồng hồ treo đèn ngủ', label: 'Đồng hồ treo, đèn ngủ' },
      { value: 'kệ treo tường giá đỡ điện thoại laptop', label: 'Kệ treo tường, giá đỡ điện thoại/laptop' },
      { value: 'thảm móc treo phụ kiện decor', label: 'Thảm, móc treo, phụ kiện decor nhỏ' }
    ]
  }

  // Lấy subcategories theo category hiện tại
  const currentSubcategories = categorySubcategories[filters.category] || []
  const hasSubcategories = currentSubcategories.length > 0

  // Đọc query params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const search = params.get('search') || ''
    const category = params.get('category') || ''
    
    setFilters(prev => ({
      ...prev,
      search,
      category
    }))
  }, [location.search])

  useEffect(() => {
    dispatch(fetchProducts(filters))
  }, [dispatch, filters])

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value }
    
    // Nếu đổi category
    if (e.target.name === 'category') {
      // Reset subcategory khi đổi category
      newFilters.subcategory = ''
      
      // Nếu search term đang là từ subcategory cũ, xóa nó
      const oldCategorySubcategories = categorySubcategories[filters.category] || []
      const isSubcategorySearch = oldCategorySubcategories.some(sc => sc.value && filters.search === sc.value)
      if (isSubcategorySearch) {
        newFilters.search = ''
      }
    }
    
    // Nếu đổi subcategory, cập nhật search term
    if (e.target.name === 'subcategory') {
      const categorySubcats = categorySubcategories[newFilters.category] || []
      const selectedSubcategory = categorySubcats.find(sc => sc.value === e.target.value)
      if (selectedSubcategory && selectedSubcategory.value) {
        newFilters.search = selectedSubcategory.value
      } else {
        // Nếu chọn "Tất cả loại...", xóa search term từ subcategory
        const categorySubcatsOld = categorySubcategories[filters.category] || []
        const isSubcategorySearch = categorySubcatsOld.some(sc => sc.value && filters.search === sc.value)
        if (isSubcategorySearch) {
          newFilters.search = ''
        }
      }
    }
    
    // Nếu đổi dateRange, cập nhật filter
    if (e.target.name === 'dateRange') {
      const now = new Date()
      let startDate = null
      
      switch (e.target.value) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = null
      }
      
      if (startDate) {
        newFilters.dateRange = startDate.toISOString()
      } else {
        newFilters.dateRange = ''
      }
    }
    
    // Cập nhật minPrice và maxPrice từ priceRange
    if (e.target.name === 'priceRange') {
      const [min, max] = priceRange
      newFilters.minPrice = min > 0 ? min : ''
      newFilters.maxPrice = max < 10000000 ? max : ''
    }
    
    setFilters(newFilters)
  }

  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value)
    const name = e.target.name
    
    if (name === 'minPrice') {
      setPriceRange([value, priceRange[1]])
      setFilters({ ...filters, minPrice: value > 0 ? value : '' })
    } else {
      setPriceRange([priceRange[0], value])
      setFilters({ ...filters, maxPrice: value < 10000000 ? value : '' })
    }
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Danh sách sản phẩm</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bộ lọc</h2>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {showAdvancedFilters ? 'Ẩn' : 'Hiện'} bộ lọc nâng cao
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${hasSubcategories ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
            <div>
              <SearchAutocomplete
                value={filters.search}
                onChange={(value) => setFilters({ ...filters, search: value })}
                onSelect={(value) => setFilters({ ...filters, search: value })}
                placeholder="Tìm kiếm..."
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
            {/* Subcategory dropdown hiển thị khi category có subcategories */}
            {hasSubcategories && (
              <div>
                <select
                  name="subcategory"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={filters.subcategory}
                  onChange={handleFilterChange}
                >
                  {currentSubcategories.map((subcat) => (
                    <option key={subcat.value} value={subcat.value}>
                      {subcat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                <option value="relevance">Phù hợp nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Khoảng giá: {priceRange[0].toLocaleString('vi-VN')} ₫ - {priceRange[1].toLocaleString('vi-VN')} ₫
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Giá tối thiểu"
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      value={filters.minPrice}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : 0
                        setPriceRange([value, priceRange[1]])
                        setFilters({ ...filters, minPrice: e.target.value })
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Giá tối đa"
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : 10000000
                        setPriceRange([priceRange[0], value])
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setPriceRange([value, priceRange[1]])
                    setFilters({ ...filters, minPrice: value > 0 ? value : '' })
                  }}
                  className="w-full mt-2"
                />
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setPriceRange([priceRange[0], value])
                    setFilters({ ...filters, maxPrice: value < 10000000 ? value : '' })
                  }}
                  className="w-full mt-2"
                />
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tình trạng
                </label>
                <select
                  name="condition"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={filters.condition}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả tình trạng</option>
                  <option value="Rất tốt">Rất tốt</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Đã dùng nhiều">Đã dùng nhiều</option>
                  <option value="Cần sửa chữa">Cần sửa chữa</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Thời gian đăng
                </label>
                <select
                  name="dateRange"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Đánh giá tối thiểu
                </label>
                <select
                  name="minRating"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả đánh giá</option>
                  <option value="4">4 sao trở lên</option>
                  <option value="3">3 sao trở lên</option>
                  <option value="2">2 sao trở lên</option>
                  <option value="1">1 sao trở lên</option>
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  name="tags"
                  placeholder="Ví dụ: laptop, gaming, mới"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                  value={filters.tags}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-800 dark:text-gray-200">Đang tải...</div>
        ) : products?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
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






