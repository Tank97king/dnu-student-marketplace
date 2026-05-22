import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productSlice'
import ProductRecommendations from '../components/ProductRecommendations'
import api from '../utils/api'

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { products, loading } = useSelector(state => state.product)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [categoryProducts, setCategoryProducts] = useState({})
  const [categoryLoading, setCategoryLoading] = useState({})
  // --- Semantic Search ---
  const [semanticResults, setSemanticResults] = useState(null)
  const [semanticLoading, setSemanticLoading] = useState(false)
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
  const currentSubcategories = categorySubcategories[selectedCategory] || []
  const hasSubcategories = currentSubcategories.length > 0

  // Lưu ý: backend đang lưu category bằng tiếng Việt (Sách, Điện tử, ...)
  // `value` dùng để filter API /products?category=...
  // Riêng "Điện tử" vẫn có route riêng `/category/Electronics` (nếu đang dùng ở app)
  const categories = [
    { name: 'Sách', icon: '📚', image: '/categories/sách.jpg', value: 'Sách' },
    { name: 'Điện tử', icon: '💻', image: '/categories/điện tử.jpg', value: 'Điện tử', routeValue: 'Electronics' },
    { name: 'Nội thất', icon: '🪑', image: '/categories/nội thất.jpg', value: 'Nội thất' },
    { name: 'Quần áo', icon: '👕', image: '/categories/quần áo.jpg', value: 'Quần áo' },
    { name: 'Văn phòng phẩm', icon: '✏️', image: '/categories/văn phòng phẩm.jpg', value: 'Văn phòng phẩm' },
    { name: 'Thể thao', icon: '⚽', image: '/categories/Thể Thao.jpg', value: 'Thể thao' }
  ]

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setSelectedSubcategory('') // Reset subcategory khi đổi category
  }

  useEffect(() => {
    dispatch(fetchProducts({ limit: 4, sort: '-createdAt' }))
  }, [dispatch])

  // Fetch products for each category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      const categoryValues = categories.map(cat => cat.value)

      for (const categoryValue of categoryValues) {
        setCategoryLoading(prev => ({ ...prev, [categoryValue]: true }))
        try {
          const response = await api.get('/products', {
            params: {
              category: categoryValue,
              limit: 4,
              sort: '-createdAt'
            }
          })
          setCategoryProducts(prev => ({
            ...prev,
            [categoryValue]: response.data.data || []
          }))
        } catch (error) {
          console.error(`Error fetching products for category ${categoryValue}:`, error)
          setCategoryProducts(prev => ({
            ...prev,
            [categoryValue]: []
          }))
        } finally {
          setCategoryLoading(prev => ({ ...prev, [categoryValue]: false }))
        }
      }
    }

    fetchCategoryProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allCategories = [
    { value: '', label: 'Tất cả danh mục' },
    ...categories.map(cat => ({ value: cat.value, label: cat.name }))
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    // Nếu có kết quả semantic đang hiển → navigate sang /products với query
    if (semanticResults) {
      setSemanticResults(null)
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      return
    }
    const params = new URLSearchParams()
    let finalSearchQuery = searchQuery.trim()
    if (selectedSubcategory && !finalSearchQuery) {
      finalSearchQuery = selectedSubcategory
    } else if (selectedSubcategory && finalSearchQuery) {
      finalSearchQuery = `${finalSearchQuery} ${selectedSubcategory}`
    }
    if (finalSearchQuery) params.append('search', finalSearchQuery)
    if (selectedCategory) params.append('category', selectedCategory)
    navigate(`/products?${params.toString()}`)
  }

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim() || semanticLoading) return
    setSemanticLoading(true)
    setSemanticResults(null)
    try {
      const res = await api.post('/search/semantic', { query: searchQuery.trim() })
      setSemanticResults(res.data?.data ?? [])
      setSemanticAiEnabled(res.data?.aiEnabled ?? false)
    } catch (e) {
      alert(e.response?.data?.message || 'Không thể tìm kiếm. Thử lại sau.')
    } finally {
      setSemanticLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  return (
    <div>
      {/* Hero Section với banner - full width breaking out of container */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden">
        <img
          src="./banner.png"
          alt="DNU Marketplace Banner"
          className="w-full h-auto block"
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

      {/* Search Bar + Semantic AI */}
      <div className="pt-6 pb-2 max-w-6xl mx-auto px-4 relative z-20">
        <form onSubmit={handleSearch} className="flex flex-wrap md:flex-nowrap items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden modern-shadow">
          {/* Category Dropdown */}
          <div className="relative flex-shrink-0 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="appearance-none bg-transparent text-gray-800 dark:text-gray-100 px-6 py-5 pr-12 focus:outline-none cursor-pointer font-bold text-sm min-w-[200px] w-full"
            >
              {allCategories.map(cat => (
                <option key={cat.value} value={cat.value} className="bg-white dark:bg-gray-800">{cat.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-orange-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Subcategory Dropdown */}
          {hasSubcategories && (
            <div className="relative flex-shrink-0 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="appearance-none bg-transparent text-gray-800 dark:text-gray-100 px-6 py-5 pr-12 focus:outline-none cursor-pointer font-bold text-sm min-w-[180px] w-full"
              >
                {currentSubcategories.map(subcat => (
                  <option key={subcat.value} value={subcat.value} className="bg-white dark:bg-gray-800">{subcat.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="flex-1 flex items-center bg-transparent min-w-[200px]">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSemanticResults(null); }}
              placeholder="Bạn đang tìm gì hôm nay?"
              className="flex-1 px-4 py-5 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium"
            />
          </div>

          {/* Nút Tìm ngữ nghĩa AI */}
          <button
            type="button"
            title="Tìm kiếm ngữ nghĩa bằng AI"
            disabled={semanticLoading || !searchQuery.trim()}
            onClick={handleSemanticSearch}
            className="px-6 py-5 border-l border-gray-100 dark:border-gray-700 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-40 transition-all flex-shrink-0 flex items-center gap-2 group"
          >
            <div className={`p-1.5 rounded-lg transition-all ${semanticLoading ? 'animate-spin' : 'group-hover:scale-110'}`}>
              {semanticLoading ? '⌛' : '🧠'}
            </div>
            <span className="hidden sm:inline font-bold text-sm">{semanticLoading ? 'Đang nghĩ...' : 'AI'}</span>
          </button>

          {/* Nút Tìm kiếm thường */}
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-5 premium-gradient-orange text-white font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Kết quả Semantic Search hiển ngay dưới thanh search */}
        {semanticResults !== null && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-purple-100 dark:border-purple-800">
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                🧠 Kết quả AI ngữ nghĩa: &quot;{searchQuery}&quot; — {semanticResults.length} sản phẩm
                {!semanticAiEnabled && <span className="ml-2 font-normal text-gray-400 text-xs">(chế độ thường)</span>}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Xem tất cả →
                </button>
                <button type="button" onClick={() => setSemanticResults(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>
            </div>

            {/* Product grid — tối đa 8 sản phẩm */}
            {semanticResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm phù hợp.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3">
                {semanticResults.slice(0, 8).map(product => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    onClick={() => setSemanticResults(null)}
                  >
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative">
                      {/* Badge */}
                      {semanticAiEnabled && product.aiScore != null && (
                        <div className="absolute top-1 left-1 z-10">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${product.aiScore >= 70 ? 'bg-purple-600 text-white'
                              : product.aiScore >= 50 ? 'bg-purple-400 text-white'
                                : 'bg-gray-400 text-white'
                            }`}>
                            {product.aiScore}%
                          </span>
                        </div>
                      )}
                      <div className="w-full h-28 overflow-hidden bg-gray-200 dark:bg-gray-600">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image' }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight mb-1">{product.title}</p>
                        <p className="text-xs font-bold text-orange-500">{formatPrice(product.price)} VNĐ</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Khám phá danh mục</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-primary-500 to-orange-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.value)}`}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden aspect-square"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:#f9fafb">${category.icon}</div>`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="pt-8 pb-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform duration-300 group cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 opacity-10 rounded-2xl group-hover:opacity-20 transition-opacity"></div>
              <span className="text-3xl relative z-10 drop-shadow-sm scale-110">🌟</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
                Sản phẩm mới nhất
              </h2>
              <div className="h-1.5 w-16 bg-gradient-to-r from-green-500 to-emerald-300 rounded-full mt-1"></div>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-800 dark:text-gray-200">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.slice(0, 4).map((product) => (
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

      {/* Products by Category */}
      {categories.map((category, index) => {
        const categoryProds = categoryProducts[category.value] || []
        const isLoading = categoryLoading[category.value]

        // Chỉ hiển thị nếu có sản phẩm hoặc đang loading
        if (!isLoading && categoryProds.length === 0) return null

        // Luân phiên nền giữa xám và trắng
        const bgClass = index % 2 === 0
          ? 'bg-white dark:bg-gray-800'
          : 'bg-gray-50 dark:bg-gray-900'

        return (
          <div key={category.value} className={`pt-8 pb-10 ${bgClass}`}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform duration-300 group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-blue-500 opacity-10 rounded-2xl group-hover:opacity-20 transition-opacity"></div>
                  <span className="text-3xl relative z-10 drop-shadow-sm scale-110">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
                    {category.name}
                  </h2>
                  <div className="h-1.5 w-12 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mt-1"></div>
                </div>
              </div>
              {isLoading ? (
                <div className="text-center text-gray-800 dark:text-gray-200">Đang tải...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryProds.slice(0, 4).map((product) => (
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
                  {categoryProds.length > 0 && (
                    <div className="text-center mt-5">
                      <Link
                        to={`/products?${new URLSearchParams({ category: category.value }).toString()}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                      >
                        Xem tất cả {category.name} →
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}

      {/* Product Recommendations */}
      <div className="pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <ProductRecommendations type="trending" />
          <ProductRecommendations type="latest" />
        </div>
      </div>
    </div>
  )
}

