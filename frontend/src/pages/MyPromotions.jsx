import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function MyPromotions() {
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('active')
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [activeTab])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      // Fetch all coupons including expired ones
      const response = await api.get('/coupons/available?includeExpired=true')
      const allCoupons = response.data.data || []
      
      // Organize coupons by status
      const now = new Date()
      const organized = {
        active: [],
        expired: [],
        used: []
      }

      allCoupons.forEach(coupon => {
        const expiryDate = new Date(coupon.expiryDate)
        const isExpired = expiryDate <= now
        const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit

        if (isExpired) {
          organized.expired.push({
            ...coupon,
            status: 'expired'
          })
        } else if (isUsedUp) {
          organized.used.push({
            ...coupon,
            status: 'used'
          })
        } else {
          organized.active.push({
            ...coupon,
            status: 'active'
          })
        }
      })

      setCoupons(organized)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      setCoupons({ active: [], expired: [], used: [] })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    } else {
      return `${coupon.discountValue.toLocaleString('vi-VN')} ₫`
    }
  }

  const getIcon = (coupon) => {
    if (coupon.discountType === 'percentage' && coupon.discountValue >= 50) {
      return '🎉'
    } else if (coupon.discountType === 'fixed' && coupon.discountValue >= 100000) {
      return '🎁'
    }
    return '🎟️'
  }

  const currentPromotions = coupons[activeTab] || []

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
              Đang áp dụng ({coupons.active?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('used')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'used'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Đã sử dụng ({coupons.used?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'expired'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Đã hết hạn ({coupons.expired?.length || 0})
            </button>
          </div>
        </div>

        {/* Promotions List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">🎟️</div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải mã giảm giá...</p>
          </div>
        ) : currentPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPromotions.map((coupon) => (
              <div
                key={coupon._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                  coupon.status === 'active'
                    ? 'border-green-500 dark:border-green-600'
                    : coupon.status === 'used'
                    ? 'border-gray-300 dark:border-gray-600'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{getIcon(coupon)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Mã: {coupon.code}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {coupon.description || 'Mã giảm giá đặc biệt'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    coupon.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {getDiscountText(coupon)}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {coupon.minPurchase > 0 && (
                    <div>
                      <span className="font-medium">Đơn tối thiểu:</span> {coupon.minPurchase.toLocaleString('vi-VN')} ₫
                    </div>
                  )}
                  {coupon.usageLimit && (
                    <div>
                      <span className="font-medium">Đã sử dụng:</span> {coupon.usedCount || 0}/{coupon.usageLimit}
                    </div>
                  )}
                  {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                    <div>
                      <span className="font-medium">Danh mục:</span> {coupon.applicableCategories.map(cat => {
                        const catLabels = {
                          'Books': 'Sách',
                          'Electronics': 'Điện tử',
                          'Furniture': 'Nội thất',
                          'Clothing': 'Quần áo',
                          'Stationery': 'Văn phòng phẩm',
                          'Sports': 'Thể thao',
                          'Other': 'Khác'
                        };
                        return catLabels[cat] || cat;
                      }).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Hết hạn:</span> {formatDate(coupon.expiryDate)}
                  </div>
                  {coupon.status === 'active' ? (
                    <Link
                      to="/products"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Sử dụng ngay
                    </Link>
                  ) : (
                    <span className={`text-sm font-medium ${
                      coupon.status === 'used'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {coupon.status === 'used' ? 'Đã hết lượt' : 'Đã hết hạn'}
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
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Thông tin về mã giảm giá</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Mã giảm giá có thể được áp dụng khi thanh toán đơn hàng</li>
            <li>Mỗi mã có thể có giới hạn số lần sử dụng, vui lòng kiểm tra trước khi sử dụng</li>
            <li>Mã giảm giá có thời hạn sử dụng, vui lòng kiểm tra ngày hết hạn</li>
            <li>Mã giảm giá không thể chuyển nhượng hoặc hoàn tiền</li>
            <li>Một số mã có thể yêu cầu đơn hàng tối thiểu hoặc chỉ áp dụng cho một số danh mục</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

