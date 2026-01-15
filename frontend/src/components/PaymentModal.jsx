import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Toast from './Toast';

export default function PaymentModal({ order, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [bankQR, setBankQR] = useState(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [imageZoom, setImageZoom] = useState(1);

  useEffect(() => {
    if (isOpen && order) {
      checkExistingPayment();
    }
  }, [isOpen, order]);

  useEffect(() => {
    let interval = null;
    if (payment && payment.expiresAt && payment.status === 'pending' && !payment.paymentProof) {
      interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(payment.expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeRemaining('Đã hết hạn');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [payment]);

  const checkExistingPayment = async () => {
    try {
      const response = await api.get(`/payments/order/${order._id}`);
      if (response.data.success && response.data.data.payment) {
        setPayment(response.data.data.payment);
        setBankQR(response.data.data.bankQR);
        setTransactionCode(response.data.data.payment.transactionCode);
        if (response.data.data.payment.paymentProof) {
          setStep(3);
        } else {
          setStep(2);
        }
      }
    } catch (error) {
      setStep(1);
    }
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments', { orderId: order._id });
      if (response.data.success) {
        setPayment(response.data.data.payment);
        setBankQR(response.data.data.bankQR);
        setTransactionCode(response.data.data.transactionCode);
        setStep(2);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(transactionCode).then(() => {
      setToastMessage('Đã sao chép mã giao dịch!');
      setShowToast(true);
    }).catch(() => {
      setToastMessage('Không thể sao chép');
      setShowToast(true);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      setPaymentProof(file);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof) {
      alert('Vui lòng chọn ảnh biên lai');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);

      const response = await api.put(`/payments/${payment._id}/upload-proof`, formData);
      if (response.data.success) {
        setPayment(response.data.data);
        setStep(3);
        setToastMessage('Đã upload ảnh biên lai thành công!');
        setShowToast(true);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể upload ảnh biên lai');
    } finally {
      setUploading(false);
    }
  };

  const openImageLightbox = (imageUrl) => {
    setLightboxImage(imageUrl);
    setShowImageLightbox(true);
    setImageZoom(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getTimeRemainingColor = () => {
    if (!timeRemaining || timeRemaining === 'Đã hết hạn') return 'text-red-600';
    const [hours] = timeRemaining.split(':').map(Number);
    if (hours < 1) return 'text-red-600';
    if (hours < 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📖 Hướng dẫn thanh toán
                </h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Bước 1: Tạo thanh toán
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Click nút "Bắt đầu thanh toán" để tạo mã giao dịch. Mã này sẽ được dùng làm nội dung chuyển khoản.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    Bước 2: Quét QR Code
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Mở ứng dụng ngân hàng trên điện thoại, chọn tính năng quét QR code và quét mã QR hiển thị trên màn hình.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Bước 3: Kiểm tra thông tin
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Kiểm tra số tiền, số tài khoản người nhận. Đảm bảo thông tin chính xác trước khi chuyển khoản.
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                    Bước 4: Nhập nội dung chuyển khoản
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Nhập chính xác mã giao dịch vào phần "Nội dung chuyển khoản". Bạn có thể click nút "Copy" để sao chép mã.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                    Bước 5: Upload biên lai
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    Sau khi chuyển khoản thành công, chụp ảnh biên lai và upload lên hệ thống. Ảnh cần rõ ràng, đầy đủ thông tin.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    ❓ Câu hỏi thường gặp (FAQ)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Q: Tôi có bao nhiêu thời gian để upload biên lai?</p>
                      <p className="text-gray-600 dark:text-gray-400">A: Bạn có 24 giờ kể từ khi tạo thanh toán để upload biên lai.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Q: Nếu tôi quên nhập mã giao dịch vào nội dung chuyển khoản?</p>
                      <p className="text-gray-600 dark:text-gray-400">A: Vui lòng liên hệ admin để được hỗ trợ. Admin sẽ kiểm tra thủ công.</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Q: Khi nào tôi nhận được thông báo xác nhận?</p>
                      <p className="text-gray-600 dark:text-gray-400">A: Sau khi admin xác nhận thanh toán (thường trong vòng 1-2 giờ làm việc).</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Q: Tôi có thể hủy thanh toán không?</p>
                      <p className="text-gray-600 dark:text-gray-400">A: Thanh toán sẽ tự động hủy sau 24 giờ nếu không upload biên lai. Nếu đã chuyển khoản, vui lòng liên hệ admin.</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Main Payment Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thanh toán đơn hàng</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  title="Hướng dẫn"
                >
                  ❓
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Step 1: Create Payment */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Thông tin đơn hàng
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Sản phẩm: <strong>{order.productId?.title}</strong>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Tổng tiền: <strong className="text-red-600">{formatPrice(order.finalPrice)} ₫</strong>
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    ⚠️ Sau khi click "Thanh toán", bạn sẽ nhận được mã giao dịch. 
                    Vui lòng quét QR code và chuyển khoản với nội dung là mã giao dịch này.
                  </p>
                </div>

                <button
                  onClick={handleCreatePayment}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Đang tạo thanh toán...' : 'Bắt đầu thanh toán'}
                </button>
              </div>
            )}

            {/* Step 2: Show QR Code and Upload Proof */}
            {step === 2 && bankQR && (
              <div className="space-y-4">
                {/* Countdown Timer */}
                {timeRemaining && (
                  <div className={`bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 ${timeRemaining === 'Đã hết hạn' ? 'border-red-500' : 'border-red-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          ⏰ Thời gian còn lại để upload biên lai:
                        </p>
                        <p className={`text-2xl font-bold font-mono ${getTimeRemainingColor()}`}>
                          {timeRemaining}
                        </p>
                      </div>
                      {timeRemaining !== 'Đã hết hạn' && (
                        <div className="text-red-600 dark:text-red-400 text-4xl">⏳</div>
                      )}
                    </div>
                    {timeRemaining !== 'Đã hết hạn' && (
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        Vui lòng upload biên lai trước khi hết hạn để tránh thanh toán bị hủy tự động
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-800 dark:text-green-200 font-bold text-lg">
                      Mã giao dịch của bạn:
                    </p>
                    <button
                      onClick={handleCopyCode}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      title="Sao chép mã"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="text-3xl font-mono font-bold text-green-600 dark:text-green-400 text-center py-2 bg-white dark:bg-gray-700 rounded">
                    {transactionCode}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2 text-center">
                    ⚠️ Vui lòng ghi chính xác mã này vào nội dung chuyển khoản
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg">
                  <p className="text-center font-semibold mb-2 text-gray-900 dark:text-white">
                    QR Code Ngân Hàng
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={bankQR.qrCodeImage}
                      alt="QR Code"
                      className="w-64 h-64 object-contain border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:opacity-80"
                      onClick={() => openImageLightbox(bankQR.qrCodeImage)}
                    />
                  </div>
                  <div className="text-center space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>Ngân hàng:</strong> {bankQR.bankName}</p>
                    <p><strong>Số tài khoản:</strong> {bankQR.accountNumber}</p>
                    <p><strong>Chủ tài khoản:</strong> {bankQR.accountHolder}</p>
                    <p className="text-red-600 dark:text-red-400 font-bold mt-2">
                      Số tiền: {formatPrice(order.finalPrice)} ₫
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Hướng dẫn:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Quét QR code bằng ứng dụng ngân hàng của bạn</li>
                    <li>Kiểm tra số tiền: <strong>{formatPrice(order.finalPrice)} ₫</strong></li>
                    <li>Nhập nội dung chuyển khoản: <strong className="font-mono">{transactionCode}</strong> (click Copy để sao chép)</li>
                    <li>Hoàn tất chuyển khoản</li>
                    <li>Upload ảnh biên lai bên dưới</li>
                  </ol>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload ảnh biên lai chuyển khoản
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100
                      dark:file:bg-orange-900/20 dark:file:text-orange-300"
                  />
                  {paymentProof && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Đã chọn: {paymentProof.name}</p>
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(paymentProof)}
                          alt="Preview"
                          className="max-w-full rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
                          onClick={() => openImageLightbox(URL.createObjectURL(paymentProof))}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          Click để xem lớn
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleUploadProof}
                    disabled={!paymentProof || uploading || timeRemaining === 'Đã hết hạn'}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Đang upload...' : 'Xác nhận đã chuyển khoản'}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Submitted */}
            {step === 3 && payment && (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                  <p className="text-yellow-800 dark:text-yellow-200 font-bold text-lg mb-2">
                    ⏳ Đang chờ admin xác nhận
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Bạn đã upload ảnh biên lai thành công. 
                    Vui lòng chờ admin xác nhận thanh toán.
                  </p>
                </div>

                {payment.paymentProof && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ảnh biên lai đã upload:
                    </p>
                    <div className="relative">
                      <img
                        src={payment.paymentProof}
                        alt="Payment Proof"
                        className="w-full rounded border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
                        onClick={() => openImageLightbox(payment.paymentProof)}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        Click để xem lớn
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Mã giao dịch:</strong> <span className="font-mono">{payment.transactionCode}</span>
                      </p>
                      <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
                        <strong>Trạng thái:</strong> {payment.status === 'pending' ? 'Chờ xác nhận' : payment.status}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      📋 Copy mã
                    </button>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
