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
    condition: '',
    location: '',
    tags: '',
    images: []
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(createProduct(formData))
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tối đa 10 hình) *</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {formData.images.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Đã chọn {formData.images.length} hình ảnh
            </p>
          )}
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





