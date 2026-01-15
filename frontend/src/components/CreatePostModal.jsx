import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '../store/slices/postSlice'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function CreatePostModal({ onClose, onSuccess }) {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [images, setImages] = useState([])
  const [caption, setCaption] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const categories = [
    { value: '', label: 'Chọn danh mục' },
    { value: 'Books', label: 'Sách' },
    { value: 'Electronics', label: 'Điện tử' },
    { value: 'Furniture', label: 'Nội thất' },
    { value: 'Clothing', label: 'Quần áo' },
    { value: 'Stationery', label: 'Văn phòng phẩm' },
    { value: 'Sports', label: 'Thể thao' },
    { value: 'Other', label: 'Khác' }
  ]

  const conditions = [
    { value: '', label: 'Chọn tình trạng' },
    { value: 'Rất tốt', label: 'Rất tốt' },
    { value: 'Tốt', label: 'Tốt' },
    { value: 'Khá', label: 'Khá' },
    { value: 'Đã dùng nhiều', label: 'Đã dùng nhiều' },
    { value: 'Cần sửa chữa', label: 'Cần sửa chữa' }
  ]

  const locations = [
    { value: '', label: 'Chọn khu vực' },
    { value: 'Campus', label: 'Khuôn viên' },
    { value: 'Dormitory', label: 'Ký túc xá' },
    { value: 'Nearby', label: 'Lân cận' }
  ]

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 10) {
      alert('Tối đa 10 ảnh')
      return
    }
    setImages([...images, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => index !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (images.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh')
      return
    }

    setLoading(true)
    try {
      const postData = {
        images,
        caption,
        price: price || undefined,
        category: category || undefined,
        condition: condition || undefined,
        location: location || undefined
      }

      await dispatch(createPost(postData)).unwrap()
      onSuccess()
    } catch (error) {
      alert(error || 'Tạo bài đăng thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Tạo bài đăng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Images */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ảnh (tối đa 10 ảnh)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:border-blue-500 transition-colors"
                >
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Viết mô tả... (có thể dùng #hashtag và @mention, Enter để xuống dòng)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-y"
              rows="4"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giá (VNĐ) - Tùy chọn
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Category, Condition, Location */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tình trạng
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Khu vực
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
              >
                {locations.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

