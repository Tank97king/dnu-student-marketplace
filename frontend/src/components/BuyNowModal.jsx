import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function BuyNowModal({ product, isOpen, onClose, onOrderCreated }) {
  const { user } = useSelector(state => state.auth);
  const [deliveryMethod, setDeliveryMethod] = useState('meetup');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setShippingAddress({
        fullName: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        ward: '',
        district: '',
        city: '',
        note: ''
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate based on delivery method
    if (deliveryMethod === 'delivery') {
      if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
        setError('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng');
        return;
      }
    } else if (deliveryMethod === 'meetup') {
      if (!shippingAddress.fullName || !shippingAddress.phone) {
        setError('Vui lòng điền tên và số điện thoại để liên hệ');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/orders', {
        productId: product._id,
        shippingAddress: deliveryMethod !== 'pickup' ? shippingAddress : null,
        deliveryMethod,
        notes: notes.trim()
      });
      
      onOrderCreated(response.data.data);
      onClose();
      alert('Đã tạo đơn hàng thành công! Vui lòng chờ người bán xác nhận.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mua ngay</h3>
        
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm:</p>
          <p className="font-semibold text-gray-900 dark:text-white">{product.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Giá:</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {product.price.toLocaleString('vi-VN')} ₫
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Phương thức nhận hàng *
            </label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="meetup">Gặp mặt trực tiếp</option>
              <option value="pickup">Tự đến lấy</option>
              <option value="delivery">Giao hàng</option>
            </select>
          </div>

          {deliveryMethod !== 'pickup' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Họ tên người nhận *
                </label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                  placeholder="Nhập họ tên..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </>
          )}

          {deliveryMethod === 'delivery' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Địa chỉ chi tiết *
                </label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.ward}
                    onChange={(e) => setShippingAddress({...shippingAddress, ward: e.target.value})}
                    placeholder="Phường/Xã"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                    placeholder="Quận/Huyện"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  placeholder="Tỉnh/Thành phố"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho người bán..."
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows="3"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang tạo...' : 'Xác nhận mua'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













