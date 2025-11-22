import React from 'react'
import { Link } from 'react-router-dom'

export default function Help() {
  const faqSections = [
    {
      title: 'Câu hỏi thường gặp',
      items: [
        {
          question: 'Làm thế nào để đăng bán sản phẩm?',
          answer: 'Bạn có thể đăng bán sản phẩm bằng cách nhấn vào nút "Đăng bán" ở góc trên bên phải, sau đó điền đầy đủ thông tin sản phẩm và upload hình ảnh. Sản phẩm của bạn sẽ được admin duyệt trong vòng 24h.'
        },
        {
          question: 'Làm thế nào để liên hệ người bán?',
          answer: 'Bạn có thể nhấn vào nút "Chat" trong trang chi tiết sản phẩm để gửi tin nhắn cho người bán. Hoặc bạn có thể xem số điện thoại của người bán trong phần thông tin người bán.'
        },
        {
          question: 'Làm thế nào để đảm bảo an toàn khi mua bán?',
          answer: 'Chúng tôi khuyến khích bạn gặp mặt trực tiếp tại khuôn viên trường hoặc ký túc xá để kiểm tra sản phẩm trước khi mua. Không nên chuyển khoản trước khi nhận hàng.'
        },
        {
          question: 'Sản phẩm của tôi bị từ chối duyệt, tại sao?',
          answer: 'Sản phẩm có thể bị từ chối nếu không đáp ứng tiêu chuẩn về hình ảnh, mô tả không đầy đủ, hoặc vi phạm quy định của trang web. Bạn có thể liên hệ admin để được giải thích cụ thể.'
        }
      ]
    },
    {
      title: 'Quy định và chính sách',
      items: [
        {
          question: 'Quy định về đăng bán',
          answer: 'Người bán phải là sinh viên Đại học Đại Nam. Sản phẩm phải hợp pháp, không vi phạm pháp luật. Hình ảnh và mô tả phải chính xác, không được gian lận.'
        },
        {
          question: 'Chính sách hoàn tiền',
          answer: 'Trang web không hỗ trợ hoàn tiền. Mọi giao dịch được thực hiện trực tiếp giữa người mua và người bán. Vui lòng kiểm tra kỹ sản phẩm trước khi mua.'
        },
        {
          question: 'Quy định về đánh giá',
          answer: 'Chỉ có thể đánh giá sau khi đã hoàn thành giao dịch. Đánh giá phải trung thực, không được sử dụng ngôn ngữ thô tục hoặc xúc phạm.'
        }
      ]
    },
    {
      title: 'Hướng dẫn sử dụng',
      items: [
        {
          question: 'Làm thế nào để tìm kiếm sản phẩm?',
          answer: 'Bạn có thể sử dụng thanh tìm kiếm ở trang chủ hoặc trong trang sản phẩm. Bạn cũng có thể lọc theo danh mục, giá, tình trạng và khu vực.'
        },
        {
          question: 'Làm thế nào để lưu sản phẩm yêu thích?',
          answer: 'Nhấn vào biểu tượng trái tim trên thẻ sản phẩm để lưu vào danh sách yêu thích. Bạn có thể xem lại trong phần "Sản phẩm đã lưu" trong menu cá nhân.'
        },
        {
          question: 'Làm thế nào để chỉnh sửa thông tin cá nhân?',
          answer: 'Nhấn vào avatar của bạn ở góc trên bên phải, chọn "Cài đặt tài khoản" để chỉnh sửa thông tin cá nhân.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Trợ giúp</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với chúng tôi để được hỗ trợ
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liên hệ hỗ trợ</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Email hỗ trợ</h3>
                <p className="text-gray-600 dark:text-gray-400">support@dnu-marketplace.edu.vn</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Hotline</h3>
                <p className="text-gray-600 dark:text-gray-400">1900-xxxx (Từ 8:00 - 17:00, Thứ 2 - Thứ 6)</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liên kết nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Trang chủ</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quay lại trang chủ</div>
            </Link>
            <Link 
              to="/products"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Sản phẩm</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Xem tất cả sản phẩm</div>
            </Link>
            <Link 
              to="/create-product"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Đăng bán</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đăng sản phẩm mới</div>
            </Link>
            <Link 
              to="/feedback"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Đóng góp ý kiến</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gửi phản hồi của bạn</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

