import React, { useState } from 'react';
import api from '../utils/api';

export default function ReportModal({ productId, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState('Hàng giả, hàng nhái, vi phạm bản quyền');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportReasons = [
    'Hàng giả, hàng nhái, vi phạm bản quyền',
    'Sản phẩm không đúng mô tả thực tế',
    'Có dấu hiệu lừa đảo hoặc giá quá cao',
    'Sản phẩm bị cấm kinh doanh hoặc nguy hại',
    'Thông tin liên hệ sai lệch hoặc quấy rối',
    'Lý do khác'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (reason === 'Lý do khác' && !description.trim()) {
      setError('Vui lòng điền chi tiết lý do báo cáo của bạn.');
      return;
    }

    setLoading(true);
    try {
      const finalReason = reason === 'Lý do khác' 
        ? `Lý do khác: ${description.trim()}`
        : description.trim() 
        ? `${reason} - Chi tiết: ${description.trim()}` 
        : reason;

      const response = await api.post(`/products/${productId}/report`, {
        reason: finalReason
      });

      if (response.data.success) {
        onReportSuccess(response.data.message || 'Gửi báo cáo thành công.');
        onClose();
        setReason('Hàng giả, hàng nhái, vi phạm bản quyền');
        setDescription('');
      } else {
        setError(response.data.message || 'Không thể gửi báo cáo.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 animate-slide-up overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                Báo cáo vi phạm
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Giúp bảo vệ cộng đồng mua bán lành mạnh.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-55 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Lý do báo cáo *
            </label>
            <div className="space-y-2">
              {reportReasons.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                    reason === item
                      ? 'border-red-500 bg-red-50/30 text-red-600 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400'
                      : 'border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={item}
                    checked={reason === item}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 accent-red-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Chi tiết thêm {reason === 'Lý do khác' ? '*' : '(Tùy chọn)'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                reason === 'Lý do khác'
                  ? 'Vui lòng cung cấp thêm thông tin chi tiết về hành vi vi phạm...'
                  : 'Cung cấp thêm bằng chứng hoặc mô tả chi tiết nếu có...'
              }
              className="w-full px-4 py-3 text-sm border border-gray-100 dark:border-gray-700 rounded-2xl dark:bg-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
              rows="3"
              required={reason === 'Lý do khác'}
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl border border-rose-100 dark:border-rose-900/30">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-100 dark:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                'Gửi báo cáo'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
