import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import NotificationBadge from './NotificationBadge'
import ProfileDropdown from './ProfileDropdown'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children }) {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
                  <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md">
                    Sản phẩm
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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2025 DNU Marketplace. Mua bán đồ dùng cũ dành cho sinh viên Đại học Đại Nam.
          </p>
        </div>
      </footer>
    </div>
  )
}

