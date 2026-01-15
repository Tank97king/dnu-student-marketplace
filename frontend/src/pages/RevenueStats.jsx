import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function RevenueStats() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    if (user && user.isAdmin) {
      loadStats();
    }
  }, [user, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/revenue-stats?timeRange=${timeRange}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading revenue stats:', error);
      alert('Không thể tải thống kê doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  const getTimeRangeText = () => {
    const texts = {
      day: 'Hôm nay',
      week: '7 ngày qua',
      month: '30 ngày qua',
      year: '12 tháng qua',
      all: 'Tất cả'
    };
    return texts[timeRange] || timeRange;
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Bạn không có quyền truy cập trang này</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thống kê doanh thu
          </h1>
          <Link
            to="/admin"
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ← Quay lại Dashboard
          </Link>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Khoảng thời gian:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="day">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="year">12 tháng qua</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>

        {stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Tổng doanh thu ({getTimeRangeText()})
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(stats.summary?.totalRevenue)} ₫
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Số giao dịch
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.summary?.totalTransactions || 0}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Trung bình/giao dịch
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatPrice(stats.summary?.avgTransaction)} ₫
                    </p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Đã xác nhận
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.statusStats?.confirmed?.count || 0}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            {/* Status Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Thống kê theo trạng thái
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đã xác nhận</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(stats.statusStats?.confirmed?.total || 0)} ₫
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.statusStats?.confirmed?.count || 0} giao dịch
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatPrice(stats.statusStats?.pending?.total || 0)} ₫
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.statusStats?.pending?.count || 0} giao dịch
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Đã từ chối</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatPrice(stats.statusStats?.rejected?.total || 0)} ₫
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stats.statusStats?.rejected?.count || 0} giao dịch
                  </p>
                </div>
              </div>
            </div>

            {/* Top Products */}
            {stats.topProducts && stats.topProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Top sản phẩm bán chạy
                </h2>
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      {product.image && product.image[0] && (
                        <img
                          src={product.image[0]}
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.count} giao dịch
                        </p>
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

            {/* Monthly Revenue Chart */}
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Doanh thu theo tháng
                </h2>
                <div className="space-y-2">
                  {stats.monthlyRevenue.map((month) => (
                    <div key={month._id} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                        {month._id}
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${
                              (month.revenue / Math.max(...stats.monthlyRevenue.map((m) => m.revenue))) * 100
                            }%`
                          }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {formatPrice(month.revenue)} ₫
                          </span>
                        </div>
                      </div>
                      <div className="w-32 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {month.count} giao dịch
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Revenue Chart */}
            {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Doanh thu theo ngày (30 ngày gần nhất)
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stats.dailyRevenue.map((day) => (
                    <div key={day._id} className="flex items-center space-x-4">
                      <div className="w-32 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(day._id).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${
                              (day.revenue / Math.max(...stats.dailyRevenue.map((d) => d.revenue))) * 100
                            }%`
                          }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {formatPrice(day.revenue)} ₫
                          </span>
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {day.count} giao dịch
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

