import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useSelector(state => state.auth)
  
  console.log('Profile - Current user:', user)
  console.log('Profile - User avatar:', user?.avatar)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={user?.avatar || 'https://via.placeholder.com/100'}
                alt={user?.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <Link
                to="/profile/edit"
                className="absolute bottom-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800"
              >
                ✏️
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{user?.name}</h1>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>Người theo dõi 0</span>
              <span>Đang theo dõi 0</span>
            </div>
          </div>
        </div>

        {/* Đồng Tốt Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-800 font-medium">Đồng Tốt</span>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-2">0</span>
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">💰</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
            Nạp ngay
          </button>
        </div>

        {/* Tiện ích Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-gray-800 font-medium mb-4">Tiện ích</h2>
          <div className="space-y-3">
            <Link to="/saved-posts" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">❤️</span>
                <span className="text-gray-800">Tin đăng đã lưu</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
            
            <Link to="/saved-searches" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">🔖</span>
                <span className="text-gray-800">Tìm kiếm đã lưu</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
            
            <Link to="/view-history" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">🕒</span>
                <span className="text-gray-800">Lịch sử xem tin</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
            
            <Link to="/my-reviews" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">⭐</span>
                <span className="text-gray-800">Đánh giá từ tôi</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
        </div>

        {/* Dịch vụ trả phí Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-gray-800 font-medium mb-4">Dịch vụ trả phí</h2>
          <div className="space-y-3">
            <Link to="/coins" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">💰</span>
                <span className="text-gray-800">Đồng Tốt</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
            
            <Link to="/pro-package" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">👑</span>
                <span className="text-gray-800">Gói PRO</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
            
            <Link to="/partner-channel" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-3">✅</span>
                <span className="text-gray-800">Kênh Đối Tác</span>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
          <h2 className="text-gray-800 font-medium mb-4">Thông tin cá nhân</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số điện thoại</span>
              <span className="text-gray-800">{user?.phone || 'Chưa cập nhật'}</span>
            </div>
            {user?.studentId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mã số sinh viên</span>
                <span className="text-gray-800">{user?.studentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Địa chỉ</span>
              <span className="text-gray-800">{user?.address || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






