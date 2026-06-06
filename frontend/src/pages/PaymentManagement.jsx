import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';
import { useConfirm } from '../components/ConfirmModal';

export default function PaymentManagement() {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const confirm = useConfirm();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(location.state?.filter || 'pending'); // 'pending', 'confirmed', 'rejected', 'need_payout', 'all'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sellerQR, setSellerQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  // State upload biên lai chuyển tiền cho người bán
  const [sellerPaymentFile, setSellerPaymentFile] = useState(null);
  const [sellerPaymentPreview, setSellerPaymentPreview] = useState(null);
  const [sendingSellerPayment, setSendingSellerPayment] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    title: ''
  });

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'need_payout') {
      // Đơn đã xác nhận nhưng chưa chuyển tiền cho người bán
      return p.status === 'confirmed' && !p.sellerPaid;
    }
    return p.status === filter;
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
    if (user && user.isAdmin) {
      loadPayments();
    }
  }, [user]);

  const loadSellerQR = async (sellerId) => {
    if (!sellerId) {
      setSellerQR(null);
      return;
    }
    try {
      setQrLoading(true);
      const response = await api.get('/seller-bankqr/all');
      if (response.data.success) {
        const qr = response.data.data.find(q => q.sellerId?._id === sellerId || q.sellerId === sellerId);
        setSellerQR(qr || null);
      }
    } catch (error) {
      console.error('Error loading seller QR:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSellerPaymentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToastMsg('Ảnh biên lai không được vượt quá 5MB', 'warning', 'Cảnh báo');
      return;
    }
    setSellerPaymentFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSellerPaymentPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleMarkSellerPaid = async (paymentId) => {
    if (!sellerPaymentFile) {
      showToastMsg('Vui lòng chụp/chọn ảnh biên lai chuyển khoản trước khi xác nhận', 'warning', 'Thiếu biên lai');
      return;
    }

    const ok = await confirm({
      title: '💸 Xác nhận đã chuyển tiền',
      message: `Bạn xác nhận đã chuyển đúng ${selectedPayment?.sellerAmount ? new Intl.NumberFormat('vi-VN').format(selectedPayment.sellerAmount) + ' ₫' : 'số tiền'} cho người bán và đã upload ảnh biên lai?`,
      type: 'question',
      confirmText: 'Xác nhận đã chuyển',
      cancelText: 'Để sau'
    });
    if (!ok) return;

    try {
      setSendingSellerPayment(true);
      const formData = new FormData();
      formData.append('sellerPaymentProof', sellerPaymentFile);

      const response = await api.put(
        `/seller-bankqr/payments/${paymentId}/mark-seller-paid`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        showToastMsg('✅ Đã chuyển tiền và gửi thông báo cho người bán!', 'success', 'Thành công');
        setSellerPaymentFile(null);
        setSellerPaymentPreview(null);
        const updatedFields = {
          sellerPaid: true,
          sellerPaidAt: response.data.data.sellerPaidAt,
          sellerPaymentProof: response.data.data.sellerPaymentProof
        };
        setPayments(payments.map(p =>
          p._id === paymentId ? { ...p, ...updatedFields } : p
        ));
        setSelectedPayment(prev =>
          prev?._id === paymentId ? { ...prev, ...updatedFields } : prev
        );
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận chuyển tiền', 'error', 'Lỗi');
    } finally {
      setSendingSellerPayment(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      showToastMsg('Không thể tải danh sách thanh toán', 'error', 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
    const sellerId = payment.orderId?.sellerId;
    loadSellerQR(sellerId);
  };

  const handleConfirmPayment = async (paymentId, isCod = false) => {
    const ok = await confirm({
      title: isCod ? 'Duyệt đơn giao hàng trước (COD)' : 'Xác nhận thanh toán',
      message: isCod
        ? 'Bạn có chắc chắn muốn duyệt đơn hàng này để chuyển cho Shipper giao hàng trước và thu tiền sau (COD)?'
        : 'Bạn có chắc chắn muốn xác nhận giao dịch thanh toán này là hợp lệ?',
      type: 'question',
      confirmText: 'Xác nhận duyệt',
      cancelText: 'Để sau'
    });
    if (!ok) return;

    try {
      const response = await api.put(`/payments/${paymentId}/confirm`);
      if (response.data.success) {
        showToastMsg(isCod ? 'Đã duyệt đơn giao hàng COD thành công' : 'Đã xác nhận thanh toán thành công', 'success', 'Thành công');
        loadPayments();
        setShowModal(false);
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể duyệt đơn hàng', 'error', 'Lỗi');
    }
  };

  const handleConfirmCOD = async (paymentId) => {
    const ok = await confirm({
      title: '✅ Xác nhận nhận tiền COD',
      message: 'Bạn xác nhận đã nhận tiền COD từ khách hàng (qua QR hoặc tiền mặt)? Sau khi xác nhận, Shipper sẽ nhận được thông báo để hoàn tất giao hàng.',
      type: 'question',
      confirmText: 'Đã nhận tiền',
      cancelText: 'Để sau'
    });
    if (!ok) return;

    try {
      const response = await api.put(`/payments/${paymentId}/confirm-cod`);
      if (response.data.success) {
        showToastMsg('Đã xác nhận nhận tiền COD! Shipper đã được thông báo.', 'success', 'Thành công');
        loadPayments();
        setShowModal(false);
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận COD', 'error', 'Lỗi');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!rejectionReason.trim()) {
      showToastMsg('Vui lòng nhập lý do từ chối', 'warning', 'Cảnh báo');
      return;
    }

    const ok = await confirm({
      title: 'Từ chối thanh toán',
      message: `Bạn có chắc chắn muốn từ chối thanh toán này?\nLý do: "${rejectionReason}"`,
      type: 'warning',
      confirmText: 'Xác nhận từ chối',
      cancelText: 'Quay lại'
    });
    if (!ok) return;

    try {
      const response = await api.put(`/payments/${paymentId}/reject`, {
        rejectionReason
      });
      if (response.data.success) {
        showToastMsg('Đã từ chối thanh toán', 'success', 'Đã từ chối');
        loadPayments();
        setShowModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể từ chối thanh toán', 'error', 'Lỗi');
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bạn không có quyền truy cập trang quản lý thanh toán.</p>
          <Link to="/admin" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/20 mb-8">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Giao dịch hệ thống</span>
              <h1 className="text-3xl font-black mt-1 text-white drop-shadow-sm leading-normal">QUẢN LÝ THANH TOÁN</h1>
              <p className="text-orange-50/90 text-sm mt-1">Xác thực các giao dịch nạp tiền, mua hàng chuyển khoản</p>
            </div>
            <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-md">
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-2 mb-6">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilter('pending')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'pending'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
            >
              ⏳ Chờ xác nhận ({payments.filter(p => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'confirmed'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
            >
              ✅ Đã xác nhận ({payments.filter(p => p.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'rejected'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
            >
              ❌ Đã từ chối ({payments.filter(p => p.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('need_payout')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${filter === 'need_payout'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
            >
              💸 Cần trả người bán
              {payments.filter(p => p.status === 'confirmed' && !p.sellerPaid).length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {payments.filter(p => p.status === 'confirmed' && !p.sellerPaid).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
            >
              💼 Tất cả ({payments.length})
            </button>
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-550 dark:text-gray-400 font-medium">Đang tải danh sách giao dịch...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-16 text-center shadow-sm">
            <span className="text-5xl">💸</span>
            <p className="text-gray-505 dark:text-gray-400 mt-4 font-medium">Chưa có giao dịch thanh toán nào được thực hiện trong mục này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-150 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5"
                onClick={() => handleViewPayment(payment)}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0">
                    {payment.orderId?.productId?.images?.[0] ? (
                      <img
                        src={payment.orderId.productId.images[0]}
                        alt={payment.orderId?.productId?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-indigo-50 text-indigo-550">📦</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white line-clamp-1 text-base">
                      {payment.orderId?.productId?.title || 'Không có tên sản phẩm'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-455">
                      <p>
                        <strong className="text-gray-450">Người mua:</strong> <span className="font-semibold text-gray-850 dark:text-white">{payment.buyerName}</span>
                      </p>
                      <span className="text-gray-300">•</span>
                      <p>
                        <strong className="text-gray-450">SĐT:</strong> <span className="font-semibold text-gray-850 dark:text-white">{payment.buyerPhone}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-455">
                      <p>
                        <strong className="text-gray-450">Mã giao dịch:</strong> <span className="font-mono font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded">{payment.transactionCode}</span>
                      </p>
                      <span className="text-gray-300">•</span>
                      <p>
                        <strong className="text-gray-450">Ngày tạo:</strong> <span className="font-semibold">{new Date(payment.createdAt).toLocaleString('vi-VN')}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.sellerApproved
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50'
                          : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200/50'
                        }`}>
                        Người bán: {payment.sellerApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.adminApproved
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50'
                          : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200/50'
                        }`}>
                        Admin: {payment.adminApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                      </span>
                      {payment.orderId?.deliveryMethod === 'delivery' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.orderId.shipperId
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200/50'
                            : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50'
                          }`}>
                          🛵 {payment.orderId.shipperId ? `Shipper: ${payment.orderId.shipperId.name || 'Đã nhận'}` : 'Chưa nhận đơn'}
                        </span>
                      )}
                      {/* Badge trạng thái thanh toán người bán */}
                      {payment.status === 'confirmed' && (
                        payment.sellerReportedIssue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300/50 animate-pulse">
                            ⚠️ Báo lỗi nhận tiền
                          </span>
                        ) : payment.sellerConfirmedReceipt ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50">
                            ✅ Người bán đã nhận tiền
                          </span>
                        ) : payment.sellerPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50">
                            ⏳ Chờ người bán xác nhận
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 animate-pulse">
                            💸 Chưa trả người bán
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center md:items-end justify-between md:flex-col gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-800">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-medium">Số tiền thanh toán</span>
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">
                      {formatPrice(payment.amount)} ₫
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {payment.paymentProof && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        📷 Đã gửi hóa đơn
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                        payment.status
                      )}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Detail Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-150 dark:border-gray-700/50 overflow-hidden my-8">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Kiểm tra & Duyệt thanh toán
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Xác thực giao dịch chuyển khoản thủ công từ ngân hàng</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                    setRejectionReason('');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                {/* Left Side: Info & Actions */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-4">
                    <h3 className="text-sm font-bold text-gray-450 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                      Thông tin giao dịch
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Mã giao dịch</span>
                        <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400 text-base">{selectedPayment.transactionCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Tổng tiền đơn hàng</span>
                        <span className="font-black text-gray-900 dark:text-white text-lg">
                          {formatPrice(selectedPayment.amount)} ₫
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Phí sàn (5%)</span>
                        <span className="font-bold text-gray-850 dark:text-gray-200 text-sm">
                          {formatPrice(selectedPayment.platformFee || Math.round(selectedPayment.amount * 0.05))} ₫
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Thuế VAT (10% trên phí sàn)</span>
                        <span className="font-bold text-gray-850 dark:text-gray-200 text-sm">
                          {formatPrice(selectedPayment.vatAmount || Math.round(selectedPayment.amount * 0.005))} ₫
                        </span>
                      </div>
                      <div className="col-span-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                        <span className="text-gray-400 text-xs font-medium block">Người bán thực nhận (94.5%)</span>
                        <span className="font-black text-green-600 dark:text-green-400 text-lg">
                          {formatPrice(selectedPayment.sellerAmount || Math.round(selectedPayment.amount * 0.945))} ₫
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Người mua hàng</span>
                        <span className="font-bold text-gray-880 dark:text-white">{selectedPayment.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Số điện thoại</span>
                        <span className="font-bold text-gray-880 dark:text-white">{selectedPayment.buyerPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Trạng thái hiện tại</span>
                        <span
                          className={`inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                            selectedPayment.status
                          )}`}
                        >
                          {getStatusText(selectedPayment.status)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs font-medium block">Thời gian tạo</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 text-xs font-medium block mb-1">Trạng thái phê duyệt chi tiết</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${selectedPayment.sellerApproved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            Người bán: {selectedPayment.sellerApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${selectedPayment.adminApproved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            Admin: {selectedPayment.adminApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.shippingAddress && (
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-2">
                      <h3 className="text-sm font-bold text-gray-450 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                        Địa chỉ nhận hàng
                      </h3>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedPayment.shippingAddress.fullName} - {selectedPayment.shippingAddress.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {selectedPayment.shippingAddress.address}, {selectedPayment.shippingAddress.ward},{' '}
                        {selectedPayment.shippingAddress.district}, {selectedPayment.shippingAddress.city}
                      </p>
                    </div>
                  )}

                  {selectedPayment.orderId?.deliveryMethod === 'delivery' && (
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3">
                      <h3 className="text-sm font-bold text-gray-450 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
                        <span>🛵 Thông tin vận chuyển</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedPayment.orderId.shipperId
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                          }`}>
                          {selectedPayment.orderId.shipperId ? 'Đã nhận đơn' : 'Chưa có shipper'}
                        </span>
                      </h3>

                      {selectedPayment.orderId.shipperId ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                              {selectedPayment.orderId.shipperId.avatar ? (
                                <img src={selectedPayment.orderId.shipperId.avatar} alt="Shipper" className="w-full h-full object-cover" />
                              ) : (
                                '🛵'
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedPayment.orderId.shipperId.name}</p>
                              <p className="text-xs text-gray-400">{selectedPayment.orderId.shipperId.email}</p>
                            </div>
                          </div>
                          <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                            <p><strong>Số điện thoại:</strong> {selectedPayment.orderId.shipperId.phone}</p>
                            <p><strong>Trạng thái vận chuyển:</strong> <span className="font-bold text-indigo-650 dark:text-indigo-400">
                              {selectedPayment.orderId.status === 'confirmed' && 'Chờ shipper lấy hàng'}
                              {selectedPayment.orderId.status === 'picked_up' && 'Đang giao hàng (Shipper đã lấy hàng)'}
                              {selectedPayment.orderId.status === 'completed' && 'Giao hàng thành công'}
                              {selectedPayment.orderId.status !== 'confirmed' && selectedPayment.orderId.status !== 'picked_up' && selectedPayment.orderId.status !== 'completed' && selectedPayment.orderId.status}
                            </span></p>
                          </div>

                          {/* Nút xác nhận COD - chỉ hiển thị khi đang giao hàng và chưa xác nhận tiền */}
                          {selectedPayment.orderId.status === 'picked_up' && selectedPayment.status !== 'confirmed' && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                  📱 Khách hàng đã quét QR thanh toán COD?
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                  Nếu khách đã chuyển khoản qua QR hoặc đưa tiền mặt, hãy xác nhận để thông báo shipper hoàn tất giao hàng.
                                </p>
                                <button
                                  onClick={() => handleConfirmCOD(selectedPayment._id)}
                                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  ✅ Xác nhận đã nhận tiền COD → Thông báo Shipper
                                </button>
                              </div>
                            </div>
                          )}

                          {/* COD đã được xác nhận */}
                          {selectedPayment.orderId.status === 'picked_up' && selectedPayment.status === 'confirmed' && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl">
                                <p className="text-xs font-bold text-green-800 dark:text-green-400 flex items-center gap-1">
                                  ✅ Đã xác nhận nhận tiền COD - Shipper đang hoàn tất giao hàng
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Delivery/pickup Proofs */}
                          {(selectedPayment.orderId.pickupProof || selectedPayment.orderId.deliveryProof) && (
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                              {selectedPayment.orderId.pickupProof && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 block font-bold">Minh chứng lấy hàng:</span>
                                  <a href={selectedPayment.orderId.pickupProof} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg h-24 bg-gray-50 flex items-center justify-center p-1">
                                    <img src={selectedPayment.orderId.pickupProof} alt="Pickup Proof" className="h-full object-contain rounded transition-transform group-hover:scale-105" />
                                  </a>
                                </div>
                              )}
                              {selectedPayment.orderId.deliveryProof && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-400 block font-bold">Minh chứng giao hàng:</span>
                                  <a href={selectedPayment.orderId.deliveryProof} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg h-24 bg-gray-50 flex items-center justify-center p-1">
                                    <img src={selectedPayment.orderId.deliveryProof} alt="Delivery Proof" className="h-full object-contain rounded transition-transform group-hover:scale-105" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-center text-xs border border-red-100 dark:border-red-950/30">
                          ⚠️ Đơn hàng giao tận nơi chưa có Shipper nào nhận giao.
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPayment.status === 'pending' && (
                    <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-750">
                      {selectedPayment.paymentProof ? (
                        <button
                          onClick={() => handleConfirmPayment(selectedPayment._id, false)}
                          disabled={selectedPayment.adminApproved}
                          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 ${selectedPayment.adminApproved
                              ? 'bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                            }`}
                        >
                          {selectedPayment.adminApproved ? '✓ Admin đã phê duyệt (Chờ Người bán)' : '✓ Xác nhận giao dịch hợp lệ'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConfirmPayment(selectedPayment._id, true)}
                          disabled={selectedPayment.adminApproved}
                          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 ${selectedPayment.adminApproved
                              ? 'bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                          {selectedPayment.adminApproved ? '✓ Admin đã duyệt COD (Chờ Người bán)' : '✓ Duyệt đơn (Giao hàng trước - Thu tiền COD/Sau)'}
                        </button>
                      )}

                      <div className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-2xl border border-red-100 dark:border-red-950/30 space-y-2">
                        <label className="block text-xs font-bold text-red-750 dark:text-red-400 uppercase tracking-wide">
                          Từ chối giao dịch
                        </label>
                        <input
                          type="text"
                          placeholder="Lý do từ chối (ví dụ: sai số tiền, sai mã GD...)"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-red-500 focus:outline-none rounded-xl text-sm dark:bg-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleRejectPayment(selectedPayment._id)}
                          className="w-full bg-red-650 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          ✗ Từ chối thanh toán
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedPayment.status === 'confirmed' && (
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-4">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
                        <span>🏦 Chuyển tiền cho người bán</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedPayment.sellerConfirmedReceipt
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : selectedPayment.sellerPaid
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'
                          }`}>
                          {selectedPayment.sellerConfirmedReceipt ? '✅ Người bán đã xác nhận' : selectedPayment.sellerPaid ? '⏳ Chờ người bán xác nhận' : 'Chưa chuyển tiền'}
                        </span>
                      </h3>

                      {/* Số tiền cần chuyển */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-center">
                          <p className="text-gray-400 dark:text-gray-500 text-[10px] mb-0.5">Tổng đơn hàng</p>
                          <p className="font-bold text-gray-900 dark:text-white">{formatPrice(selectedPayment.amount)} ₫</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-2.5 text-center">
                          <p className="text-red-400 dark:text-red-500 text-[10px] mb-0.5">Phí sàn + VAT</p>
                          <p className="font-bold text-red-700 dark:text-red-400">- {formatPrice((selectedPayment.platformFee || 0) + (selectedPayment.vatAmount || 0))} ₫</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-2.5 text-center">
                          <p className="text-green-600 dark:text-green-400 text-[10px] font-bold mb-0.5">Người bán nhận</p>
                          <p className="font-black text-green-700 dark:text-green-400 text-sm">{formatPrice(selectedPayment.sellerAmount || 0)} ₫</p>
                        </div>
                      </div>

                      {qrLoading ? (
                        <div className="text-center py-4 text-xs text-gray-500">Đang tải QR người bán...</div>
                      ) : sellerQR ? (
                        <div className="space-y-3 text-xs">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-1 text-gray-700 dark:text-gray-300">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Tài khoản người bán</p>
                            <p><strong>Ngân hàng:</strong> {sellerQR.bankName}</p>
                            <p><strong>Số TK:</strong> <span className="font-mono font-bold text-gray-900 dark:text-white">{sellerQR.accountNumber}</span></p>
                            <p><strong>Chủ TK:</strong> {sellerQR.accountHolder}</p>
                          </div>

                          {sellerQR.qrCodeImage && (
                            <div className="flex flex-col items-center justify-center border dark:border-gray-700 bg-white p-2 rounded-xl">
                              <span className="text-[10px] text-gray-400 mb-1">Mã QR chuyển tiền người bán:</span>
                              <img
                                src={sellerQR.qrCodeImage}
                                alt="Seller Bank QR"
                                className="w-40 h-40 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(sellerQR.qrCodeImage, '_blank')}
                              />
                              <span className="text-[10px] text-emerald-600 font-bold mt-1">Chuyển đúng: {formatPrice(selectedPayment.sellerAmount || 0)} ₫</span>
                            </div>
                          )}

                          {!selectedPayment.sellerPaid ? (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">📸 Upload ảnh biên lai sau khi chuyển khoản</p>
                              {sellerPaymentPreview ? (
                                <div className="relative">
                                  <img src={sellerPaymentPreview} alt="Biên lai" className="w-full max-h-44 object-contain rounded-xl border border-gray-200 bg-white" />
                                  <button
                                    onClick={() => { setSellerPaymentFile(null); setSellerPaymentPreview(null); }}
                                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                                  >✕</button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                  <span className="text-2xl mb-1">📎</span>
                                  <span className="text-[10px] text-gray-500 font-semibold">Chọn ảnh biên lai chuyển khoản</span>
                                  <input type="file" accept="image/*" onChange={handleSellerPaymentFileChange} className="hidden" />
                                </label>
                              )}
                              <button
                                onClick={() => handleMarkSellerPaid(selectedPayment._id)}
                                disabled={sendingSellerPayment || !sellerPaymentFile}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer mt-1 flex items-center justify-center gap-2"
                              >
                                {sendingSellerPayment ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💸'}
                                {sendingSellerPayment ? 'Đang gửi...' : 'Xác nhận đã chuyển tiền + Gửi biên lai'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 rounded-xl text-center font-semibold text-xs">
                                💸 Đã chuyển tiền vào {new Date(selectedPayment.sellerPaidAt).toLocaleString('vi-VN')}
                              </div>
                              {selectedPayment.sellerPaymentProof && (
                                <div className="text-center">
                                  <p className="text-[10px] text-gray-400 mb-1">Biên lai đã gửi:</p>
                                  <img
                                    src={selectedPayment.sellerPaymentProof}
                                    alt="Biên lai chuyển khoản"
                                    className="w-full max-h-44 object-contain rounded-xl border border-gray-200 cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(selectedPayment.sellerPaymentProof, '_blank')}
                                  />
                                </div>
                              )}
                              {selectedPayment.sellerReportedIssue ? (
                                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 rounded-xl text-center text-xs">
                                  <span className="font-bold">⚠️ Người bán báo lỗi:</span> {selectedPayment.sellerReportReason}
                                  <div className="mt-1 text-[10px] opacity-75">Báo cáo lúc: {new Date(selectedPayment.sellerReportedAt).toLocaleString('vi-VN')}</div>
                                </div>
                              ) : selectedPayment.sellerConfirmedReceipt ? (
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-center font-bold text-xs">
                                  ✅ Người bán đã xác nhận nhận tiền lúc {new Date(selectedPayment.sellerReceiptConfirmedAt).toLocaleString('vi-VN')}
                                </div>
                              ) : (
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-center text-xs">
                                  ⏳ Đang chờ người bán xác nhận đã nhận tiền...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-center text-xs border border-red-100 dark:border-red-950/30">
                          ⚠️ Người bán chưa thiết lập tài khoản nhận tiền/QR. Yêu cầu người bán cập nhật trong SellerDashboard!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Receipt Image Preview */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-gray-450 uppercase tracking-widest mb-3">
                    Ảnh biên lai giao dịch (Minh chứng)
                  </h3>
                  {selectedPayment.paymentProof ? (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="relative group overflow-hidden border border-gray-200 dark:border-gray-750 rounded-2xl bg-gray-50 flex items-center justify-center p-2 max-h-[360px]">
                        <img
                          src={selectedPayment.paymentProof}
                          alt="Payment Proof"
                          className="max-h-[340px] object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <p className="font-bold flex items-center gap-1">⚠️ LƯU Ý CHO NGƯỜI DUYỆT GIAO DỊCH:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Kiểm tra xem tiền đã về tài khoản ngân hàng của bạn chưa.</li>
                          <li>Số tiền trên biên lai nhận được phải KHỚP CHÍNH XÁC với <strong>{formatPrice(selectedPayment.amount)} ₫</strong>.</li>
                          <li>Nội dung chuyển khoản hoặc mã giao dịch trên biên lai phải trùng khớp với mã <strong>{selectedPayment.transactionCode}</strong>.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-yellow-50/50 dark:bg-yellow-950/10 border border-dashed border-yellow-200 dark:border-yellow-900/30 p-8 rounded-2xl text-center">
                      <span className="text-4xl mb-2">📸</span>
                      <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400">
                        Chưa tải lên biên lai chuyển khoản
                      </p>
                      <p className="text-xs text-yellow-600/70 dark:text-yellow-500/70 mt-1">
                        Người mua chưa đính kèm ảnh minh chứng giao dịch cho lệnh thanh toán này.
                      </p>
                    </div>
                  )}
                </div>
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



