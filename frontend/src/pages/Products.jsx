import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'
import SearchAutocomplete from '../components/SearchAutocomplete'
import api from '../utils/api'

export default function Products() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { products, loading, pagination } = useSelector(state => state.product)
  // Khởi tạo filters từ URL params ngay từ đầu
  const getInitialFilters = () => {
    const params = new URLSearchParams(location.search)
    return {
      search: params.get('search') || '',
      category: params.get('category') || '',
      location: params.get('location') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      condition: params.get('condition') || '',
      dateRange: params.get('dateRange') || '',
      subcategory: params.get('subcategory') || '',
      minRating: params.get('minRating') || '',
      tags: params.get('tags') || ''
    }
  }

  const [filters, setFilters] = useState(getInitialFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000000]) // Min và Max giá
  // --- Semantic Search state ---
  const [semanticResults, setSemanticResults] = useState(null)
  const [semanticLoading, setSemanticLoading] = useState(false)
  const [semanticQuery, setSemanticQuery] = useState('')
  const [semanticAiEnabled, setSemanticAiEnabled] = useState(false)
  
  // Subcategories cho tất cả các danh mục
  const categorySubcategories = {
    'Điện tử': [
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
    'Sách': [
      { value: '', label: 'Tất cả loại sách' },
      { value: 'giáo trình đại học môn học ngành', label: 'Sách giáo trình đại học' },
      { value: 'tham khảo bài tập đề cương ôn thi', label: 'Sách tham khảo, bài tập, đề cương' },
      { value: 'ngoại ngữ toeic ielts hsk', label: 'Sách ngoại ngữ (TOEIC, IELTS, HSK)' },
      { value: 'kỹ năng sống khởi nghiệp', label: 'Sách kỹ năng sống, khởi nghiệp' },
      { value: 'tiểu thuyết truyện light novel manga', label: 'Tiểu thuyết, truyện, light novel, manga' },
      { value: 'tạp chí học lập trình marketing', label: 'Tạp chí, sách học lập trình, marketing' }
    ],
    'Quần áo': [
      { value: '', label: 'Tất cả loại quần áo' },
      { value: 'áo thun áo sơ mi áo khoác', label: 'Áo thun, áo sơ mi, áo khoác' },
      { value: 'quần jeans quần tây quần thể thao', label: 'Quần jeans, quần tây, quần thể thao' },
      { value: 'đồ mùa đông áo hoodie', label: 'Đồ mùa đông, áo hoodie' },
      { value: 'đồng phục sinh viên áo khoác khoa áo lớp', label: 'Đồng phục sinh viên, áo khoác khoa, áo lớp' },
      { value: 'giày dép balo túi xách', label: 'Giày, dép, balo, túi xách' },
      { value: 'phụ kiện mũ nón đồng hồ thắt lưng', label: 'Phụ kiện: mũ, nón, đồng hồ, thắt lưng' }
    ],
    'Văn phòng phẩm': [
      { value: '', label: 'Tất cả loại văn phòng phẩm' },
      { value: 'bút bi bút chì bút highlight', label: 'Bút các loại (bút bi, bút chì, bút highlight)' },
      { value: 'tập vở sổ tay giấy note', label: 'Tập vở, sổ tay, giấy note' },
      { value: 'file tài liệu bìa hồ sơ kẹp giấy', label: 'File tài liệu, bìa hồ sơ, kẹp giấy' },
      { value: 'máy tính cầm tay thước compa', label: 'Máy tính cầm tay, thước, compa' },
      { value: 'bảng vẽ kẹp tài liệu khay để bút', label: 'Bảng vẽ, kẹp tài liệu, khay để bút' },
      { value: 'handmade sổ bullet journal sticker', label: 'Sản phẩm handmade học tập (sổ bullet journal, sticker...)' }
    ],
    'Thể thao': [
      { value: '', label: 'Tất cả loại thể thao' },
      { value: 'bóng đá giày bóng áo đấu', label: 'Bóng đá: giày, bóng, áo đấu' },
      { value: 'cầu lông vợt cầu túi thể thao', label: 'Cầu lông: vợt, cầu, túi thể thao' },
      { value: 'gym yoga thảm tập găng tay dây kháng lực', label: 'Gym – Yoga: thảm tập, găng tay, dây kháng lực' },
      { value: 'xe đạp nón bảo hiểm chai nước thể thao', label: 'Xe đạp, nón bảo hiểm, chai nước thể thao' },
      { value: 'đồ bơi kính bơi áo khoác thể thao', label: 'Đồ bơi, kính bơi, áo khoác thể thao' },
      { value: 'đồng hồ đếm bước dây nhảy thiết bị', label: 'Thiết bị nhỏ: đồng hồ đếm bước, dây nhảy' }
    ],
    'Nội thất': [
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

  // Đọc query params từ URL khi URL thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const newFilters = {
      search: params.get('search') || '',
      category: params.get('category') || '',
      location: params.get('location') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      condition: params.get('condition') || '',
      dateRange: params.get('dateRange') || '',
      subcategory: params.get('subcategory') || '',
      minRating: params.get('minRating') || '',
      tags: params.get('tags') || ''
    }
    setFilters(newFilters)
  }, [location.search])

  // Fetch products khi filters thay đổi
  useEffect(() => {
    // Chỉ gửi các params có giá trị (không gửi empty string)
    const paramsToSend = {}
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        paramsToSend[key] = filters[key]
      }
    })
    
    dispatch(fetchProducts(paramsToSend))
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

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim() || semanticLoading) return
    setSemanticLoading(true)
    try {
      const res = await api.post('/search/semantic', { query: semanticQuery.trim() })
      setSemanticResults(res.data?.data ?? [])
      setSemanticAiEnabled(res.data?.aiEnabled ?? false)
    } catch (e) {
      setSemanticResults([])
      alert(e.response?.data?.message || 'Không thể tìm kiếm. Thử lại sau.')
    } finally {
      setSemanticLoading(false)
    }
  }

  const displayProducts = semanticResults !== null ? semanticResults : products
  const isSemanticSearch = semanticResults !== null

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Danh sách sản phẩm</h1>

        {/* Tìm kiếm Semantic AI */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">🧠 Tìm theo <b>ý nghĩa</b> — gõ "đồ ấm mùa đông" có thể ra "áo hoodie", "chăn bông"...</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ví dụ: đồ ấm mùa đông, thiết bị học tập sinh viên..."
              className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500"
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSemanticSearch())}
            />
            <button
              type="button"
              disabled={semanticLoading || !semanticQuery.trim()}
              onClick={handleSemanticSearch}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
            >
              {semanticLoading ? 'Đang tìm...' : '🧠 Tìm ngữ nghĩa'}
            </button>
          </div>
        </div>

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
                onChange={(value) => { setFilters({ ...filters, search: value }); }}
                onSelect={(value) => { setFilters({ ...filters, search: value }); }}
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
                <option value="Sách">Sách</option>
                <option value="Điện tử">Điện tử</option>
                <option value="Nội thất">Nội thất</option>
                <option value="Quần áo">Quần áo</option>
                <option value="Văn phòng phẩm">Văn phòng phẩm</option>
                <option value="Thể thao">Thể thao</option>
                <option value="Khác">Khác</option>
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
        {isSemanticSearch && (
          <div className="mb-4 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              🧠 Kết quả ngữ nghĩa: &quot;{semanticQuery}&quot; — {displayProducts?.length ?? 0} sản phẩm
              {!semanticAiEnabled && <span className="ml-2 text-xs text-gray-500">(Chế độ thường — chưa có embedding)</span>}
            </p>
            <button
              type="button"
              onClick={() => { setSemanticResults(null); setSemanticQuery(''); }}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline ml-4"
            >
              ✕ Xóa
            </button>
          </div>
        )}
        {loading && !isSemanticSearch ? (
          <div className="text-center py-12 text-gray-800 dark:text-gray-200">Đang tải...</div>
        ) : semanticLoading ? (
          <div className="text-center py-12 text-purple-600 dark:text-purple-400">🧠 Đang phân tích ngữ nghĩa...</div>
        ) : displayProducts?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayProducts.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full relative">
                    {/* Badge AI Match (chỉ khi Semantic Search) */}
                    {isSemanticSearch && product.aiScore != null && semanticAiEnabled && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${
                          product.aiScore >= 80 ? 'bg-purple-600 text-white'
                          : product.aiScore >= 60 ? 'bg-purple-400 text-white'
                          : 'bg-gray-400 text-white'
                        }`}>
                          🧠 {product.aiScore}% phù hợp
                        </span>
                      </div>
                    )}
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

            {/* Pagination - chỉ khi không phải tìm kiếm AI */}
            {!isSemanticSearch && pagination?.pages > 1 && (
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






