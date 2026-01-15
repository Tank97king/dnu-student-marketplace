import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct, updateProduct, deleteProduct } from '../store/slices/productSlice'

export default function EditProduct() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading } = useSelector(state => state.product)
  const { user } = useSelector(state => state.auth)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
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
  const [newImages, setNewImages] = useState([])

  // Subcategories cho tất cả các danh mục
  const categorySubcategories = {
    Electronics: [
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
    Books: [
      { value: '', label: 'Chọn loại sách' },
      { value: 'giáo trình đại học môn học ngành', label: 'Sách giáo trình đại học' },
      { value: 'tham khảo bài tập đề cương ôn thi', label: 'Sách tham khảo, bài tập, đề cương' },
      { value: 'ngoại ngữ toeic ielts hsk', label: 'Sách ngoại ngữ (TOEIC, IELTS, HSK)' },
      { value: 'kỹ năng sống khởi nghiệp', label: 'Sách kỹ năng sống, khởi nghiệp' },
      { value: 'tiểu thuyết truyện light novel manga', label: 'Tiểu thuyết, truyện, light novel, manga' },
      { value: 'tạp chí học lập trình marketing', label: 'Tạp chí, sách học lập trình, marketing' }
    ],
    Clothing: [
      { value: '', label: 'Chọn loại quần áo' },
      { value: 'áo thun áo sơ mi áo khoác', label: 'Áo thun, áo sơ mi, áo khoác' },
      { value: 'quần jeans quần tây quần thể thao', label: 'Quần jeans, quần tây, quần thể thao' },
      { value: 'đồ mùa đông áo hoodie', label: 'Đồ mùa đông, áo hoodie' },
      { value: 'đồng phục sinh viên áo khoác khoa áo lớp', label: 'Đồng phục sinh viên, áo khoác khoa, áo lớp' },
      { value: 'giày dép balo túi xách', label: 'Giày, dép, balo, túi xách' },
      { value: 'phụ kiện mũ nón đồng hồ thắt lưng', label: 'Phụ kiện: mũ, nón, đồng hồ, thắt lưng' }
    ],
    Stationery: [
      { value: '', label: 'Chọn loại văn phòng phẩm' },
      { value: 'bút bi bút chì bút highlight', label: 'Bút các loại (bút bi, bút chì, bút highlight)' },
      { value: 'tập vở sổ tay giấy note', label: 'Tập vở, sổ tay, giấy note' },
      { value: 'file tài liệu bìa hồ sơ kẹp giấy', label: 'File tài liệu, bìa hồ sơ, kẹp giấy' },
      { value: 'máy tính cầm tay thước compa', label: 'Máy tính cầm tay, thước, compa' },
      { value: 'bảng vẽ kẹp tài liệu khay để bút', label: 'Bảng vẽ, kẹp tài liệu, khay để bút' },
      { value: 'handmade sổ bullet journal sticker', label: 'Sản phẩm handmade học tập (sổ bullet journal, sticker...)' }
    ],
    Sports: [
      { value: '', label: 'Chọn loại thể thao' },
      { value: 'bóng đá giày bóng áo đấu', label: 'Bóng đá: giày, bóng, áo đấu' },
      { value: 'cầu lông vợt cầu túi thể thao', label: 'Cầu lông: vợt, cầu, túi thể thao' },
      { value: 'gym yoga thảm tập găng tay dây kháng lực', label: 'Gym – Yoga: thảm tập, găng tay, dây kháng lực' },
      { value: 'xe đạp nón bảo hiểm chai nước thể thao', label: 'Xe đạp, nón bảo hiểm, chai nước thể thao' },
      { value: 'đồ bơi kính bơi áo khoác thể thao', label: 'Đồ bơi, kính bơi, áo khoác thể thao' },
      { value: 'đồng hồ đếm bước dây nhảy thiết bị', label: 'Thiết bị nhỏ: đồng hồ đếm bước, dây nhảy' }
    ],
    Furniture: [
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
    if (product) {
      // Kiểm tra quyền sở hữu
      if (product.userId._id !== user?.id && !user?.isAdmin) {
        navigate('/products')
        return
      }

      // Tìm subcategory từ tags nếu có
      let detectedSubcategory = ''
      if (product.category && product.tags && product.tags.length > 0) {
        const subcats = categorySubcategories[product.category] || []
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
        category: product.category || '',
        subcategory: detectedSubcategory,
        condition: product.condition || '',
        location: product.location || '',
        tags: product.tags?.join(', ') || '',
        images: product.images || []
      })
    }
  }, [product, user, navigate])

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
    
    // Kiểm tra số lượng ảnh (tổng với ảnh hiện tại không quá 5)
    const currentImageCount = formData.images.length
    if (currentImageCount + files.length > 5) {
      setImageError(`Tối đa 5 ảnh. Hiện có ${currentImageCount} ảnh, bạn chỉ có thể thêm ${5 - currentImageCount} ảnh`)
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

    setNewImages(files)
  }

  const handleRemoveImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (imageError) {
      return
    }

    // Thêm subcategory vào tags nếu có
    let finalTags = formData.tags
    if (formData.subcategory) {
      const subcategoryTags = formData.subcategory.split(' ')
      if (finalTags) {
        finalTags = `${finalTags}, ${subcategoryTags.join(', ')}`
      } else {
        finalTags = subcategoryTags.join(', ')
      }
    }

    const submitData = {
      id,
      ...formData,
      tags: finalTags,
      newImages: newImages
    }

    const result = await dispatch(updateProduct(submitData))
    
    if (result.type.includes('fulfilled')) {
      setShowSuccessModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate(`/products/${id}`)
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteProduct(id))
    
    if (result.type.includes('fulfilled')) {
      setShowDeleteModal(false)
      navigate('/products')
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả *</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh mục *</label>
            <select
              name="category"
              required
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>
              <option value="Books">Sách</option>
              <option value="Electronics">Điện tử</option>
              <option value="Furniture">Nội thất</option>
              <option value="Clothing">Quần áo</option>
              <option value="Stationery">Văn phòng phẩm</option>
              <option value="Sports">Thể thao</option>
              <option value="Other">Khác</option>
            </select>
          </div>
        </div>

        {/* Subcategory dropdown - hiển thị khi category có subcategories */}
        {hasSubcategories && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loại {formData.category === 'Electronics' ? 'điện tử' : formData.category === 'Books' ? 'sách' : formData.category === 'Clothing' ? 'quần áo' : formData.category === 'Stationery' ? 'văn phòng phẩm' : formData.category === 'Sports' ? 'thể thao' : formData.category === 'Furniture' ? 'nội thất' : ''}
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
            Hình ảnh (tối đa {5 - formData.images.length} ảnh, mỗi ảnh tối đa 2MB)
          </label>
          
          {/* Current Images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Current ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Images */}
          {formData.images.length < 5 && (
            <>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              {imageError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{imageError}</p>
              )}
              {newImages.length > 0 && !imageError && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                      />
                      <span className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Định dạng: JPG, PNG, WebP | Kích thước: Tối đa 2MB/ảnh | Tổng số lượng: Tối đa 5 ảnh ({formData.images.length}/{5})
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 dark:bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
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
    </div>
  )
}

