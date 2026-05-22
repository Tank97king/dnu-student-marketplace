import React, { createContext, useContext, useState, useRef } from 'react';

/**
 * ConfirmModal - Component hiển thị hộp thoại xác nhận tùy chỉnh (thay thế cho window.confirm)
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Hàm gọi khi nhấn Hủy/đóng
 * @param {function} onConfirm - Hàm gọi khi nhấn Xác nhận
 * @param {string} title - Tiêu đề
 * @param {string} message - Nội dung câu hỏi/thông tin xác nhận
 * @param {string} type - Loại modal: 'success', 'error', 'warning', 'info', 'question'
 * @param {string} confirmText - Chữ hiển thị nút xác nhận
 * @param {string} cancelText - Chữ hiển thị nút hủy
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  type = 'question',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ'
}) {
  if (!isOpen) return null;

  // Màu sắc & Icon động tương ứng với loại modal
  const typeStyles = {
    success: {
      border: 'border-green-200 dark:border-green-800',
      icon: '✓',
      iconBg: 'bg-green-500 text-white',
      confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/20'
    },
    error: {
      border: 'border-red-200 dark:border-red-800',
      icon: '✕',
      iconBg: 'bg-red-500 text-white',
      confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/20'
    },
    warning: {
      border: 'border-yellow-250 dark:border-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-500 text-white',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 shadow-yellow-500/20'
    },
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-500 text-white',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-500/20'
    },
    question: {
      border: 'border-indigo-200 dark:border-indigo-800/80',
      icon: '❓',
      iconBg: 'bg-indigo-500 text-white',
      confirmButton: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-500/20'
    }
  };

  const style = typeStyles[type] || typeStyles.question;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in ${style.border} border border-gray-150 dark:border-gray-700 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="p-6 pb-4 flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <div className={`${style.iconBg} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg animate-bounce-subtle`}>
              {style.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 dark:bg-gray-900/40 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-750">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-5 border border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-98 text-sm cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-5 ${style.confirmButton} text-white font-bold rounded-2xl transition-all duration-200 shadow-md active:scale-98 text-sm cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Internal CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'Xác nhận',
    message: '',
    type: 'question',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ'
  });

  const resolverRef = useRef(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setModalState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message: options.message || '',
        type: options.type || 'question',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy bỏ'
      });
    });
  };

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
