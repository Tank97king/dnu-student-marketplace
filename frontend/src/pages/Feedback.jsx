import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../utils/api'

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
      // Có thể gọi API để lưu feedback vào backend
      // await api.post('/feedback', formData)
      
      // Tạm thời chỉ hiển thị thông báo thành công
      console.log('Feedback data:', formData)
      
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Đóng góp ý kiến</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chúng tôi luôn lắng nghe ý kiến của bạn để cải thiện dịch vụ. Hãy chia sẻ suy nghĩ và góp ý của bạn!
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</span>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại phản hồi *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                required
              >
                <option value="general">Ý kiến chung</option>
                <option value="bug">Báo lỗi</option>
                <option value="suggestion">Đề xuất tính năng</option>
                <option value="complaint">Khiếu nại</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email của bạn *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="your.email@dnu.edu.vn"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Chúng tôi sẽ sử dụng email này để phản hồi lại bạn
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Ví dụ: Đề xuất thêm tính năng tìm kiếm nâng cao"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nội dung phản hồi *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="8"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                placeholder="Hãy mô tả chi tiết ý kiến, đề xuất hoặc vấn đề của bạn..."
                required
              ></textarea>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ bạn tốt hơn
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Gợi ý để phản hồi hiệu quả:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Mô tả rõ ràng vấn đề hoặc đề xuất của bạn</li>
            <li>Nếu là báo lỗi, hãy mô tả các bước để tái hiện lỗi</li>
            <li>Nếu có thể, hãy kèm theo hình ảnh minh họa</li>
            <li>Chúng tôi sẽ phản hồi trong vòng 2-3 ngày làm việc</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

