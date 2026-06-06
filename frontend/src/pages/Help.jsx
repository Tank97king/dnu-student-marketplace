import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Help() {
  const [openFaq, setOpenFaq] = useState({})

  const toggleFaq = (secIdx, itemIdx) => {
    const key = `${secIdx}_${itemIdx}`
    setOpenFaq(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const faqSections = [
    {
      title: '🏫 Quy trình Mua bán & Giao dịch An toàn',
      items: [
        {
          question: 'Làm thế nào để giao dịch an toàn tuyệt đối?',
          answer: 'Ban quản trị DNU Marketplace khuyến khích sinh viên gặp mặt trực tiếp tại khuôn viên trường (Campus DNU) hoặc khu vực Ký túc xá để kiểm tra sản phẩm trước khi thanh toán. Không nên chuyển khoản đặt cọc trước cho các tài khoản chưa được xác thực hoặc giao dịch bên ngoài hệ thống.'
        },
        {
          question: 'Phương thức thanh toán qua Mã QR hoạt động ra sao?',
          answer: 'Khi bạn nhấn "Mua ngay" hoặc thanh toán đơn hàng, hệ thống sẽ tự động tạo mã VietQR có sẵn số tiền và nội dung chuyển khoản của Người bán. Sau khi bạn chuyển khoản thành công qua ứng dụng ngân hàng, hệ thống sẽ đối soát tự động và chuyển trạng thái đơn hàng sang "Đã thanh toán" chỉ trong vài giây.'
        },
        {
          question: 'Dịch vụ Shipper Sinh viên (DNU Shipper) là gì?',
          answer: 'Đây là đội ngũ vận chuyển nội khu được vận hành bởi chính các bạn sinh viên Đại học Đại Nam. Khi đặt hàng, bạn có thể chọn hình thức giao nhận qua Shipper nội bộ để được giao hàng tận lớp học, giảng đường hoặc phòng ký túc xá với chi phí cực kỳ ưu đãi và tốc độ nhanh chóng.'
        }
      ]
    },
    {
      title: '📋 Quy định Đăng tin & Kiểm duyệt',
      items: [
        {
          question: 'Yêu cầu đối với tài khoản người đăng bán?',
          answer: 'Tất cả người dùng đăng bán sản phẩm bắt buộc phải là sinh viên, cựu sinh viên, hoặc cán bộ giảng viên thuộc Đại học Đại Nam và được xác thực qua email tên miền @dnu.edu.vn hoặc mã số sinh viên.'
        },
        {
          question: 'Những mặt hàng nào được phép và bị cấm đăng bán?',
          answer: 'Được phép: Giáo trình, tài liệu học tập, đồ dùng cá nhân, đồ điện tử cũ, trang phục sinh viên và các thiết bị học tập hợp quy. Bị cấm: Các sản phẩm vi phạm quy chế học tập (phao thi, bài giải sẵn...), chất kích thích, thuốc lá, các loại vũ khí, sản phẩm văn hóa đồi trụy hoặc các mặt hàng vi phạm pháp luật Việt Nam.'
        },
        {
          question: 'Thời gian kiểm duyệt tin đăng là bao lâu?',
          answer: 'Mọi tin đăng sản phẩm mới hoặc bài đăng mạng xã hội sẽ được đội ngũ Admin kiểm duyệt nội dung trong vòng từ 2 đến 12 giờ làm việc để đảm bảo tính an toàn và chất lượng thông tin hiển thị trên chợ.'
        }
      ]
    },
    {
      title: '💬 Hướng dẫn sử dụng Mạng xã hội DNU Hub',
      items: [
        {
          question: 'Làm thế nào để chia sẻ bài viết lên Bảng tin?',
          answer: 'Bạn truy cập mục "Mạng xã hội" từ menu, nhấn vào nút "Đăng tin mới" ở Banner đầu trang. Bạn có thể đính kèm tối đa 10 hình ảnh, viết mô tả nội dung có sử dụng hashtag (ví dụ: #DNU, #GiaotrinhCNTT) để giúp mọi người dễ dàng tìm thấy.'
        },
        {
          question: 'Tính năng "Gợi ý theo dõi" hoạt động như thế nào?',
          answer: 'Hệ thống DNU Marketplace sẽ đề xuất những người dùng năng nổ, các admin hoặc các bạn học cùng khoa/ngành học để bạn dễ dàng nhấn "Theo dõi". Khi theo dõi họ, bài viết mới nhất của họ sẽ hiển thị riêng biệt tại tab "Đang theo dõi" của bạn.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/10 p-8 md:p-12 mb-8">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-yellow-300/10 blur-xl"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-orange-50 mb-4 inline-block">
              📚 DNU Help Center
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
              Trung Tâm Hỗ Trợ DNU
            </h1>
            <p className="text-sm md:text-base text-orange-50/90 leading-relaxed">
              Giải đáp thắc mắc, hướng dẫn giao dịch an toàn và hỗ trợ kỹ thuật nhanh chóng dành riêng cho cộng đồng sinh viên Đại học Đại Nam.
            </p>
          </div>
        </div>

        {/* Contact Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/80 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Email hỗ trợ</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Phản hồi trong 24 giờ làm việc</p>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 truncate">
              dinhthethanh73@gmail.com
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/80 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Đường dây nóng</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Hỗ trợ khẩn cấp (T2 - T6)</p>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              1900-DNU-HELP (1900-8888)
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/80 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Văn phòng Đoàn</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Hỗ trợ trực tiếp tại trường</p>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              Tầng 1, Tòa nhà Gương (Campus DNU)
            </p>
          </div>
        </div>

        {/* FAQs Collapsible Accordions */}
        <h2 className="text-2xl font-bold text-gray-850 dark:text-gray-100 mb-6 flex items-center gap-2">
          <span>❔</span> Câu hỏi & Quy định thường gặp
        </h2>

        <div className="space-y-6 mb-10">
          {faqSections.map((section, secIdx) => (
            <div key={secIdx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/85">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                {section.title}
              </h3>
              
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => {
                  const key = `${secIdx}_${itemIdx}`
                  const isOpen = !!openFaq[key]
                  
                  return (
                    <div
                      key={itemIdx}
                      className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(secIdx, itemIdx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                      >
                        <span className="pr-4 text-sm md:text-base">{item.question}</span>
                        <span className={`text-orange-500 font-bold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 bg-orange-50/20 dark:bg-gray-800/30 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/85">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>🔗</span> Liên kết truy cập nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/"
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-orange-500/40 hover:bg-orange-50/5 dark:hover:bg-gray-800/50 transition-all group"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors mb-1">
                🏠 Trang chủ
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Quay lại trang chủ mua sắm của sinh viên DNU</div>
            </Link>
            <Link 
              to="/products"
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-orange-500/40 hover:bg-orange-50/5 dark:hover:bg-gray-800/50 transition-all group"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors mb-1">
                📦 Xem sản phẩm
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Xem toàn bộ mặt hàng cũ, giáo trình đang bán</div>
            </Link>
            <Link 
              to="/create-product"
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-orange-500/40 hover:bg-orange-50/5 dark:hover:bg-gray-800/50 transition-all group"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors mb-1">
                ➕ Đăng bán đồ
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Đăng sản phẩm mới để nhượng lại cho người khác</div>
            </Link>
            <Link 
              to="/feedback"
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-orange-500/40 hover:bg-orange-50/5 dark:hover:bg-gray-800/50 transition-all group"
            >
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors mb-1">
                ✍️ Góp ý ý kiến
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Gửi phản hồi đóng góp phát triển DNU Marketplace</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
