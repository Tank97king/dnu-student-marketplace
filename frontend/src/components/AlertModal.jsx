import React from 'react';

/**
 * AlertModal - Component hiển thị thông báo đơn giản với nút OK
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Hàm đóng modal
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'success', 'error', 'warning', 'info'
 */
export default function AlertModal({
    isOpen,
    onClose,
    title = 'Thông báo',
    message,
    type = 'info'
}) {
    if (!isOpen) return null;

    // Màu sắc theo loại thông báo
    const typeStyles = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: '✓',
            iconBg: 'bg-green-500',
            button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: '✕',
            iconBg: 'bg-red-500',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: '⚠',
            iconBg: 'bg-yellow-500',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'ℹ',
            iconBg: 'bg-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const style = typeStyles[type] || typeStyles.info;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in ${style.border} border-2`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header với icon */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-center mb-4">
                        <div className={`${style.iconBg} w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                            {style.icon}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer với nút OK */}
                <div className="p-6 pt-2">
                    <button
                        onClick={onClose}
                        className={`w-full ${style.button} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg`}
                    >
                        OK
                    </button>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
