import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login, clearError } from '../store/slices/authSlice'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900 font-sans">
      {/* Left side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-indigo-950 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/banner.png" 
            alt="DNU Banner" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/80 to-indigo-900/40"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center px-12 lg:px-24 text-white w-full h-full">
          <Link to="/" className="absolute top-8 left-12 lg:left-24 flex items-center gap-2 hover:opacity-80 transition-opacity">
             <span className="text-white/70">←</span>
             <span className="text-white/70 text-sm font-medium uppercase tracking-wider">Trang chủ</span>
          </Link>

          <div className="flex items-center gap-4 mb-8 mt-12">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
              <span className="text-3xl font-black text-indigo-900">D</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
              DNU<span className="text-orange-500">Market</span>
            </h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-[1.15]">
            Chợ Đồ Cũ Sinh Viên <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Đại Nam University
            </span>
          </h2>
          <p className="text-indigo-100 text-lg max-w-md leading-relaxed font-medium">
            Nơi mua bán, trao đổi đồ dùng học tập, sách vở và các vật dụng thiết yếu dành riêng cho sinh viên DNU.
          </p>

          {/* Testimonial / Features */}
          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="text-3xl font-black text-orange-400 mb-1">10k+</p>
              <p className="text-indigo-200 text-sm font-medium">Sinh viên sử dụng</p>
            </div>
            <div>
              <p className="text-3xl font-black text-orange-400 mb-1">An toàn</p>
              <p className="text-indigo-200 text-sm font-medium">Xác thực qua mail trường</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="max-w-md w-full space-y-8 relative z-10">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-white">D</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-indigo-900 dark:text-white">
              DNU<span className="text-orange-500">Market</span>
            </h1>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Chào mừng trở lại! 👋
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Vui lòng đăng nhập để tiếp tục. Chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded shadow-sm flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email sinh viên (DNU)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">✉️</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                    placeholder="vd: 22810111@dnu.edu.vn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">🔒</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30 uppercase tracking-wide"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </button>
            </div>
          </form>
          
          {/* Mobile Branding (only visible on small screens) */}
          <div className="mt-12 md:hidden text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              © {new Date().getFullYear()} DNU Marketplace.<br/>Dành riêng cho sinh viên Đại Nam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
