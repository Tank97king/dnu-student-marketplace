import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function ProfileDropdown() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <img 
          src={user?.avatar || 'https://via.placeholder.com/40'} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full"
        />
        <span className="text-gray-700">{user?.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
          {/* Profile Header */}
          <div className="p-6 border-b">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/80'}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
                <Link
                  to="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="absolute bottom-0 right-0 bg-black text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-800 text-xs"
                >
                  ✏️
                </Link>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">{user?.name}</h3>
              <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <span>Người theo dõi 0</span>
                <span>Đang theo dõi 0</span>
              </div>
            </div>
          </div>

          {/* Đồng Tốt Section */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-800 dark:text-gray-200 font-medium">Đồng Tốt</span>
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
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-gray-800 dark:text-gray-200 font-medium mb-3">Tiện ích</h2>
            <div className="space-y-2">
              <Link 
                to="/saved-posts" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">❤️</span>
                  <span className="text-gray-800 dark:text-gray-200">Tin đăng đã lưu</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
              
              <Link 
                to="/saved-searches" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">🔖</span>
                  <span className="text-gray-800 dark:text-gray-200">Tìm kiếm đã lưu</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
              
              <Link 
                to="/view-history" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">🕒</span>
                  <span className="text-gray-800 dark:text-gray-200">Lịch sử xem tin</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
              
              <Link 
                to="/my-reviews" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">⭐</span>
                  <span className="text-gray-800 dark:text-gray-200">Đánh giá từ tôi</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            </div>
          </div>

          {/* Dịch vụ trả phí Section */}
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-gray-800 dark:text-gray-200 font-medium mb-3">Dịch vụ trả phí</h2>
            <div className="space-y-2">
              <Link 
                to="/coins" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">💰</span>
                  <span className="text-gray-800 dark:text-gray-200">Đồng Tốt</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
              
              <Link 
                to="/pro-package" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">👑</span>
                  <span className="text-gray-800 dark:text-gray-200">Gói PRO</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
              
              <Link 
                to="/partner-channel" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">✅</span>
                  <span className="text-gray-800 dark:text-gray-200">Kênh Đối Tác</span>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

