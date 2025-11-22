import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { updateUser, requestChangePassword, verifyOTPAndChangePassword } from '../store/slices/authSlice'

export default function Profile() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('personal-info')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    nickname: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPhone, setShowPhone] = useState(true)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        nickname: user.nickname || user.name?.toLowerCase().replace(/\s+/g, '-') || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setSuccess('')

    if (!user?.phone) {
      setPasswordError('Vui lòng thêm số điện thoại trước khi đổi mật khẩu')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setPasswordLoading(true)

    try {
      const result = await dispatch(requestChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }))

      if (requestChangePassword.fulfilled.match(result)) {
        setShowOTPModal(true)
        setPasswordError('')
      } else {
        setPasswordError(result.payload || 'Gửi mã xác minh thất bại')
      }
    } catch (error) {
      setPasswordError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    const code = otpCode.join('')
    
    if (code.length !== 6) {
      setPasswordError('Vui lòng nhập đầy đủ 6 chữ số')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')

    try {
      const result = await dispatch(verifyOTPAndChangePassword({ code }))

      if (verifyOTPAndChangePassword.fulfilled.match(result)) {
        setSuccess('Đổi mật khẩu thành công!')
        setShowOTPModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setOtpCode(['', '', '', '', '', ''])
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setPasswordError(result.payload || 'Mã xác minh không đúng')
      }
    } catch (error) {
      setPasswordError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.put('/users/profile', formData)
      dispatch(updateUser(response.data.data))
      setSuccess('Cập nhật thông tin thành công!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const countWords = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const menuItems = [
    { id: 'personal-info', label: 'Thông tin cá nhân' },
    { id: 'social-links', label: 'Liên kết mạng xã hội' },
    { id: 'account-settings', label: 'Cài đặt tài khoản' },
    { id: 'login-history', label: 'Quản lý lịch sử đăng nhập' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Navigation Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
                Thông tin cá nhân
              </h2>
              <nav className="p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                      activeTab === item.id
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Column - Content/Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {activeTab === 'personal-info' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Hồ sơ cá nhân</h2>
                  
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Thêm số điện thoại *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white pr-8"
                          placeholder="Nhập địa chỉ"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Introduction */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Giới thiệu
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        maxLength={300}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none dark:bg-gray-700 dark:text-white"
                        placeholder="Viết vài dòng giới thiệu về gian hàng của bạn..."
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tối đa 60 từ ({countWords(formData.bio)}/60)
                      </p>
                    </div>

                    {/* Nickname */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tên gợi nhớ
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center">
                          <span className="text-gray-600 dark:text-gray-400">https://www.dnu-marketplace.com/user/</span>
                          <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                            className="flex-1 bg-transparent border-none focus:outline-none text-blue-600 dark:text-blue-400 font-medium"
                            placeholder="ten-goi-nho"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tên gợi nhớ sau khi được cập nhật sẽ không thể thay đổi trong vòng 60 ngày tới.
                      </p>
                    </div>

                    {/* Security Information Section */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        Thông tin bảo mật
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Những thông tin dưới đây mang tính bảo mật. Chỉ bạn mới có thể thấy và chỉnh sửa những thông tin này.
                      </p>
                      
                      {/* Email (readonly) */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'social-links' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Liên kết mạng xã hội</h2>
                  <p className="text-gray-600 dark:text-gray-400">Tính năng đang được phát triển...</p>
                </div>
              )}

              {activeTab === 'account-settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Cài đặt tài khoản</h2>
                  
                  {/* Change Password Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Thay đổi mật khẩu</h3>
                    
                    {/* Warning Banner - Only show if no phone */}
                    {!user?.phone && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6 flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Hãy thêm số điện thoại trước khi thực hiện thao tác này.
                        </p>
                      </div>
                    )}

                    {passwordError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 text-sm text-red-700 dark:text-red-300">
                        {passwordError}
                      </div>
                    )}

                    {success && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6 text-sm text-green-700 dark:text-green-300">
                        {success}
                      </div>
                    )}

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mật khẩu hiện tại *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mật khẩu mới *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Xác nhận mật khẩu mới *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={passwordLoading || !user?.phone}
                        className="mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        {passwordLoading ? 'Đang xử lý...' : 'ĐỔI MẬT KHẨU'}
                      </button>
                    </form>
                  </div>

                  {/* Allow phone contact */}
                  <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Cho phép người mua liên lạc qua điện thoại
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Khi bật tính năng này, số điện thoại sẽ hiển thị trên tất cả tin đăng của bạn.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Hiển thị số điện thoại</span>
                      <button
                        type="button"
                        onClick={() => setShowPhone(!showPhone)}
                        className={`relative inline-block w-14 h-8 rounded-full transition-colors duration-300 ${
                          showPhone ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                          showPhone ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Request account termination */}
                  <div>
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Yêu cầu chấm dứt tài khoản
                    </a>
                  </div>
                </div>
              )}

              {/* OTP Modal */}
              {showOTPModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                      Xác minh mã OTP
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Chúng tôi đã gửi mã xác minh đến email <strong>{user?.email}</strong>. Vui lòng nhập mã 6 chữ số.
                    </p>

                    <form onSubmit={handleOTPSubmit}>
                      <div className="flex justify-center space-x-2 mb-6">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>

                      {passwordError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">
                          {passwordError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOTPModal(false)
                            setOtpCode(['', '', '', '', '', ''])
                            setPasswordError('')
                          }}
                          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={passwordLoading || otpCode.join('').length !== 6}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          {passwordLoading ? 'Đang xác minh...' : 'Xác minh'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'login-history' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quản lý lịch sử đăng nhập</h2>
                  
                  {/* Current Device */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Thiết bị hiện tại</h3>
                    <div className="flex items-center space-x-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-gray-800 dark:text-white font-medium">
                          Windows 10.0 (Chrome 140.0.0.0)
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Đăng nhập bằng Email lúc {new Date().toLocaleDateString('vi-VN')} · {user?.address || 'Đà Nẵng, Việt Nam'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Lịch sử đăng nhập</h3>
                    
                    <div className="text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Bạn chưa có lịch sử đăng nhập ở thiết bị nào khác
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Những phiên đăng nhập DNU Marketplace từ mọi thiết bị sẽ được hiển thị và quản lý tại đây
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
