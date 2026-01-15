import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function NotificationSettings() {
  const { user } = useSelector(state => state.auth);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const saveSettings = async (newSettings) => {
    try {
      setSaving(true);
      setMessage('');
      const response = await api.put('/notifications/settings', newSettings);
      setSettings(response.data.data);
      setMessage('Đã cập nhật cài đặt thông báo');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage('Có lỗi xảy ra khi lưu cài đặt');
      setTimeout(() => setMessage(''), 3000);
      // Revert on error
      loadSettings();
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: 'favoritePriceDrop',
      title: 'Sản phẩm yêu thích giảm giá',
      description: 'Nhận thông báo khi sản phẩm trong danh sách yêu thích đang được nhiều người quan tâm',
      icon: '❤️'
    },
    {
      key: 'reviewReminder',
      title: 'Nhắc nhở đánh giá',
      description: 'Nhận thông báo nhắc nhở đánh giá sản phẩm sau 3 ngày mua hàng',
      icon: '⭐'
    },
    {
      key: 'productTrending',
      title: 'Sản phẩm đang hot',
      description: 'Nhận thông báo khi sản phẩm của bạn đang được nhiều người xem',
      icon: '🔥'
    },
    {
      key: 'newOffer',
      title: 'Đề nghị giá mới',
      description: 'Nhận thông báo khi có người đề nghị giá cho sản phẩm của bạn',
      icon: '💰'
    },
    {
      key: 'newMessage',
      title: 'Tin nhắn mới',
      description: 'Nhận thông báo khi có tin nhắn mới',
      icon: '💬'
    },
    {
      key: 'newComment',
      title: 'Bình luận mới',
      description: 'Nhận thông báo khi có bình luận mới trên sản phẩm của bạn',
      icon: '💭'
    },
    {
      key: 'newReview',
      title: 'Đánh giá mới',
      description: 'Nhận thông báo khi có đánh giá mới cho sản phẩm của bạn',
      icon: '⭐'
    },
    {
      key: 'productApproved',
      title: 'Sản phẩm được duyệt',
      description: 'Nhận thông báo khi sản phẩm của bạn được admin duyệt',
      icon: '✅'
    },
    {
      key: 'productRejected',
      title: 'Sản phẩm bị từ chối',
      description: 'Nhận thông báo khi sản phẩm của bạn bị admin từ chối',
      icon: '❌'
    },
    {
      key: 'paymentNotification',
      title: 'Thông báo thanh toán',
      description: 'Nhận thông báo về trạng thái thanh toán (chờ xác nhận, đã xác nhận, bị từ chối)',
      icon: '💳'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem cài đặt</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cài đặt thông báo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Chọn loại thông báo bạn muốn nhận
            </p>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-3 rounded-lg ${
              message.includes('lỗi') 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="p-6">
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div
                  key={type.key}
                  className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings?.[type.key] !== false}
                      onChange={() => handleToggle(type.key)}
                      disabled={saving}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Lưu ý:</strong> Các thông báo quan trọng như thanh toán và đơn hàng sẽ luôn được gửi, 
                bất kể cài đặt của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

