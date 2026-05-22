import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PaymentModal from '../components/PaymentModal';
import Toast from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

export default function Orders() {
  const { user } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [returnModal, setReturnModal] = useState({ isOpen: false, orderId: null, reason: '' });
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    title: ''
  });

  const showToastMsg = (message, type = 'success', title = '') => {
    setToast({
      isVisible: true,
      message,
      type,
      title
    });
  };

  useEffect(() => {
    // Redirect to seller dashboard if selling tab is selected
    if (activeTab === 'selling') {
      navigate('/seller-dashboard');
      return;
    }
    
    if (user) {
      loadOrders();
    }
  }, [user, activeTab, navigate]);

  const loadOrders = async () => {
    try {
      const response = await api.get(`/orders?type=${activeTab}`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
      showToastMsg('Đã cập nhật trạng thái đơn hàng', 'success', 'Thành công');
      loadOrders();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể cập nhật trạng thái', 'error', 'Lỗi');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    const ok = await confirm({
      title: 'Xác nhận đơn hàng',
      message: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
      type: 'question',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy'
    });
    if (!ok) return;
    try {
      const response = await api.put(`/orders/${orderId}/confirm`);
      setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
      showToastMsg('Đã xác nhận đơn hàng', 'success', 'Thành công');
      loadOrders();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận đơn hàng', 'error', 'Lỗi');
    }
  };

  const handleRequestReturn = async () => {
    if (!returnModal.reason.trim()) {
      showToastMsg('Vui lòng nhập lý do hoàn hàng', 'warning', 'Cảnh báo');
      return;
    }
    try {
      await api.post(`/orders/${returnModal.orderId}/return-request`, { returnReason: returnModal.reason });
      showToastMsg('Đã gửi yêu cầu hoàn hàng thành công. Admin sẽ xem xét sớm nhất.', 'success', 'Đã gửi');
      setReturnModal({ isOpen: false, orderId: null, reason: '' });
      loadOrders();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể gửi yêu cầu hoàn hàng', 'error', 'Lỗi');
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Còn ${hours} giờ ${minutes} phút`;
    }
    return `Còn ${minutes} phút`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      picked_up: 'bg-purple-100 text-purple-850 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      return_requested: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      returned: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      picked_up: 'Đang giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      return_requested: '⏳ Chờ duyệt hoàn hàng',
      returned: '↩ Đã hoàn hàng'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem đơn hàng</p>
            <Link to="/login" className="text-primary-600 hover:underline mt-2 inline-block">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Quản lý đơn hàng</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'buying'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đơn mua ({orders.filter(o => o.buyerId?._id === user.id).length})
              </button>
              <button
                onClick={() => navigate('/seller-dashboard')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
              >
                Đơn bán ({orders.filter(o => o.sellerId?._id === user.id).length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isBuyer = order.buyerId?._id === user.id;
              const otherUser = isBuyer ? order.sellerId : order.buyerId;

              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src={order.productId?.images?.[0] || 'https://via.placeholder.com/80'}
                          alt={order.productId?.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/products/${order.productId?._id}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600"
                          >
                            {order.productId?.title}
                          </Link>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {formatPrice(order.finalPrice)} ₫
                          </p>
                          {order.couponCode && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                              🎟️ Đã áp dụng mã: <span className="font-bold">{order.couponCode}</span> (-{formatPrice(order.discountAmount)} ₫)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {isBuyer ? 'Người bán:' : 'Người mua:'} {otherUser?.name || 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {order.status === 'pending' && order.expiresAt && (
                          <div className="text-sm">
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                              ⏰ {getTimeRemaining(order.expiresAt)}
                            </span>
                            {getTimeRemaining(order.expiresAt) === 'Đã hết hạn' && (
                              <span className="ml-2 text-red-600 dark:text-red-400">(Sẽ tự động hủy)</span>
                            )}
                          </div>
                        )}
                        {order.shippingAddress && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <p>📍 Giao hàng tận nơi - {order.shippingAddress.address || order.shippingAddress.fullName}</p>
                            <p>💳 Thanh toán: <span className="font-medium text-orange-600 dark:text-orange-400">{order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isBuyer ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                          >
                            💳 Thanh toán
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                                handleUpdateStatus(order._id, 'cancelled');
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Hủy đơn hàng
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleConfirmOrder(order._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            ✓ Xác nhận đơn hàng
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                                handleUpdateStatus(order._id, 'cancelled');
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Hủy đơn hàng
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {['confirmed', 'picked_up'].includes(order.status) && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isBuyer ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          >
                            ✓ Xác nhận đã nhận hàng
                          </button>
                          <button
                            onClick={() => setReturnModal({ isOpen: true, orderId: order._id, reason: '' })}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                          >
                            ↩ Yêu cầu hoàn hàng
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}
                  
                  {order.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/products/${order.productId?._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Đánh giá sản phẩm →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedOrder && (
          <PaymentModal
            order={selectedOrder}
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrder(null);
              loadOrders();
            }}
            onSuccess={() => { loadOrders(); }}
          />
        )}

        {/* Return Request Modal */}
        {returnModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-2xl">↩</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Yêu cầu hoàn hàng</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trong vòng 3 ngày sau khi xác nhận</p>
                </div>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý do hoàn hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                value={returnModal.reason}
                onChange={e => setReturnModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Mô tả lý do bạn muốn hoàn hàng (ví dụ: sản phẩm không đúng mô tả, hàng bị hỏng...)..."
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setReturnModal({ isOpen: false, orderId: null, reason: '' })}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleRequestReturn}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        )}

        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
}

