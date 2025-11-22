import React, { useState } from 'react';
import api from '../utils/api';

export default function OfferModal({ product, isOpen, onClose, onOfferCreated }) {
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      setError('Vui lòng nhập giá đề nghị hợp lệ');
      return;
    }

    const price = parseFloat(offerPrice);
    if (price > product.price) {
      setError(`Giá đề nghị không được vượt quá giá gốc ${product.price.toLocaleString('vi-VN')} ₫`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/offers', {
        productId: product._id,
        offerPrice: price,
        message: message.trim()
      });
      
      onOfferCreated(response.data.data);
      onClose();
      setOfferPrice('');
      setMessage('');
      alert('Đề nghị giá đã được gửi thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi đề nghị giá');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Đề nghị giá</h3>
        
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Giá gốc:</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {product.price.toLocaleString('vi-VN')} ₫
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Giá đề nghị (VNĐ) *
            </label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="Nhập giá đề nghị..."
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              min="0"
              max={product.price}
              required
            />
            {offerPrice && parseFloat(offerPrice) > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Giảm: {((product.price - parseFloat(offerPrice)) / product.price * 100).toFixed(0)}%
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tin nhắn (tùy chọn)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn cho người bán..."
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
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang gửi...' : 'Gửi đề nghị'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

