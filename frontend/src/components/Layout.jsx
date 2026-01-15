import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import NotificationBadge from './NotificationBadge'
import ProfileDropdown from './ProfileDropdown'
import ThemeToggle from './ThemeToggle'
import Chatbot from './Chatbot'
import api from '../utils/api'

export default function Layout({ children }) {
  const { user, isAuthenticated, token } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hasVerifiedRef = useRef(false)
  
  console.log('✅ Layout component rendered', { isAuthenticated, hasUser: !!user })

  // Verify user exists when app loads (if authenticated) - only once
  useEffect(() => {
    const verifyUser = async () => {
      // Only verify once and if we have token in localStorage
      const storedToken = localStorage.getItem('token')
      if (storedToken && !hasVerifiedRef.current) {
        hasVerifiedRef.current = true
        try {
          // This will trigger 401 if user doesn't exist (deleted by admin)
          await api.get('/auth/me')
        } catch (error) {
          // Error is handled by api interceptor which will clear localStorage and redirect
          // But we also handle here to ensure logout from Redux
          if (error.response?.status === 401) {
            dispatch(logout())
            // Don't navigate here - api interceptor will handle it
          }
        }
      }
    }

    verifyUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-1">
              <Link to="/" className="flex items-center mr-4">
                <h1 className="text-2xl font-bold text-primary-600">DNU Marketplace</h1>
              </Link>
              {isAuthenticated && (
                <div className="hidden md:flex space-x-4">
                  <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md">
                    Trang chủ
                  </Link>
                  <Link to="/feed" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md">
                    Feed
                  </Link>
                  <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md">
                    Sản phẩm
                  </Link>
                  <Link to="/explore" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md">
                    Khám phá
                  </Link>
                </div>
              )}
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/create-product" className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                  Đăng bán
                </Link>
                <ThemeToggle />
                <NotificationBadge />
                <Link to="/chat" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative">
                  💬
                </Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Admin
                  </Link>
                )}
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-orange-500">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Về DNU Marketplace */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">DNU Marketplace</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Nền tảng mua bán đồ dùng cũ dành riêng cho sinh viên Đại học Đại Nam. Tiết kiệm - Giá hời - Liền tay.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
                <a href="mailto:support@dnu-marketplace.edu.vn" className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Liên kết nhanh */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/feed" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Khám phá
                  </Link>
                </li>
                <li>
                  <Link to="/create-product" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Đăng bán
                  </Link>
                </li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hỗ trợ</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Trợ giúp
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Đóng góp ý kiến
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@dnu-marketplace.edu.vn" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hotline: 1900-xxxx
                  </span>
                </li>
              </ul>
            </div>

            {/* Thông tin */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông tin</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📍 Địa chỉ: Đại học Đại Nam
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📧 Email: support@dnu-marketplace.edu.vn
                  </span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ⏰ Giờ làm việc: 8:00 - 17:00 (T2-T6)
                  </span>
                </li>
                <li>
                  <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    Quy định & Chính sách
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left mb-2 md:mb-0">
                © 2025 DNU Marketplace. Mua bán đồ dùng cũ dành cho sinh viên Đại học Đại Nam.
              </p>
              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Made with ❤️ for DNU Students</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

