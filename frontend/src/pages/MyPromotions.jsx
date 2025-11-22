import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

export default function MyPromotions() {
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('active')

  // Mock data - có thể thay thế bằng API call thực tế
  const promotions = {
    active: [
      {
        id: 1,
        title: 'Giảm 20% phí đăng tin',
        description: 'Giảm giá phí đăng tin cho tất cả sản phẩm điện tử',
        discount: '20%',
        validUntil: '2025-12-31',
        status: 'active',
        icon: '🎁'
      },
      {
        id: 2,
        title: 'Miễn phí đăng tin đầu tiên',
        description: 'Sử dụng ngay cho sản phẩm đầu tiên của bạn',
        discount: '100%',
        validUntil: '2025-11-30',
        status: 'active',
        icon: '🎉'
      }
    ],
    expired: [
      {
        id: 3,
        title: 'Giảm 15% phí đăng tin',
        description: 'Đã hết hạn',
        discount: '15%',
        validUntil: '2025-10-15',
        status: 'expired',
        icon: '🏷️'
      }
    ],
    used: [
      {
        id: 4,
        title: 'Giảm 10% phí đăng tin',
        description: 'Đã sử dụng',
        discount: '10%',
        validUntil: '2025-09-30',
        status: 'used',
        icon: '✅'
      }
    ]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const currentPromotions = promotions[activeTab] || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Ưu đãi của tôi</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và sử dụng các ưu đãi, khuyến mãi của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Đang áp dụng ({promotions.active.length})
            </button>
            <button
              onClick={() => setActiveTab('used')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'used'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Đã sử dụng ({promotions.used.length})
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'expired'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Đã hết hạn ({promotions.expired.length})
            </button>
          </div>
        </div>

        {/* Promotions List */}
        {currentPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                  promotion.status === 'active'
                    ? 'border-green-500 dark:border-green-600'
                    : promotion.status === 'used'
                    ? 'border-gray-300 dark:border-gray-600'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{promotion.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {promotion.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {promotion.description}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    promotion.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {promotion.discount}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Hết hạn:</span> {formatDate(promotion.validUntil)}
                  </div>
                  {promotion.status === 'active' ? (
                    <Link
                      to="/create-product"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Sử dụng ngay
                    </Link>
                  ) : (
                    <span className={`text-sm font-medium ${
                      promotion.status === 'used'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {promotion.status === 'used' ? 'Đã sử dụng' : 'Đã hết hạn'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'active' && 'Chưa có ưu đãi đang áp dụng'}
              {activeTab === 'used' && 'Chưa có ưu đãi đã sử dụng'}
              {activeTab === 'expired' && 'Chưa có ưu đãi hết hạn'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'active' && 'Hãy tiếp tục sử dụng dịch vụ để nhận được nhiều ưu đãi hơn!'}
              {activeTab === 'used' && 'Lịch sử các ưu đãi bạn đã sử dụng sẽ hiển thị ở đây'}
              {activeTab === 'expired' && 'Các ưu đãi đã hết hạn sẽ hiển thị ở đây'}
            </p>
            {activeTab === 'active' && (
              <Link
                to="/products"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Xem sản phẩm
              </Link>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Thông tin về ưu đãi</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Ưu đãi chỉ áp dụng khi đăng bán sản phẩm</li>
            <li>Mỗi ưu đãi chỉ có thể sử dụng một lần</li>
            <li>Ưu đãi có thời hạn sử dụng, vui lòng kiểm tra trước khi sử dụng</li>
            <li>Ưu đãi không thể chuyển nhượng hoặc hoàn tiền</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

