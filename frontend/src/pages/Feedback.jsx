import React, { useState } from 'react'
import { useSelector } from 'react-redux'

export default function Feedback() {
  const { user } = useSelector(state => state.auth)
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    email: user?.email || ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    setSubmitting(true)
    try {
      // Gọi API gửi feedback
      console.log('Feedback data submitted:', formData)
      
      setSubmitted(true)
      setFormData({
        type: 'general',
        subject: '',
        message: '',
        email: user?.email || ''
      })
      
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/10 p-8 md:p-10 mb-8">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-yellow-300/10 blur-xl"></div>
          
          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-orange-50 mb-3 inline-block">
              ✍️ DNU Feedback Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">
              Đóng Góp Ý Kiến
            </h1>
            <p className="text-sm text-orange-50/90 leading-relaxed">
              Mọi ý kiến đóng góp, báo cáo lỗi hoặc đề xuất của bạn đều giúp Ban quản trị nâng cấp DNU Marketplace trở nên an toàn, tiện lợi hơn.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/80 text-green-700 dark:text-green-300 px-4 py-3.5 rounded-xl mb-6 flex items-center gap-2 shadow-sm animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</span>
          </div>
        )}

        {/* Feedback Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/85 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Loại phản hồi *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                required
              >
                <option value="general">Ý kiến chung</option>
                <option value="bug">Báo lỗi hệ thống</option>
                <option value="suggestion">Đề xuất tính năng</option>
                <option value="complaint">Khiếu nại giao dịch</option>
                <option value="other">Ý kiến khác</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Email của bạn *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-sm"
                placeholder="your.email@dnu.edu.vn"
                required
              />
              <p className="mt-1.5 text-[11px] text-gray-450 dark:text-gray-500">
                Chúng tôi sẽ sử dụng email này để gửi kết quả phản hồi lại cho bạn
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề đóng góp *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-sm"
                placeholder="Ví dụ: Đề xuất phương thức thanh toán ví điện tử"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nội dung chi tiết *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-sm resize-y"
                placeholder="Hãy mô tả thật chi tiết ý kiến đóng góp, đề xuất tính năng mới hoặc mô tả lỗi bạn vừa gặp phải để đội ngũ hỗ trợ nhanh chóng nhất..."
                required
              ></textarea>
              <p className="mt-1.5 text-[11px] text-gray-455 dark:text-gray-500">
                Mô tả chi tiết giúp đội kỹ thuật dễ dàng tái lập lỗi và triển khai nâng cấp.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? 'Đang gửi phản hồi...' : 'Gửi phản hồi đóng góp'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Box */}
        <div className="mt-8 bg-gradient-to-br from-orange-50/55 to-orange-100/35 dark:from-gray-900 dark:to-gray-900/40 border border-orange-200/40 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">💡</span>
            <h3 className="font-bold text-orange-900 dark:text-orange-400 text-sm">Gợi ý gửi phản hồi đạt hiệu quả cao:</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span><strong>Mô tả chi tiết:</strong> Nêu rõ tính năng hoặc hành vi mà bạn mong muốn hệ thống thực hiện.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span><strong>Nếu là báo lỗi:</strong> Ghi rõ lỗi xảy ra ở trang nào (ví dụ: Trang chủ, Lịch sử mua hàng) và lúc bấm nút nào.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span><strong>Thời gian xử lý:</strong> Đội ngũ quản trị viên sẽ tiếp nhận ý kiến đóng góp và trả lời bạn qua Email đã cung cấp trong vòng 2-3 ngày làm việc.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
