import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct, updateProduct } from '../store/slices/productSlice'
import api from '../utils/api'

export default function EditProduct() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading } = useSelector(state => state.product)
  const { user } = useSelector(state => state.auth)
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
  const [imageError, setImageError] = useState('')
  const [newImages, setNewImages] = useState([])

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

      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        condition: product.condition || '',
        location: product.location || '',
        tags: product.tags?.join(', ') || '',
        images: product.images || []
      })
    }
  }, [product, user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    const result = await dispatch(updateProduct({ 
      id, 
      ...formData,
      newImages: newImages 
    }))
    
    if (result.type.includes('fulfilled')) {
      setShowSuccessModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate(`/products/${id}`)
  }

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Không tìm thấy sản phẩm</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>

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
              <option value="New">Mới</option>
              <option value="Like New">Như mới</option>
              <option value="Good">Tốt</option>
              <option value="Fair">Khá</option>
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
                <p className="mt-2 text-sm text-red-600">{imageError}</p>
              )}
              {newImages.length > 0 && !imageError && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
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
          
          <p className="mt-2 text-xs text-gray-500">
            Định dạng: JPG, PNG, WebP | Kích thước: Tối đa 2MB/ảnh | Tổng số lượng: Tối đa 5 ảnh ({formData.images.length}/{5})
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Xem sản phẩm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

