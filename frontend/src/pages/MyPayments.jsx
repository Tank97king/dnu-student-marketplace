import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';

export default function MyPayments() {
  const { user } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'rejected'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [imageZoom, setImageZoom] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, filter, startDate, endDate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/payments/my-payments?${params.toString()}`);
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setToastMessage('Đã sao chép mã giao dịch!');
      setShowToast(true);
    }).catch(() => {
      setToastMessage('Không thể sao chép');
      setShowToast(true);
    });
  };

  const openImageLightbox = (imageUrl) => {
    setLightboxImage(imageUrl);
    setShowImageLightbox(true);
    setImageZoom(1);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem lịch sử thanh toán</p>
            <Link to="/login" className="text-primary-600 hover:underline mt-2 inline-block">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Image Lightbox */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-5xl w-full p-4">
            <button
              onClick={() => setShowImageLightbox(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(Math.max(0.5, imageZoom - 0.25));
                }}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded hover:bg-opacity-30"
              >
                -
              </button>
              <span className="text-white">Zoom: {Math.round(imageZoom * 100)}%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(Math.min(3, imageZoom + 0.25));
                }}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded hover:bg-opacity-30"
              >
                +
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(1);
                }}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded hover:bg-opacity-30"
              >
                Reset
              </button>
            </div>
            <img
              src={lightboxImage}
              alt="Payment Proof"
              className="max-w-full max-h-[80vh] mx-auto rounded"
              style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chi tiết thanh toán
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Thông tin thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono font-bold text-lg">{selectedPayment.transactionCode}</p>
                        <button
                          onClick={() => handleCopyCode(selectedPayment.transactionCode)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                      <p className="font-bold text-lg text-red-600 dark:text-red-400">
                        {formatPrice(selectedPayment.amount)} ₫
                      </p>
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
                    {selectedPayment.confirmedAt && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Ngày xác nhận:</span>
                        <p>{new Date(selectedPayment.confirmedAt).toLocaleString('vi-VN')}</p>
                      </div>
                    )}
                    {selectedPayment.rejectionReason && (
                      <div className="col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Lý do từ chối:</span>
                        <p className="text-red-600 dark:text-red-400">{selectedPayment.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPayment.orderId?.productId && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Sản phẩm
                    </h3>
                    <div className="flex items-center space-x-3">
                      {selectedPayment.orderId.productId.images?.[0] && (
                        <img
                          src={selectedPayment.orderId.productId.images[0]}
                          alt={selectedPayment.orderId.productId.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <Link
                          to={`/products/${selectedPayment.orderId.productId._id}`}
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {selectedPayment.orderId.productId.title}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Trạng thái đơn hàng: {selectedPayment.orderId.status}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment.paymentProof && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Ảnh biên lai
                    </h3>
                    <div className="relative">
                      <img
                        src={selectedPayment.paymentProof}
                        alt="Payment Proof"
                        className="w-full rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
                        onClick={() => openImageLightbox(selectedPayment.paymentProof)}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        Click để xem lớn
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
                className="w-full mt-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Lịch sử thanh toán
          </h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lọc theo trạng thái
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="rejected">Đã từ chối</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={() => {
                  setFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Reset
              </button>
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
                  onClick={() => handleViewDetail(payment)}
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
                          <strong>Mã giao dịch:</strong>{' '}
                          <span className="font-mono font-bold">{payment.transactionCode}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(payment.transactionCode);
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                          >
                            📋 Copy
                          </button>
                        </p>
                        <p>
                          <strong>Ngày tạo:</strong> {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </p>
                        {payment.paymentProof && (
                          <p className="text-green-600 dark:text-green-400">
                            ✓ Đã upload ảnh biên lai
                          </p>
                        )}
                        {payment.expiresAt && payment.status === 'pending' && !payment.paymentProof && (
                          <p className="text-orange-600 dark:text-orange-400">
                            ⏰ Hết hạn: {new Date(payment.expiresAt).toLocaleString('vi-VN')}
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
        </div>
      </div>
    </>
  );
}



