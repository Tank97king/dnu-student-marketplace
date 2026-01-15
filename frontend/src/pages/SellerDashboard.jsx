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
  const [timeRange, setTimeRange] = useState('month');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'revenue', 'products', 'reviews'

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
      setLoading(true);
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
      loadStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
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

  const getTimeRangeText = () => {
    const texts = {
      week: '7 ngày qua',
      month: '30 ngày qua',
      year: '1 năm qua',
      all: 'Tất cả'
    };
    return texts[timeRange] || timeRange;
  };

  // Render bar chart for revenue
  const renderRevenueChart = (data, maxValue) => {
    if (!data || data.length === 0) return null;
    
    return (
      <div className="space-y-2">
        {data.map((item) => {
          const percentage = maxValue > 0 ? (item.revenue / maxValue) * 100 : 0;
          return (
            <div key={item._id} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-gray-600 dark:text-gray-400 text-right">
                {item._id}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-xs font-semibold text-white">
                    {formatPrice(item.revenue)} ₫
                  </span>
                </div>
              </div>
              <div className="w-20 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {item.count} giao dịch
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render conversion funnel
  const renderConversionFunnel = () => {
    if (!stats) return null;
    
    const steps = [
      { label: 'Lượt xem', value: stats.totalViews || 0, color: 'bg-blue-500' },
      { label: 'Đề nghị giá', value: stats.totalOffers || 0, color: 'bg-purple-500' },
      { label: 'Đơn hàng', value: stats.totalOrders || 0, color: 'bg-yellow-500' },
      { label: 'Thanh toán', value: stats.conversionRates?.orderToPayment ? Math.round((stats.totalOrders * parseFloat(stats.conversionRates.orderToPayment)) / 100) : 0, color: 'bg-green-500' }
    ];

    const maxValue = Math.max(...steps.map(s => s.value), 1);

    return (
      <div className="space-y-3">
        {steps.map((step, index) => {
          const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const conversionRate = index > 0 && steps[index - 1].value > 0 
            ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
            : '100';
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {step.label}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {step.value.toLocaleString('vi-VN')}
                  </span>
                  {index > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({conversionRate}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                <div
                  className={`${step.color} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                >
                  {step.value > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {step.value.toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Người Bán</h1>
          <div className="flex items-center space-x-4">
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
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4 px-6">
              {[
                { id: 'overview', label: 'Tổng quan', icon: '📊' },
                { id: 'revenue', label: 'Doanh thu', icon: '💰' },
                { id: 'products', label: 'Sản phẩm', icon: '📦' },
                { id: 'reviews', label: 'Đánh giá', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {stats ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Key Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu ({getTimeRangeText()})</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(stats.totalRevenue || 0)} ₫
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💵</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm đang bán</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.availableProducts || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          / {stats.totalProducts || 0} tổng
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Đã bán ({getTimeRangeText()})</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.soldProducts || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ chuyển đổi</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.conversionRates?.overall || 0}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          View → Payment
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Tỷ lệ chuyển đổi (Conversion Funnel)
                  </h2>
                  {renderConversionFunnel()}
                  
                  {/* Conversion Rates Details */}
                  {stats.conversionRates && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">View → Offer</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stats.conversionRates.viewToOffer}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Offer → Order</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {stats.conversionRates.offerToOrder}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order → Payment</p>
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.conversionRates.orderToPayment}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thể</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {stats.conversionRates.overall}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <>
                {/* Revenue Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng doanh thu</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(stats.totalRevenue || 0)} ₫
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTimeRangeText()}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số giao dịch</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalOrders || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Đơn hàng đã hoàn thành
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trung bình/đơn</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatPrice(stats.totalOrders > 0 ? (stats.totalRevenue || 0) / stats.totalOrders : 0)} ₫
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Giá trị trung bình
                    </p>
                  </div>
                </div>

                {/* Daily Revenue Chart */}
                {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Doanh thu theo ngày (30 ngày gần nhất)
                    </h2>
                    {renderRevenueChart(
                      stats.dailyRevenue,
                      Math.max(...stats.dailyRevenue.map(d => d.revenue), 1)
                    )}
                  </div>
                )}

                {/* Monthly Revenue Chart */}
                {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Doanh thu theo tháng (12 tháng gần nhất)
                    </h2>
                    {renderRevenueChart(
                      stats.monthlyRevenue,
                      Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1)
                    )}
                  </div>
                )}

                {/* Revenue by Category */}
                {stats.revenueByCategory && stats.revenueByCategory.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Doanh thu theo danh mục
                    </h2>
                    <div className="space-y-3">
                      {stats.revenueByCategory.map((cat) => {
                        const totalRevenue = stats.revenueByCategory.reduce((sum, c) => sum + c.revenue, 0);
                        const percentage = totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0;
                        return (
                          <div key={cat._id}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {cat._id}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatPrice(cat.revenue)} ₫
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({cat.count} sản phẩm)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <>
                {/* Top Products by Revenue */}
                {stats.topProductsByRevenue && stats.topProductsByRevenue.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Top sản phẩm bán chạy (theo doanh thu)
                    </h2>
                    <div className="space-y-3">
                      {stats.topProductsByRevenue.map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {index + 1}
                          </div>
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <Link
                              to={`/products/${product._id}`}
                              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              {product.title}
                            </Link>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>📦 {product.category}</span>
                              <span>•</span>
                              <span>🛒 {product.count} giao dịch</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                              {formatPrice(product.revenue)} ₫
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Products by Views */}
                {stats.topProductsByViews && stats.topProductsByViews.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Sản phẩm được xem nhiều nhất
                    </h2>
                    <div className="space-y-3">
                      {stats.topProductsByViews.map((product) => (
                        <Link
                          key={product._id}
                          to={`/products/${product._id}`}
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
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
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && stats.reviewStats && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đánh giá trung bình</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.reviewStats.averageRating || 0}
                      </p>
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng số đánh giá</p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.reviewStats.totalReviews || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tỷ lệ phản hồi</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalOrders > 0 
                        ? Math.round((stats.reviewStats.totalReviews / stats.totalOrders) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                {stats.reviewStats.ratingDistribution && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Phân bố đánh giá
                    </h2>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.reviewStats.ratingDistribution[rating] || 0;
                        const total = stats.reviewStats.totalReviews || 1;
                        const percentage = (count / total) * 100;
                        return (
                          <div key={rating}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {rating} ⭐
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({count} đánh giá)
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  rating === 5 ? 'bg-green-500' :
                                  rating === 4 ? 'bg-blue-500' :
                                  rating === 3 ? 'bg-yellow-500' :
                                  rating === 2 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu thống kê</p>
          </div>
        )}

        {/* Orders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6">
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
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">Đang tải...</div>
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
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
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
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
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
