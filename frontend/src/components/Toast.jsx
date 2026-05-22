import React, { useEffect } from 'react';

export default function Toast({ 
  message, 
  title, 
  type = 'success', 
  isVisible, 
  onClose,
  actionLabel,
  onAction 
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5 seconds for visibility
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Icon and color configuration based on type
  let iconSvg = null;
  let accentColor = 'bg-blue-500';
  let iconBg = 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400';
  let defaultTitle = 'Thông báo';

  if (type === 'success') {
    accentColor = 'bg-emerald-500';
    iconBg = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400';
    defaultTitle = 'Thành công!';
    iconSvg = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (type === 'error') {
    accentColor = 'bg-rose-500';
    iconBg = 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400';
    defaultTitle = 'Lỗi xảy ra!';
    iconSvg = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  } else if (type === 'warning') {
    accentColor = 'bg-amber-500';
    iconBg = 'bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400';
    defaultTitle = 'Cảnh báo!';
    iconSvg = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  } else {
    // info or compare
    accentColor = 'bg-blue-500';
    iconBg = 'bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400';
    defaultTitle = 'Thông báo';
    iconSvg = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  const finalTitle = title || defaultTitle;

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in max-w-sm w-[360px]">
      <div className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start hover:scale-[1.02] transition-transform duration-300">
        
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} />

        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${iconBg} mt-0.5`}>
          {iconSvg}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
            {finalTitle}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-normal break-words">
            {message}
          </p>

          {/* Action button (e.g. Xem ngay) */}
          {actionLabel && onAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="mt-2.5 text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              {actionLabel}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          aria-label="Đóng thông báo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
