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
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left section: Logo and Navigation */}
            <div className="flex items-center flex-1">
              <Link to="/" className="flex items-center mr-10 group">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary-200 dark:shadow-none group-hover:rotate-12 transition-transform">
                  <span className="text-white font-black text-xl">D</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  DNU<span className="text-primary-600 dark:text-primary-400">Market</span>
                </h1>
              </Link>
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-6">
                  <Link 
                    to="/" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    Trang chủ
                  </Link>
                  <Link 
                    to="/feed" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    Mạng xã hội
                  </Link>
                  <Link 
                    to="/products" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    Sản phẩm
                  </Link>
                  <Link 
                    to="/explore" 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    Khám phá
                  </Link>
                </div>
              )}
            </div>
            
            {/* Right section: Actions and User */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Đăng bán Button */}
                <Link 
                  to="/create-product" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Đăng bán
                </Link>
                
                {/* Icons with rounded square backgrounds */}
                <div className="flex items-center space-x-2">
                  {/* Theme Toggle */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg w-10 h-10 flex items-center justify-center">
                    <ThemeToggle />
                  </div>
                  
                  {/* Notification Badge */}
                  <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg w-10 h-10 flex items-center justify-center overflow-visible">
                    <NotificationBadge />
                  </div>
                  
                  {/* Chat Icon */}
                  <Link 
                    to="/chat" 
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                      />
                    </svg>
                  </Link>
                </div>
                
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                  {user?.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                  <ProfileDropdown />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                  <ThemeToggle />
                </div>
                <Link 
                  to="/login" 
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
                >
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

      {/* Footer Mới Cải Tiến */}
      <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 overflow-hidden z-10">
        {/* Abstract decorative shapes cho cảm giác modern */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-orange-400 to-purple-500 shadow-[0_0_15px_rgba(251,146,60,0.5)]"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none dark:bg-blue-900/10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none dark:bg-orange-900/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Về DNU Marketplace */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
                  DNU Marketplace
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm mt-4">
                  Nền tảng mua bán đồ dùng cũ thông minh dành riêng cho sinh viên Đại học Đại Nam. <br/>
                  <span className="font-semibold text-orange-500 dark:text-orange-400 inline-block mt-2 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 rounded-md border border-orange-100 dark:border-orange-500/20">Tiết kiệm - Giá hời - Liền tay.</span>
                </p>
              </div>
              <div className="flex space-x-3 pt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-xs font-bold font-sans">
                  Zalo
                </a>
                <a href="mailto:support@dnu.edu.vn" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>

            {/* Liên kết nhanh */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                Liên kết nhanh
                <span className="absolute bottom-[-8px] left-0 w-12 h-1 bg-orange-500 rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Trang chủ', path: '/' },
                  { name: 'Sản phẩm mới', path: '/products' },
                  { name: 'Mạng xã hội', path: '/feed' },
                  { name: 'Khám phá AI', path: '/explore' },
                  { name: 'Đăng bán nhanh', path: '/create-product' }
                ].map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="group flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-200 dark:bg-orange-800 mr-3 group-hover:bg-orange-500 group-hover:scale-150 transition-all"></span>
                      <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                Hỗ trợ
                <span className="absolute bottom-[-8px] left-0 w-12 h-1 bg-blue-500 rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Trung tâm trợ giúp', path: '/help' },
                  { name: 'Đóng góp ý kiến', path: '/feedback' },
                  { name: 'Quy định & Chính sách', path: '/help' },
                  { name: 'Câu hỏi thường gặp', path: '/help' },
                  { name: 'Bảo mật thông tin', path: '/help' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="group flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-200 dark:bg-blue-800 mr-3 group-hover:bg-blue-500 group-hover:scale-150 transition-all"></span>
                      <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Thông tin */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 relative inline-block">
                Thông tin liên hệ
                <span className="absolute bottom-[-8px] left-0 w-12 h-1 bg-purple-500 rounded-full"></span>
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mr-4 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Địa chỉ</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Đại học Đại Nam, Hà Nội</p>
                  </div>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mr-4 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Email Hỗ trợ</p>
                    <a href="mailto:support@dnu-marketplace.edu.vn" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">support@dnu-marketplace.edu.vn</a>
                  </div>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Giờ làm việc</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">8:00 - 17:00 (T2 - T6)</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Area */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} DNU Marketplace. Mua bán đồ dùng cũ nội bộ.
            </p>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">Coded with</span>
              <span className="text-red-500 animate-pulse text-sm">❤️</span>
              <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">for DNU Students</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

