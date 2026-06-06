import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    )
    // Actually remove after animation completes
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      message,
      type,
      duration,
      isExiting: false,
    }
    setToasts((prevToasts) => [...prevToasts, newToast])
    return id;
  }, [])

  // Override window.alert to use our custom toast
  useEffect(() => {
    const originalAlert = window.alert

    window.alert = (message) => {
      if (typeof message !== 'string') {
        try {
          message = JSON.stringify(message)
        } catch (e) {
          message = String(message)
        }
      }

      // Context-aware classification in Vietnamese
      let type = 'info'
      const lowerMsg = message.toLowerCase()

      const successWords = [
        'thành công',
        'chấp nhận',
        'đã gửi',
        'được gửi',
        'xác minh thành công',
        'done',
        'ok',
        'khớp'
      ]
      
      const errorWords = [
        'lỗi',
        'thất bại',
        'không',
        'chưa',
        'hết hạn',
        'sai',
        'khóa',
        'từ chối',
        'cảnh báo'
      ]

      const warningWords = [
        'vui lòng',
        'nhập',
        'chọn',
        'kích thước',
        'vượt quá',
        'tối đa'
      ]

      // Check success words first
      if (successWords.some(word => lowerMsg.includes(word))) {
        type = 'success'
      }
      
      // If contains error terms, classify as error (error takes precedence)
      if (errorWords.some(word => lowerMsg.includes(word))) {
        type = 'error'
      } else if (warningWords.some(word => lowerMsg.includes(word))) {
        type = 'warning'
      }

      addToast(message, type)
    }

    return () => {
      window.alert = originalAlert
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100%-2.5rem)] pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const startTime = Date.now()
    const endTime = startTime + toast.duration
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      const percentage = Math.max(0, (remaining / toast.duration) * 100)
      setProgress(percentage)

      if (remaining <= 0) {
        clearInterval(interval)
        onClose()
      }
    }, 20)

    return () => clearInterval(interval)
  }, [isPaused, toast.duration, onClose])

  // Get corresponding icon and styling for each type
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white dark:bg-gray-800 border-l-4 border-green-500',
          progressBg: 'bg-green-500',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: (
            <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      case 'error':
        return {
          bg: 'bg-white dark:bg-gray-800 border-l-4 border-red-500',
          progressBg: 'bg-red-500',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: (
            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      case 'warning':
        return {
          bg: 'bg-white dark:bg-gray-800 border-l-4 border-amber-500',
          progressBg: 'bg-amber-500',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: (
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'info':
      default:
        return {
          bg: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500',
          progressBg: 'bg-blue-500',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: (
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto flex flex-col w-full shadow-2xl rounded-xl overflow-hidden ${styles.bg} transition-all duration-300 transform 
        ${toast.isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100 animate-slide-in'}
        backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 border border-gray-150 dark:border-gray-700`}
      style={{
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div className="flex items-start p-4 gap-3">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-relaxed ${styles.textColor} break-words`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full ${styles.progressBg} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
