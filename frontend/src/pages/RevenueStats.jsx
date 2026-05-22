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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bạn không có quyền truy cập trang thống kê doanh thu.</p>
          <Link to="/admin" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Đang tổng hợp dữ liệu doanh thu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Báo cáo tài chính</span>
              <h1 className="text-3xl font-black mt-1 bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">THỐNG KÊ DOANH THU</h1>
              <p className="text-indigo-200/80 text-sm mt-1">Phân tích doanh số, hiệu suất bán hàng và giao dịch</p>
            </div>
            <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-md">
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">Chọn khoảng thời gian lọc</p>
                <p className="text-xs text-gray-400">Xem doanh thu theo ngày, tuần, tháng hoặc năm</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-white text-sm font-bold shadow-sm"
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
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/5 dark:from-emerald-950/20 dark:to-green-950/10 rounded-3xl p-6 border border-green-500/10 dark:border-green-500/20 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Tổng doanh thu ({getTimeRangeText()})</p>
                  <p className="text-2xl font-black text-green-700 dark:text-green-300 mt-2">
                    {formatPrice(stats.summary?.totalRevenue)} ₫
                  </p>
                </div>
                <span className="absolute bottom-2 right-4 text-5xl opacity-20">💰</span>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/5 dark:from-indigo-950/20 dark:to-purple-950/10 rounded-3xl p-6 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Số giao dịch phát sinh</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-2">
                    {stats.summary?.totalTransactions || 0}
                  </p>
                </div>
                <span className="absolute bottom-2 right-4 text-5xl opacity-20">📊</span>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/5 dark:from-purple-950/20 dark:to-pink-950/10 rounded-3xl p-6 border border-purple-500/10 dark:border-purple-500/20 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Trung bình/giao dịch</p>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-2">
                    {formatPrice(stats.summary?.avgTransaction)} ₫
                  </p>
                </div>
                <span className="absolute bottom-2 right-4 text-5xl opacity-20">📈</span>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-950/20 dark:to-cyan-950/10 rounded-3xl p-6 border border-blue-500/10 dark:border-blue-500/20 shadow-sm flex flex-col justify-between h-36">
                <div>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Giao dịch đã xác nhận</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-2">
                    {stats.statusStats?.confirmed?.count || 0}
                  </p>
                </div>
                <span className="absolute bottom-2 right-4 text-5xl opacity-20">✅</span>
              </div>
            </div>

            {/* Status Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span>📈</span> Thống kê theo trạng thái
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50/50 dark:bg-green-950/10 p-5 rounded-2xl border border-green-100 dark:border-green-950/30">
                  <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded">Đã xác nhận</span>
                  <p className="text-2xl font-black text-green-800 dark:text-green-300 mt-3">
                    {formatPrice(stats.statusStats?.confirmed?.total || 0)} ₫
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">
                    {stats.statusStats?.confirmed?.count || 0} giao dịch thành công
                  </p>
                </div>
                <div className="bg-yellow-50/50 dark:bg-yellow-950/10 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/40 px-2 py-0.5 rounded">Chờ xác nhận</span>
                  <p className="text-2xl font-black text-yellow-800 dark:text-yellow-300 mt-3">
                    {formatPrice(stats.statusStats?.pending?.total || 0)} ₫
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">
                    {stats.statusStats?.pending?.count || 0} giao dịch chờ duyệt
                  </p>
                </div>
                <div className="bg-red-50/50 dark:bg-red-950/10 p-5 rounded-2xl border border-red-100 dark:border-red-950/30">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded">Đã từ chối</span>
                  <p className="text-2xl font-black text-red-800 dark:text-red-300 mt-3">
                    {formatPrice(stats.statusStats?.rejected?.total || 0)} ₫
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">
                    {stats.statusStats?.rejected?.count || 0} giao dịch bị hủy
                  </p>
                </div>
              </div>
            </div>

            {/* Top Products & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                      <span>🏆</span> Top sản phẩm doanh số cao nhất
                    </h2>
                    <div className="space-y-4">
                      {stats.topProducts.map((product, index) => {
                        const rankStyles = [
                          'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/25',
                          'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-400/25',
                          'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-700/25'
                        ];
                        const defaultRankStyle = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';

                        return (
                          <div
                            key={product._id}
                            className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${rankStyles[index] || defaultRankStyle}`}>
                              {index + 1}
                            </div>
                            {product.image && product.image[0] && (
                              <img
                                src={product.image[0]}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded-xl border border-gray-100 dark:border-gray-700 flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/products/${product._id}`}
                                className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                              >
                                {product.title}
                              </Link>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {product.count} lượt thanh toán thành công
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-black text-green-600 dark:text-green-400">
                                {formatPrice(product.revenue)} ₫
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly Revenue Chart */}
              {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <span>📊</span> Doanh thu theo tháng
                  </h2>
                  <div className="space-y-4">
                    {stats.monthlyRevenue.map((month) => {
                      const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue)) || 1;
                      const percentage = (month.revenue / maxRevenue) * 100;
                      return (
                        <div key={month._id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                            <span>Tháng {month._id}</span>
                            <span>{month.count} giao dịch</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-900/50 rounded-full h-8 relative overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-1000 shadow-sm"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 15 && (
                                <span className="text-[10px] font-extrabold text-white">
                                  {formatPrice(month.revenue)} ₫
                                </span>
                              )}
                            </div>
                            {percentage <= 15 && (
                              <span className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 absolute left-3 top-1/2 -translate-y-1/2">
                                {formatPrice(month.revenue)} ₫
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Revenue Chart */}
            {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-150 dark:border-gray-700/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <span>📅</span> Doanh thu chi tiết theo ngày (30 ngày qua)
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {stats.dailyRevenue.map((day) => {
                    const maxRevenue = Math.max(...stats.dailyRevenue.map((d) => d.revenue)) || 1;
                    const percentage = (day.revenue / maxRevenue) * 100;
                    return (
                      <div key={day._id} className="flex items-center gap-4">
                        <div className="w-24 text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {new Date(day._id).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-900/50 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-[9px] font-black text-white">
                                {formatPrice(day.revenue)} ₫
                              </span>
                            )}
                          </div>
                          {percentage <= 15 && (
                            <span className="text-[9px] font-black text-gray-700 dark:text-gray-300 absolute left-2 top-1/2 -translate-y-1/2">
                              {formatPrice(day.revenue)} ₫
                            </span>
                          )}
                        </div>
                        <div className="w-20 text-right text-xs font-bold text-gray-900 dark:text-white flex-shrink-0">
                          {day.count} giao dịch
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

