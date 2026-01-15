import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function PaymentManagement() {
  const { user } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'confirmed', 'rejected', 'all'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user && user.isAdmin) {
      loadPayments();
    }
  }, [user, filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' ? '/payments' : `/payments/pending`;
      const response = await api.get(endpoint);
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận thanh toán này?')) return;

    try {
      const response = await api.put(`/payments/${paymentId}/confirm`);
      if (response.data.success) {
        alert('Đã xác nhận thanh toán thành công');
        loadPayments();
        setShowModal(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xác nhận thanh toán');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn từ chối thanh toán này?')) return;

    try {
      const response = await api.put(`/payments/${paymentId}/reject`, {
        rejectionReason
      });
      if (response.data.success) {
        alert('Đã từ chối thanh toán');
        loadPayments();
        setShowModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể từ chối thanh toán');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      rejected: 'Đã từ chối'
    };
    return texts[status] || status;
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Bạn không có quyền truy cập trang này</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Quản lý thanh toán
        </h1>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 px-6">
              <button
                onClick={() => setFilter('pending')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  filter === 'pending'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Chờ xác nhận ({payments.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  filter === 'confirmed'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đã từ chối
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  filter === 'all'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Chưa có thanh toán nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewPayment(payment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {payment.orderId?.productId?.images?.[0] && (
                        <img
                          src={payment.orderId.productId.images[0]}
                          alt={payment.orderId?.productId?.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {payment.orderId?.productId?.title || 'N/A'}
                        </p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                          {formatPrice(payment.amount)} ₫
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Người mua:</strong> {payment.buyerName} ({payment.buyerPhone})
                      </p>
                      <p>
                        <strong>Mã giao dịch:</strong>{' '}
                        <span className="font-mono font-bold">{payment.transactionCode}</span>
                      </p>
                      <p>
                        <strong>Ngày tạo:</strong> {new Date(payment.createdAt).toLocaleString('vi-VN')}
                      </p>
                      {payment.paymentProof && (
                        <p className="text-green-600 dark:text-green-400">
                          ✓ Đã upload ảnh biên lai
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      payment.status
                    )}`}
                  >
                    {getStatusText(payment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Detail Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Chi tiết thanh toán
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                      setRejectionReason('');
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Payment Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Thông tin thanh toán
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
                        <p className="font-mono font-bold text-lg">{selectedPayment.transactionCode}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                        <p className="font-bold text-lg text-red-600 dark:text-red-400">
                          {formatPrice(selectedPayment.amount)} ₫
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Người mua:</span>
                        <p>{selectedPayment.buyerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">SĐT:</span>
                        <p>{selectedPayment.buyerPhone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                        <p>
                          <span
                            className={`px-2 py-1 rounded text-sm ${getStatusBadge(
                              selectedPayment.status
                            )}`}
                          >
                            {getStatusText(selectedPayment.status)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Ngày tạo:</span>
                        <p>{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedPayment.shippingAddress && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Địa chỉ nhận hàng
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPayment.shippingAddress.fullName} - {selectedPayment.shippingAddress.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPayment.shippingAddress.address}, {selectedPayment.shippingAddress.ward},{' '}
                        {selectedPayment.shippingAddress.district}, {selectedPayment.shippingAddress.city}
                      </p>
                    </div>
                  )}

                  {/* Payment Proof */}
                  {selectedPayment.paymentProof ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Ảnh biên lai chuyển khoản
                      </h3>
                      <img
                        src={selectedPayment.paymentProof}
                        alt="Payment Proof"
                        className="w-full rounded border border-gray-300 dark:border-gray-600"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        ⚠️ Vui lòng kiểm tra kỹ:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                        <li>Số tiền khớp với đơn hàng</li>
                        <li>Mã giao dịch (nội dung chuyển khoản) khớp: {selectedPayment.transactionCode}</li>
                        <li>Số tài khoản người nhận đúng</li>
                        <li>Thời gian hợp lý</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200">
                        ⚠️ Người mua chưa upload ảnh biên lai
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedPayment.status === 'pending' && (
                    <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleConfirmPayment(selectedPayment._id)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                      >
                        ✓ Xác nhận thanh toán
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Lý do từ chối (nếu có)"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => handleRejectPayment(selectedPayment._id)}
                          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
                        >
                          ✗ Từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



