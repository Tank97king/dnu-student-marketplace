import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { register, clearError } from '../store/slices/authSlice'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    studentId: ''
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }

    const { confirmPassword, ...submitData } = formData
    const result = await dispatch(register(submitData))
    
    if (register.fulfilled.match(result)) {
      // Navigate to verify OTP page with email
      navigate('/verify-otp', { state: { email: formData.email } })
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-gray-900 font-sans">
      {/* Left side - Image/Branding */}
      <div className="hidden md:flex md:w-[45%] bg-indigo-950 relative overflow-hidden">
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
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center px-12 lg:px-24 text-white w-full h-full pb-20">
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
            Mở Khóa Cơ Hội <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              Trao Đổi Đồ Cũ
            </span>
          </h2>
          <p className="text-indigo-100 text-lg max-w-md leading-relaxed font-medium">
            Tạo tài khoản bằng email sinh viên Đại Nam để bắt đầu mua bán, tìm kiếm giáo trình và kết nối với hàng nghìn sinh viên khác.
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full md:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-16 relative overflow-y-auto h-screen">
        <div className="max-w-xl w-full space-y-6 relative z-10 my-auto py-8">
          
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
              Tạo tài khoản mới 🚀
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded shadow-sm flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nhập họ và tên của bạn"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email sinh viên (DNU)</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="228101xx@dnu.edu.vn"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Địa chỉ (tùy chọn)</label>
                <input
                  name="address"
                  type="text"
                  placeholder="Khu vực trọ, ký túc xá..."
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mã số sinh viên</label>
                <input
                  name="studentId"
                  type="text"
                  placeholder="Nhập MSSV của bạn"
                  className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/30 uppercase tracking-wide"
              >
                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Bằng việc đăng ký, bạn đồng ý với <a href="#" className="text-orange-500 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-orange-500 hover:underline">Chính sách bảo mật</a> của DNU Marketplace.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
