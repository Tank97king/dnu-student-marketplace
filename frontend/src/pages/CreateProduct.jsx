import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../store/slices/productSlice'

export default function CreateProduct() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(state => state.product)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
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
    
    // Kiểm tra số lượng ảnh
    if (files.length > 5) {
      setImageError('Tối đa 5 ảnh cho mỗi sản phẩm')
      e.target.value = '' // Reset input
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
      e.target.value = '' // Reset input
      return
    }

    setFormData({ ...formData, images: files })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate images
    if (formData.images.length === 0) {
      setImageError('Vui lòng chọn ít nhất 1 ảnh')
      return
    }

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
      ...formData,
      tags: finalTags
    }

    const result = await dispatch(createProduct(submitData))
    if (result.type.includes('fulfilled')) {
      setShowSuccessModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/products')
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Đăng bán sản phẩm</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả *</label>
          <textarea
            name="description"
            required
            rows="5"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ) *</label>
            <input
              type="number"
              name="price"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
            <select
              name="category"
              required
              className="w-full px-4 py-2 border rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại {formData.category === 'Electronics' ? 'điện tử' : formData.category === 'Books' ? 'sách' : formData.category === 'Clothing' ? 'quần áo' : formData.category === 'Stationery' ? 'văn phòng phẩm' : formData.category === 'Sports' ? 'thể thao' : formData.category === 'Furniture' ? 'nội thất' : ''}</label>
            <select
              name="subcategory"
              className="w-full px-4 py-2 border rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng *</label>
            <select
              name="condition"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="">Chọn tình trạng</option>
              <option value="New">Mới</option>
              <option value="Like New">Như mới</option>
              <option value="Good">Tốt</option>
              <option value="Fair">Khá</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực *</label>
            <select
              name="location"
              required
              className="w-full px-4 py-2 border rounded-lg"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
          <input
            type="text"
            name="tags"
            placeholder="ví dụ: sách giáo trình, toán học, cơ bản"
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (tối đa 5 hình, mỗi ảnh tối đa 2MB) *
          </label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-lg"
            required={formData.images.length === 0}
          />
          {imageError && (
            <p className="mt-2 text-sm text-red-600">{imageError}</p>
          )}
          {formData.images.length > 0 && !imageError && (
            <div className="mt-2">
              <p className="text-sm text-gray-700">
                Đã chọn {formData.images.length}/5 hình ảnh
              </p>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <span className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Định dạng: JPG, PNG, WebP | Kích thước: Tối đa 2MB/ảnh | Số lượng: Tối đa 5 ảnh
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Đang đăng...' : 'Đăng sản phẩm'}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Đăng bán thành công!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Sản phẩm của bạn đã được đăng thành công.<br/>
              <span className="font-semibold text-orange-600">Sản phẩm sẽ được duyệt trong 24h</span> và sẽ hiển thị trên website sau khi admin duyệt.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                Xem sản phẩm
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setFormData({
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
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Đăng tiếp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





