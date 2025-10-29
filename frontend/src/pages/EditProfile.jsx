import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { updateUser } from '../store/slices/authSlice'

export default function EditProfile() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    studentId: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        studentId: user.studentId || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData({
          ...formData,
          avatar: reader.result // Set as data URL for preview
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ và tên')
      return false
    }
    
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ')
      return false
    }
    
    // Skip avatar validation if it's a data URL (file upload)
    if (formData.avatar && !formData.avatar.startsWith('data:') && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.avatar)) {
      setError('URL ảnh đại diện không hợp lệ')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await api.put('/users/profile', formData)
      console.log('Profile update response:', response.data.data)
      
      // Update user in Redux store with response data
      dispatch(updateUser(response.data.data))
      
      setSuccess('Cập nhật thông tin thành công!')
      
      // Redirect to profile after 1 second
      setTimeout(() => {
        navigate('/profile')
      }, 1000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/profile')
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Chỉnh sửa thông tin cá nhân</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="space-y-3">
              {/* Avatar Preview */}
              <div className="flex items-center space-x-4">
                <img
                  src={avatarPreview || formData.avatar || 'https://via.placeholder.com/100'}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    Kích thước tối đa: 5MB
                  </p>
                  <p className="text-sm text-gray-600">
                    Định dạng: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>

              {/* File Input */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  📤 Chọn ảnh từ máy
                </label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar && formData.avatar.startsWith('http') ? formData.avatar : ''}
                  onChange={handleChange}
                  placeholder="Hoặc nhập URL ảnh"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
            <p className="text-sm text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã số sinh viên
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Nhập mã số sinh viên"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
