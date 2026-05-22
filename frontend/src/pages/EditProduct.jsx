import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct, updateProduct, deleteProduct } from '../store/slices/productSlice'
import api from '../utils/api'

export default function EditProduct() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading } = useSelector(state => state.product)
  const { user } = useSelector(state => state.auth)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: '',
    location: '',
    tags: '',
    images: []
  })
  const [imageError, setImageError] = useState('')
  const [allImages, setAllImages] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [aiLoadingMeta, setAiLoadingMeta] = useState(false)
  const [aiLoadingDesc, setAiLoadingDesc] = useState(false)

  // Subcategories cho tất cả các danh mục
  const categorySubcategories = {
    'Điện tử': [
      { value: '', label: 'Chọn loại điện tử' },
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
      { value: '', label: 'Chọn loại sách' },
      { value: 'giáo trình đại học môn học ngành', label: 'Sách giáo trình đại học' },
      { value: 'tham khảo bài tập đề cương ôn thi', label: 'Sách tham khảo, bài tập, đề cương' },
      { value: 'ngoại ngữ toeic ielts hsk', label: 'Sách ngoại ngữ (TOEIC, IELTS, HSK)' },
      { value: 'kỹ năng sống khởi nghiệp', label: 'Sách kỹ năng sống, khởi nghiệp' },
      { value: 'tiểu thuyết truyện light novel manga', label: 'Tiểu thuyết, truyện, light novel, manga' },
      { value: 'tạp chí học lập trình marketing', label: 'Tạp chí, sách học lập trình, marketing' }
    ],
    'Quần áo': [
      { value: '', label: 'Chọn loại quần áo' },
      { value: 'áo thun áo sơ mi áo khoác', label: 'Áo thun, áo sơ mi, áo khoác' },
      { value: 'quần jeans quần tây quần thể thao', label: 'Quần jeans, quần tây, quần thể thao' },
      { value: 'đồ mùa đông áo hoodie', label: 'Đồ mùa đông, áo hoodie' },
      { value: 'đồng phục sinh viên áo khoác khoa áo lớp', label: 'Đồng phục sinh viên, áo khoác khoa, áo lớp' },
      { value: 'giày dép balo túi xách', label: 'Giày, dép, balo, túi xách' },
      { value: 'phụ kiện mũ nón đồng hồ thắt lưng', label: 'Phụ kiện: mũ, nón, đồng hồ, thắt lưng' }
    ],
    'Văn phòng phẩm': [
      { value: '', label: 'Chọn loại văn phòng phẩm' },
      { value: 'bút bi bút chì bút highlight', label: 'Bút các loại (bút bi, bút chì, bút highlight)' },
      { value: 'tập vở sổ tay giấy note', label: 'Tập vở, sổ tay, giấy note' },
      { value: 'file tài liệu bìa hồ sơ kẹp giấy', label: 'File tài liệu, bìa hồ sơ, kẹp giấy' },
      { value: 'máy tính cầm tay thước compa', label: 'Máy tính cầm tay, thước, compa' },
      { value: 'bảng vẽ kẹp tài liệu khay để bút', label: 'Bảng vẽ, kẹp tài liệu, khay để bút' },
      { value: 'handmade sổ bullet journal sticker', label: 'Sản phẩm handmade học tập (sổ bullet journal, sticker...)' }
    ],
    'Thể thao': [
      { value: '', label: 'Chọn loại thể thao' },
      { value: 'bóng đá giày bóng áo đấu', label: 'Bóng đá: giày, bóng, áo đấu' },
      { value: 'cầu lông vợt cầu túi thể thao', label: 'Cầu lông: vợt, cầu, túi thể thao' },
      { value: 'gym yoga thảm tập găng tay dây kháng lực', label: 'Gym – Yoga: thảm tập, găng tay, dây kháng lực' },
      { value: 'xe đạp nón bảo hiểm chai nước thể thao', label: 'Xe đạp, nón bảo hiểm, chai nước thể thao' },
      { value: 'đồ bơi kính bơi áo khoác thể thao', label: 'Đồ bơi, kính bơi, áo khoác thể thao' },
      { value: 'đồng hồ đếm bước dây nhảy thiết bị', label: 'Thiết bị nhỏ: đồng hồ đếm bước, dây nhảy' }
    ],
    'Nội thất': [
      { value: '', label: 'Chọn loại nội thất' },
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
  const currentSubcategories = categorySubcategories[formData.category] || []
  const hasSubcategories = currentSubcategories.length > 0

  useEffect(() => {
    dispatch(fetchProduct(id))
  }, [dispatch, id])

  useEffect(() => {
    if (product && !isLoaded) {
      // Kiểm tra quyền sở hữu
      if (product.userId._id !== user?.id && !user?.isAdmin) {
        navigate('/products')
        return
      }

      // Convert old English category values to Vietnamese
      const categoryMap = {
        'Books': 'Sách',
        'Electronics': 'Điện tử',
        'Furniture': 'Nội thất',
        'Clothing': 'Quần áo',
        'Stationery': 'Văn phòng phẩm',
        'Sports': 'Thể thao',
        'Other': 'Khác'
      }

      const vietnameseCategory = categoryMap[product.category] || product.category

      // Tìm subcategory từ tags nếu có
      let detectedSubcategory = ''
      if (vietnameseCategory && product.tags && product.tags.length > 0) {
        const subcats = categorySubcategories[vietnameseCategory] || []
        const tagsString = product.tags.join(' ')
        for (const subcat of subcats) {
          if (subcat.value && tagsString.includes(subcat.value.split(' ')[0])) {
            detectedSubcategory = subcat.value
            break
          }
        }
      }

      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: vietnameseCategory,
        subcategory: detectedSubcategory,
        condition: product.condition || '',
        location: product.location || '',
        tags: product.tags?.join(', ') || '',
        images: product.images || []
      })

      const existingImages = (product.images || []).map((img, idx) => ({
        id: `existing-${idx}-${Date.now()}`,
        type: 'existing',
        src: img,
        file: null
      }))
      setAllImages(existingImages)
      setIsLoaded(true)
    }
  }, [product, user, navigate, isLoaded])

  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value }

    // Reset subcategory khi đổi category
    if (e.target.name === 'category') {
      newFormData.subcategory = ''
    }

    setFormData(newFormData)
  }

  const handleImageChange = (e) => {
    setImageError('')
    const files = Array.from(e.target.files)

    // Kiểm tra số lượng ảnh (tổng số lượng không quá 5)
    const currentCount = allImages.length
    if (currentCount + files.length > 5) {
      setImageError(`Tối đa 5 ảnh. Hiện có ${currentCount} ảnh, bạn chỉ có thể thêm ${5 - currentCount} ảnh`)
      e.target.value = ''
      return
    }

    // Kiểm tra từng file
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    const invalidFiles = files.filter(file => {
      if (file.size > maxSize) {
        return true
      }
      if (!allowedTypes.includes(file.type)) {
        return true
      }
      return false
    })

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ')
      if (invalidFiles.some(f => f.size > maxSize)) {
        setImageError(`Các file sau vượt quá 2MB: ${invalidNames}`)
      } else {
        setImageError(`Chỉ cho phép ảnh định dạng JPG, PNG hoặc WebP. File không hợp lệ: ${invalidNames}`)
      }
      e.target.value = ''
      return
    }

    const newImageObjects = files.map((file, idx) => ({
      id: `new-${idx}-${Date.now()}`,
      type: 'new',
      src: URL.createObjectURL(file),
      file: file
    }))

    setAllImages([...allImages, ...newImageObjects])
    e.target.value = ''
  }

  const handleRemoveImage = (indexToRemove) => {
    const imgToRemove = allImages[indexToRemove]
    if (imgToRemove.type === 'new' && imgToRemove.src.startsWith('blob:')) {
      URL.revokeObjectURL(imgToRemove.src)
    }
    setAllImages(allImages.filter((_, index) => index !== indexToRemove))
  }

  const handleMoveImage = (index, direction) => {
    const newImagesList = [...allImages]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newImagesList.length) return
    
    // Swap items
    const temp = newImagesList[index]
    newImagesList[index] = newImagesList[targetIndex]
    newImagesList[targetIndex] = temp

    setAllImages(newImagesList)
  }

  const handleSetCoverImage = (index) => {
    if (index === 0) return
    const newImagesList = [...allImages]
    const selectedCover = newImagesList.splice(index, 1)[0]
    newImagesList.unshift(selectedCover)

    setAllImages(newImagesList)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (allImages.length === 0) {
      setImageError('Vui lòng chọn ít nhất 1 ảnh')
      return
    }

    if (imageError) {
      return
    }

    setIsSubmitting(true)

    // Thêm subcategory vào tags nếu có, lọc trùng lặp và giới hạn 10 tag
    let tagArray = formData.tags 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    if (formData.subcategory) {
      const subcategoryTags = formData.subcategory.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0)
      tagArray = [...tagArray, ...subcategoryTags]
    }

    const uniqueTags = Array.from(new Set(tagArray))
    const finalTags = uniqueTags.slice(0, 10).join(', ')

    const submitImages = []
    const submitNewFiles = []
    let newFileIndex = 0

    allImages.forEach(img => {
      if (img.type === 'existing') {
        submitImages.push(img.src)
      } else if (img.type === 'new') {
        submitImages.push(`new-file-${newFileIndex}`)
        submitNewFiles.push(img.file)
        newFileIndex++
      }
    })

    const { subcategory, ...dataToSubmit } = formData
    const submitData = {
      id,
      ...dataToSubmit,
      tags: finalTags,
      images: submitImages,
      newImages: submitNewFiles
    }

    try {
      await dispatch(updateProduct(submitData)).unwrap()
      setShowSuccessModal(true)
    } catch (err) {
      alert(err || 'Cập nhật sản phẩm thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate(`/products/${id}`)
  }

  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(id)).unwrap()
      setShowDeleteModal(false)
      navigate('/products')
    } catch (err) {
      alert(err || 'Xóa sản phẩm thất bại')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-800 dark:text-gray-200">Đang tải...</div>
  }

  if (!product) {
    return <div className="text-center py-12 text-gray-800 dark:text-gray-200">Không tìm thấy sản phẩm</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Chỉnh sửa sản phẩm</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiêu đề *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả *</label>
            <button
              type="button"
              disabled={!formData.title.trim() || aiLoadingDesc}
              onClick={async () => {
                setAiLoadingDesc(true)
                try {
                  const res = await api.post('/products/ai-suggest-description', { title: formData.title, description: formData.description })
                  if (res.data?.success && res.data?.data?.description) {
                    setFormData(prev => ({ ...prev, description: res.data.data.description }))
                  }
                } catch (e) {
                  alert(e.response?.data?.message || 'Không thể gợi ý mô tả')
                } finally {
                  setAiLoadingDesc(false)
                }
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {aiLoadingDesc ? 'Đang xử lý...' : '✨ AI gợi ý mô tả'}
            </button>
          </div>
          <textarea
            name="description"
            required
            rows="5"
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá (VNĐ) *</label>
            <input
              type="number"
              name="price"
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Danh mục *</label>
              <button
                type="button"
                disabled={!(formData.title.trim() || formData.description.trim()) || aiLoadingMeta}
                onClick={async () => {
                  setAiLoadingMeta(true)
                  try {
                    const res = await api.post('/products/ai-suggest-metadata', { title: formData.title, description: formData.description })
                    if (res.data?.success && res.data?.data) {
                      const { category, tags } = res.data.data
                      setFormData(prev => ({
                        ...prev,
                        category: category || prev.category,
                        tags: Array.isArray(tags) ? tags.join(', ') : (tags || prev.tags)
                      }))
                    }
                  } catch (e) {
                    alert(e.response?.data?.message || 'Không thể gợi ý')
                  } finally {
                    setAiLoadingMeta(false)
                  }
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {aiLoadingMeta ? 'Đang xử lý...' : '✨ Gợi ý danh mục & tags'}
              </button>
            </div>
            <select
              name="category"
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              <option value="Sách">Sách</option>
              <option value="Điện tử">Điện tử</option>
              <option value="Nội thất">Nội thất</option>
              <option value="Quần áo">Quần áo</option>
              <option value="Văn phòng phẩm">Văn phòng phẩm</option>
              <option value="Thể thao">Thể thao</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        {/* Subcategory dropdown - hiển thị khi category có subcategories */}
        {hasSubcategories && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loại {formData.category.toLowerCase()}
            </label>
            <select
              name="subcategory"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.subcategory}
              onChange={handleChange}
            >
              {currentSubcategories.map((subcat) => (
                <option key={subcat.value} value={subcat.value}>
                  {subcat.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tình trạng *</label>
            <select
              name="condition"
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="">Chọn tình trạng</option>
              <option value="Rất tốt">Rất tốt</option>
              <option value="Tốt">Tốt</option>
              <option value="Khá">Khá</option>
              <option value="Đã dùng nhiều">Đã dùng nhiều</option>
              <option value="Cần sửa chữa">Cần sửa chữa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Khu vực *</label>
            <select
              name="location"
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Chọn khu vực</option>
              <option value="Campus">Khuôn viên</option>
              <option value="Dormitory">Ký túc xá</option>
              <option value="Nearby">Lân cận</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            name="tags"
            placeholder="ví dụ: sách giáo trình, toán học, cơ bản"
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hình ảnh (tối đa 5 hình, mỗi ảnh tối đa 2MB)
          </label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200"
          />
          {imageError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{imageError}</p>
          )}
          {allImages.length > 0 && !imageError && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Đã chọn {allImages.length}/5 hình ảnh (Ảnh đầu tiên sẽ là ảnh đại diện hiển thị chính)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
                {allImages.map((img, index) => {
                  const isCover = index === 0;
                  return (
                    <div 
                      key={img.id} 
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-square ${
                        isCover 
                          ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badge "Ảnh chính" */}
                      {isCover && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          ★ Ảnh chính
                        </div>
                      )}
                      
                      {/* Kích thước ảnh hoặc nhãn ảnh cũ */}
                      {img.type === 'new' ? (
                        <span className="absolute bottom-1 right-1 bg-black bg-opacity-65 text-white text-[9px] px-1.5 py-0.5 rounded">
                          {(img.file.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                      ) : (
                        <span className="absolute bottom-1 right-1 bg-blue-600 bg-opacity-80 text-white text-[9px] px-1.5 py-0.5 rounded">
                          Đã lưu
                        </span>
                      )}

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2">
                        {/* Top controls (Delete & Set Cover) */}
                        <div className="flex justify-between items-start">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(index)}
                              title="Đặt làm ảnh chính"
                              className="bg-white/95 text-orange-600 hover:bg-orange-500 hover:text-white rounded-full px-2 py-0.5 shadow transition-colors text-[10px] font-bold"
                            >
                              ★ Lên đầu
                            </button>
                          ) : (
                            <div />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            title="Xóa ảnh này"
                            className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow hover:bg-red-700 transition-colors ml-auto"
                          >
                            ×
                          </button>
                        </div>

                        {/* Bottom controls (Move Left / Right) */}
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveImage(index, -1)}
                            className="bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black/60 text-white rounded w-7 h-7 flex items-center justify-center text-sm shadow transition-colors"
                            title="Di chuyển sang trái"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={index === allImages.length - 1}
                            onClick={() => handleMoveImage(index, 1)}
                            className="bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black/60 text-white rounded w-7 h-7 flex items-center justify-center text-sm shadow transition-colors"
                            title="Di chuyển sang phải"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Định dạng: JPG, PNG, WebP | Kích thước: Tối đa 2MB/ảnh | Số lượng: Tối đa 5 ảnh
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="flex-1 bg-orange-500 dark:bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting || loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Xóa sản phẩm
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Cập nhật thành công!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sản phẩm đã được cập nhật thành công.
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-orange-500 dark:bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
            >
              Xem sản phẩm
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 text-center">
              Xác nhận xóa sản phẩm
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Đang xóa...' : 'Xóa sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center text-center animate-pulse">
            {/* Spinning Circle */}
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              {/* Icon upload inside */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Đang cập nhật sản phẩm
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Vui lòng không đóng trang web. Chúng tôi đang tối ưu hóa hình ảnh và lưu các chỉnh sửa...
            </p>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full animate-pulse" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

