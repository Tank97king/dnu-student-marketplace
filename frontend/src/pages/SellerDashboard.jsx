import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function SellerDashboard() {
  const { user } = useSelector(state => state.auth);
  const { userId } = useParams();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'

  useEffect(() => {
    if (user && (userId || user.id)) {
      loadStats();
      loadOrders();
    }
  }, [user, userId, timeRange]);

  useEffect(() => {
    if (user && (userId || user.id)) {
      loadOrders();
    }
  }, [orderStatusFilter]);

  const loadStats = async () => {
    try {
      const targetUserId = userId || user.id;
      const response = await api.get(`/users/${targetUserId}/seller-stats?timeRange=${timeRange}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading seller stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get(`/orders?type=selling${orderStatusFilter !== 'all' ? `&status=${orderStatusFilter}` : ''}`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? response.data.data : o));
      alert('Đã cập nhật trạng thái đơn hàng');
      loadStats(); // Refresh stats
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
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
            <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Người Bán</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">1 năm qua</option>
            <option value="all">Tất cả</option>
          </select>
        </div>

        {stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lượt xem</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Yêu thích</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFavorites || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">❤️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tin nhắn</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đề nghị giá</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOffers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đã bán</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.soldProducts || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.totalRevenue || 0)} ₫</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💵</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            {stats.topProducts && stats.topProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sản phẩm nổi bật</h2>
                <div className="space-y-3">
                  {stats.topProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>👁️ {product.viewCount || 0}</span>
                          <span>❤️ {product.favoriteCount || 0}</span>
                          <span>💰 {formatPrice(product.price)} ₫</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu thống kê</p>
          </div>
        )}

        {/* Orders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đơn bán</h2>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {ordersLoading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Chưa có đơn bán nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <div key={order._id} className="p-6">
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
                        <span>Người mua: {order.buyerId?.name || 'N/A'}</span>
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
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Xác nhận đơn hàng
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'completed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Đánh dấu hoàn thành
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/products/${order.productId?._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Xem chi tiết sản phẩm →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
