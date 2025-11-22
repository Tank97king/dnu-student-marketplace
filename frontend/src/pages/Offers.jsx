import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Offers() {
  const { user } = useSelector(state => state.auth);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'sent', 'received', 'all'
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user, activeTab]);

  const loadOffers = async () => {
    try {
      const response = await api.get(`/offers?type=${activeTab}`);
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chấp nhận đề nghị giá này?')) return;
    
    try {
      await api.put(`/offers/${offerId}/accept`);
      alert('Đã chấp nhận đề nghị giá và tạo đơn hàng');
      loadOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể chấp nhận đề nghị giá');
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối đề nghị giá này?')) return;
    
    try {
      await api.put(`/offers/${offerId}/reject`);
      alert('Đã từ chối đề nghị giá');
      loadOffers();
    } catch (error) {
      alert('Không thể từ chối đề nghị giá');
    }
  };

  const handleCounterOffer = async (offerId) => {
    if (!counterPrice || parseFloat(counterPrice) <= 0) {
      alert('Vui lòng nhập giá đề nghị lại hợp lệ');
      return;
    }

    try {
      await api.put(`/offers/${offerId}/counter`, {
        counterOfferPrice: parseFloat(counterPrice),
        sellerMessage: counterMessage
      });
      alert('Đã gửi đề nghị giá lại');
      setSelectedOffer(null);
      setCounterPrice('');
      setCounterMessage('');
      loadOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể gửi đề nghị giá lại');
    }
  };

  const handleAcceptCounterOffer = async (offerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chấp nhận đề nghị giá này?')) return;
    
    try {
      await api.put(`/offers/${offerId}/accept-counter`);
      alert('Đã chấp nhận đề nghị giá và tạo đơn hàng');
      loadOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể chấp nhận đề nghị giá');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      countered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ phản hồi',
      accepted: 'Đã chấp nhận',
      rejected: 'Đã từ chối',
      countered: 'Đã thương lượng lại',
      expired: 'Hết hạn',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem đề nghị giá</p>
            <Link to="/login" className="text-primary-600 hover:underline mt-2 inline-block">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Đề nghị giá</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'received'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đề nghị nhận được ({offers.filter(o => o.status === 'pending' || o.status === 'countered').length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'sent'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đề nghị đã gửi
              </button>
            </div>
          </div>
        </div>

        {/* Offers List */}
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : offers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Chưa có đề nghị giá nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={offer.productId?.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={offer.productId?.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/products/${offer.productId?._id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600"
                        >
                          {offer.productId?.title}
                        </Link>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Giá gốc: <span className="line-through">{formatPrice(offer.productId?.price)} ₫</span>
                          </p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            Đề nghị: {formatPrice(offer.offerPrice)} ₫
                          </p>
                          {offer.counterOfferPrice && (
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
                              Đề nghị lại: {formatPrice(offer.counterOfferPrice)} ₫
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        {activeTab === 'received' ? 'Người mua:' : 'Người bán:'} {offer.buyerId?.name || offer.sellerId?.name}
                      </p>
                      {offer.message && (
                        <p className="mt-1">Tin nhắn: {offer.message}</p>
                      )}
                      {offer.sellerMessage && (
                        <p className="mt-1 text-blue-600 dark:text-blue-400">Phản hồi người bán: {offer.sellerMessage}</p>
                      )}
                      <p className="mt-1">{new Date(offer.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(offer.status)}`}>
                    {getStatusText(offer.status)}
                  </span>
                </div>

                {/* Action Buttons */}
                {activeTab === 'received' && offer.status === 'pending' && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAcceptOffer(offer._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => setSelectedOffer(offer)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Thương lượng lại
                    </button>
                  </div>
                )}

                {activeTab === 'sent' && offer.status === 'countered' && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAcceptCounterOffer(offer._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Chấp nhận đề nghị lại
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn hủy đề nghị giá này?')) {
                          api.put(`/offers/${offer._id}/cancel`).then(() => loadOffers());
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Hủy đề nghị
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Counter Offer Modal */}
        {selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thương lượng lại</h3>
              
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Đề nghị ban đầu:</p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(selectedOffer.offerPrice)} ₫
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Giá đề nghị lại (VNĐ) *
                </label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="Nhập giá đề nghị lại..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  min="0"
                  max={selectedOffer.productId?.price}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tin nhắn (tùy chọn)
                </label>
                <textarea
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedOffer(null);
                    setCounterPrice('');
                    setCounterMessage('');
                  }}
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleCounterOffer(selectedOffer._id)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Gửi đề nghị lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

