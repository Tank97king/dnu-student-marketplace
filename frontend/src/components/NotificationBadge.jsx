import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../utils/api';

export default function NotificationBadge() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [deletingId, setDeletingId] = useState(null);
  const dropdownRef = useRef(null);
  const notificationRefs = useRef({});

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      console.warn('🔔 Notification fetch timeout');
    }, 10000); // 10 seconds timeout

    try {
      const res = await api.get('/notifications');
      clearTimeout(timeoutId);
      
      if (res.data && res.data.success) {
        setNotifications(res.data.data || []);
        console.log('🔔 Fetched notifications:', res.data.data?.length || 0);
      } else if (res.data) {
        // Handle case where API doesn't return success field
        const data = res.data.data || res.data;
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/count');
      if (res.data && res.data.success) {
        setUnreadCount(res.data.count || 0);
      } else {
        setUnreadCount(res.data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    // Join user room
    newSocket.emit('join-room', user.id);
    console.log('🔔 NotificationBadge: Joined room for user', user.id);

    // Listen for new notifications
    newSocket.on('new-notification', (notification) => {
      console.log('🔔 NotificationBadge: Received new notification', notification);
      setNotifications(prev => {
        // Check if notification already exists (prevent duplicates)
        const exists = prev.some(n => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification._id
          });
        } catch (err) {
          console.error('Error showing browser notification:', err);
        }
      }
    });

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('🔔 Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('🔔 Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔔 Socket connection error:', error);
    });

    // Fetch initial data
    fetchNotifications();
    fetchUnreadCount();

    // Request browser notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(err => {
        console.error('Error requesting notification permission:', err);
      });
    }

    return () => {
      if (newSocket) {
        newSocket.emit('leave-room', user.id);
        newSocket.disconnect();
      }
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is not on the notification button
        const button = event.target.closest('button');
        if (!button || !button.querySelector('svg')) {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);


  const handleMarkAsRead = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!id) {
      console.warn('Cannot mark notification as read: missing id');
      return;
    }
    
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async (event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!id) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Update unread count if notification was unread
      const notification = notifications.find(n => n._id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotificationClick = async (notification, event) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      // Mark as read if not already read
      if (!notification.isRead && notification._id) {
        await handleMarkAsRead(notification._id);
      }
      
      // Small delay before closing to show feedback
      setTimeout(() => {
        setShowDropdown(false);
      }, 100);

      // Navigate based on notification type and data
      const navigateTo = getNavigationPath(notification);
      if (navigateTo) {
        navigate(navigateTo);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      setShowDropdown(false);
    }
  };

  const getNavigationPath = (notification) => {
    // Priority: data.productId > type-based navigation
    if (notification.data?.productId) {
      return `/products/${notification.data.productId}`;
    }

    switch (notification.type) {
      case 'product_approved':
      case 'product_rejected':
        return notification.data?.productId 
          ? `/products/${notification.data.productId}`
          : '/products';
      
      case 'new_message':
        return '/chat';
      
      case 'offer_accepted':
      case 'offer_rejected':
      case 'offer_countered':
      case 'new_offer':
      case 'payment_pending_review':
      case 'payment_confirmed':
      case 'payment_rejected':
      case 'payment_expired':
        return '/orders';
      
      case 'new_coupon':
        return '/my-promotions';
      
      case 'new_comment':
      case 'new_review':
        return notification.data?.productId 
          ? `/products/${notification.data.productId}`
          : null;
      
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Không xác định';
      
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Vừa xong';
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} phút trước`;
      }
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} giờ trước`;
      }
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} ngày trước`;
      }
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Không xác định';
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'product_approved': '✅',
      'product_rejected': '❌',
      'new_message': '💬',
      'new_comment': '💭',
      'new_review': '⭐',
      'new_offer': '💰',
      'offer_countered': '💰',
      'offer_accepted': '✅',
      'offer_rejected': '❌',
      'product_interested': '❤️',
      'product_favorited': '❤️',
      'user_followed': '👤',
      'favorite_price_drop': '📉',
      'review_reminder': '⭐',
      'product_trending': '🔥',
      'payment_pending_review': '💳',
      'payment_confirmed': '✅',
      'payment_rejected': '❌',
      'payment_expired': '⏰',
      'order_expired': '⏰',
      'offer_expired': '⏰',
      'new_coupon': '🎟️'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'product_approved': 'text-green-600 dark:text-green-400',
      'product_rejected': 'text-red-600 dark:text-red-400',
      'new_message': 'text-blue-600 dark:text-blue-400',
      'new_offer': 'text-yellow-600 dark:text-yellow-400',
      'offer_accepted': 'text-green-600 dark:text-green-400',
      'offer_rejected': 'text-red-600 dark:text-red-400',
      'payment_confirmed': 'text-green-600 dark:text-green-400',
      'payment_rejected': 'text-red-600 dark:text-red-400',
      'new_coupon': 'text-purple-600 dark:text-purple-400'
    };
    return colors[type] || 'text-gray-600 dark:text-gray-400';
  };

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleToggleDropdown = useCallback(() => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    if (newState) {
      // Only fetch if we don't have notifications or if it's been a while
      if (notifications.length === 0) {
        setLoading(true);
        fetchNotifications();
      }
      fetchUnreadCount();
    } else {
      // Reset loading when closing
      setLoading(false);
    }
  }, [showDropdown, fetchNotifications, fetchUnreadCount, notifications.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <button
        onClick={handleToggleDropdown}
        className="relative flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Thông báo"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-20"
            onClick={() => setShowDropdown(false)}
          />
          <div 
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-[100] max-h-[600px] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              top: 'calc(100% + 0.5rem)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Đánh dấu tất cả
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Đóng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Chưa đọc {filter === 'unread' && filteredNotifications.length > 0 && `(${filteredNotifications.length})`}
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
                  </p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id || Math.random()}
                      className={`group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={(e) => handleNotificationClick(notification, e)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <span className={`text-2xl flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-200 break-words">
                            {notification.title || 'Thông báo'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words line-clamp-2">
                            {notification.message || ''}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-start space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Đánh dấu đã đọc"
                              aria-label="Đánh dấu đã đọc"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            disabled={deletingId === notification._id}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="Xóa thông báo"
                            aria-label="Xóa thông báo"
                          >
                            {deletingId === notification._id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
