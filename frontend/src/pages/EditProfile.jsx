import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { updateUser } from '../store/slices/authSlice'

// Default avatar options for DNU students
const DEFAULT_AVATARS = [
  {
    id: 'male',
    src: '/avatars/default_male.png',
    label: 'Nam sinh viên DNU',
    icon: '👨‍🎓'
  },
  {
    id: 'female',
    src: '/avatars/default_female.png',
    label: 'Nữ sinh viên DNU',
    icon: '👩‍🎓'
  }
]

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
  const [avatarTab, setAvatarTab] = useState('default') // 'default' | 'upload' | 'url'
  const [selectedDefault, setSelectedDefault] = useState(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        studentId: user.studentId || '',
        avatar: user.avatar || ''
      })
      setAvatarPreview(user.avatar || '')
      // Detect if current avatar is one of the defaults
      const matchedDefault = DEFAULT_AVATARS.find(a => user.avatar === a.src)
      if (matchedDefault) {
        setSelectedDefault(matchedDefault.id)
        setAvatarTab('default')
      }
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      setError('')
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
      setSelectedDefault(null)
    }
  }

  const handleSelectDefaultAvatar = (avatar) => {
    setSelectedDefault(avatar.id)
    setAvatarPreview(avatar.src)
    setFormData({ ...formData, avatar: avatar.src })
    setAvatarFile(null)
    setError('')
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setFormData({ ...formData, avatar: url })
    setAvatarPreview(url)
    setSelectedDefault(null)
    setAvatarFile(null)
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
      dispatch(updateUser(response.data.data))
      setSuccess('Cập nhật thông tin thành công!')
      setTimeout(() => navigate('/profile'), 1200)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
      setLoading(false)
    }
  }

  const currentAvatar = avatarPreview || formData.avatar || '/avatars/default_male.png'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/40 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Hồ sơ</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-bold">Chỉnh sửa thông tin</span>
          </nav>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Chỉnh sửa hồ sơ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cập nhật thông tin cá nhân và ảnh đại diện của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert messages */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 px-4 py-3 rounded-2xl text-sm font-medium">
              <span className="text-lg">✅</span> {success}
            </div>
          )}

          {/* ===================== AVATAR SECTION ===================== */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <span>🖼️</span> Ảnh đại diện
            </h2>

            {/* Current Avatar Preview */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative flex-shrink-0">
                <img
                  src={currentAvatar}
                  alt="Avatar preview"
                  onError={(e) => { e.target.src = '/avatars/default_male.png' }}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl ring-2 ring-indigo-500/20"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs shadow-md">✏️</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{formData.name || 'Chưa cập nhật tên'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                {selectedDefault && (
                  <span className="inline-block mt-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                    {DEFAULT_AVATARS.find(a => a.id === selectedDefault)?.icon} Avatar DNU mặc định
                  </span>
                )}
              </div>
            </div>

            {/* Avatar Source Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900/40 p-1 rounded-2xl mb-5">
              {[
                { key: 'default', label: '🎓 Mặc định DNU' },
                { key: 'upload', label: '📤 Tải ảnh lên' },
                { key: 'url', label: '🔗 Nhập URL' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setAvatarTab(tab.key)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    avatarTab === tab.key
                      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* DEFAULT AVATARS Tab */}
            {avatarTab === 'default' && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                  Chọn avatar mặc định dành cho sinh viên Đại học Đại Nam (DNU):
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {DEFAULT_AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectDefaultAvatar(avatar)}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                        selectedDefault === avatar.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/15'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      {selectedDefault === avatar.id && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs shadow-md">✓</span>
                      )}
                      <img
                        src={avatar.src}
                        alt={avatar.label}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=DNU' }}
                        className={`w-24 h-24 rounded-full object-cover border-2 mb-3 transition-transform group-hover:scale-105 ${
                          selectedDefault === avatar.id
                            ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <span className="text-lg mb-1">{avatar.icon}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">{avatar.label}</span>
                      {selectedDefault === avatar.id && (
                        <span className="mt-2 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Đang chọn</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* UPLOAD Tab */}
            {avatarTab === 'upload' && (
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {avatarFile ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt="Upload preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-400 shadow-md mb-3"
                      />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{avatarFile.name}</span>
                      <span className="text-xs text-gray-400 mt-1">Nhấn để đổi ảnh khác</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📷</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Nhấn để chọn ảnh từ máy</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP · Tối đa 5MB</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* URL Tab */}
            {avatarTab === 'url' && (
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.avatar && formData.avatar.startsWith('http') ? formData.avatar : ''}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white transition-all"
                />
                {formData.avatar && formData.avatar.startsWith('http') && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
                    <img
                      src={formData.avatar}
                      alt="URL Preview"
                      onError={(e) => { e.target.src = '/avatars/default_male.png' }}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Xem trước</p>
                      <p className="text-xs text-gray-400 truncate max-w-[250px]">{formData.avatar}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===================== PERSONAL INFO SECTION ===================== */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>👤</span> Thông tin cá nhân
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white transition-all"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <span>🔒</span> Email không thể thay đổi
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white transition-all"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Mã số sinh viên DNU
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Ví dụ: DNU21123456"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white transition-all font-mono"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Địa chỉ / Phòng ký túc xá
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ hoặc số phòng ký túc xá..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>💾 Lưu thay đổi</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-2xl transition-all cursor-pointer text-sm border border-gray-200 dark:border-gray-700"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
