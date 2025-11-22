import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Orders() {
  const { user } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all'); // 'all', 'buying', 'selling'

  useEffect(() => {
    // Redirect to seller dashboard if selling tab is selected
    if (activeTab === 'selling') {
      navigate('/seller-dashboard');
      return;
    }
    
    if (user) {
      loadOrders();
    }
  }, [user, activeTab, navigate]);

  const loadOrders = async () => {
    try {
      const response = await api.get(`/orders?type=${activeTab}`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
      alert('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem đơn hàng</p>
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
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Quản lý đơn hàng</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'buying'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Đơn mua ({orders.filter(o => o.buyerId?._id === user.id).length})
              </button>
              <button
                onClick={() => navigate('/seller-dashboard')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
              >
                Đơn bán ({orders.filter(o => o.sellerId?._id === user.id).length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isBuyer = order.buyerId?._id === user.id;
              const otherUser = isBuyer ? order.sellerId : order.buyerId;

              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src={order.productId?.images?.[0] || 'https://via.placeholder.com/80'}
                          alt={order.productId?.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/products/${order.productId?._id}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600"
                          >
                            {order.productId?.title}
                          </Link>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {formatPrice(order.finalPrice)} ₫
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {isBuyer ? 'Người bán:' : 'Người mua:'} {otherUser?.name || 'N/A'}
                        </span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isBuyer ? (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Hủy đơn hàng
                        </button>
                      ) : null}
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isBuyer ? (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'completed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Xác nhận đã nhận hàng
                        </button>
                      ) : null}
                    </div>
                  )}
                  
                  {order.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/products/${order.productId?._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Đánh giá sản phẩm →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

