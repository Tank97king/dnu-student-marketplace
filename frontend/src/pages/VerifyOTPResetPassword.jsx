import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyOTPAndResetPassword, resendVerificationCodeResetPassword, clearError } from '../store/slices/authSlice'

export default function VerifyOTPResetPassword() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(0)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector(state => state.auth)

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingResetEmail') || ''

  useEffect(() => {
    dispatch(clearError())
    // Save email to localStorage if from location state
    if (location.state?.email) {
      localStorage.setItem('pendingResetEmail', location.state.email)
    }
  }, [dispatch, location.state])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return // Prevent paste issues
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last character
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('')
      setCode(newCode)
      // Focus last input
      const lastInput = document.getElementById('code-5')
      if (lastInput) lastInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')
    
    if (verificationCode.length !== 6) {
      return
    }

    if (!email) {
      alert('Không tìm thấy email. Vui lòng thử lại.')
      navigate('/forgot-password')
      return
    }

    const result = await dispatch(verifyOTPAndResetPassword({ email, code: verificationCode }))
    
    if (verifyOTPAndResetPassword.fulfilled.match(result)) {
      localStorage.removeItem('pendingResetEmail')
      localStorage.removeItem('pendingResetPassword')
      alert('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.')
      navigate('/login')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return

    // Get newPassword from localStorage (saved when forgotPassword was called)
    const newPassword = localStorage.getItem('pendingResetPassword')
    
    if (!newPassword) {
      alert('Không tìm thấy thông tin. Vui lòng quay lại trang quên mật khẩu.')
      navigate('/forgot-password')
      return
    }

    const result = await dispatch(resendVerificationCodeResetPassword({ email, newPassword }))
    
    if (resendVerificationCodeResetPassword.fulfilled.match(result)) {
      setResendCooldown(60) // 60 seconds cooldown
      alert('Mã xác minh mới đã được gửi đến email của bạn')
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Không tìm thấy thông tin email. Vui lòng thử lại.</p>
          <Link to="/forgot-password" className="text-orange-600 dark:text-orange-400 hover:text-orange-500">
            Quay lại quên mật khẩu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Xác minh mã OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Chúng tôi đã gửi mã xác minh đến <strong className="text-gray-900 dark:text-white">{email}</strong>
          </p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            Vui lòng nhập mã 6 chữ số để đặt lại mật khẩu
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Không nhận được mã?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã'}
              </button>
            </p>
            <Link to="/forgot-password" className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500">
              Quay lại
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

