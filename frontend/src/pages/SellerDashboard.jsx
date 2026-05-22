import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Toast';

export default function SellerDashboard() {
  const { user } = useSelector(state => state.auth);
  const { userId } = useParams();
  const isOwnDashboard = !userId || userId === user?.id;
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'revenue', 'products', 'reviews', 'bank'
  const [selectedImage, setSelectedImage] = useState(null);
  const [bankQR, setBankQR] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [confirmingReceiptId, setConfirmingReceiptId] = useState(null);
  const [reportingIssueId, setReportingIssueId] = useState(null);
  const [issueModal, setIssueModal] = useState({
    isOpen: false,
    paymentId: null,
    orderId: null,
    reason: ''
  });
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    title: ''
  });

  const showToastMsg = (message, type = 'success', title = '') => {
    setToast({
      isVisible: true,
      message,
      type,
      title
    });
  };

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

  const loadBankQR = async () => {
    try {
      setBankLoading(true);
      const response = await api.get('/seller-bankqr/my');
      if (response.data.success && response.data.data) {
        setBankQR(response.data.data);
        setBankForm({
          bankName: response.data.data.bankName || '',
          accountNumber: response.data.data.accountNumber || '',
          accountHolder: response.data.data.accountHolder || '',
        });
      }
    } catch (error) {
      console.error('Error loading bank QR:', error);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bank' && isOwnDashboard && user) {
      loadBankQR();
    }
  }, [activeTab, user]);

  const handleConfirmSellerReceipt = async (paymentId, orderId) => {
    if (!window.confirm('Bạn xác nhận đã nhận tiền từ Admin vào tài khoản ngân hàng của bạn?')) return;
    try {
      setConfirmingReceiptId(paymentId);
      const response = await api.put(`/seller-bankqr/payments/${paymentId}/confirm-receipt`);
      if (response.data.success) {
        showToastMsg('✅ Đã xác nhận nhận tiền! Admin đã được thông báo.', 'success', 'Cảm ơn bạn');
        // Update order in state
        setOrders(prev => prev.map(o => {
          if (o._id === orderId && o.payment) {
            return {
              ...o,
              payment: {
                ...o.payment,
                sellerConfirmedReceipt: true,
                sellerReceiptConfirmedAt: response.data.data.sellerReceiptConfirmedAt
              }
            };
          }
          return o;
        }));
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận', 'error', 'Lỗi');
    } finally {
      setConfirmingReceiptId(null);
    }
  };

  const handleReportIssue = (paymentId, orderId) => {
    setIssueModal({
      isOpen: true,
      paymentId,
      orderId,
      reason: ''
    });
  };

  const submitIssueReport = async () => {
    const { paymentId, orderId, reason } = issueModal;
    if (!reason.trim()) {
      showToastMsg('Vui lòng nhập lý do để Admin kiểm tra', 'warning', 'Thiếu thông tin');
      return;
    }

    try {
      setReportingIssueId(paymentId);
      const response = await api.put(`/seller-bankqr/payments/${paymentId}/report-issue`, { reason });
      if (response.data.success) {
        showToastMsg('Đã gửi báo cáo cho Admin kiểm tra.', 'success', 'Thành công');
        setOrders(prev => prev.map(o => {
          if (o._id === orderId && o.payment) {
            return {
              ...o,
              payment: {
                ...o.payment,
                sellerReportedIssue: true,
                sellerReportReason: response.data.data.sellerReportReason,
                sellerReportedAt: response.data.data.sellerReportedAt
              }
            };
          }
          return o;
        }));
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể gửi báo cáo', 'error', 'Lỗi');
    } finally {
      setReportingIssueId(null);
      setIssueModal({ isOpen: false, paymentId: null, orderId: null, reason: '' });
    }
  };

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToastMsg('Chỉ chấp nhận file ảnh', 'error', 'Lỗi');
        return;
      }
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
      showToastMsg('Vui lòng điền đầy đủ thông tin', 'error', 'Lỗi');
      return;
    }
    if (!bankQR && !qrFile) {
      showToastMsg('Vui lòng upload ảnh QR ngân hàng', 'error', 'Lỗi');
      return;
    }

    try {
      setBankLoading(true);
      const formData = new FormData();
      formData.append('bankName', bankForm.bankName);
      formData.append('accountNumber', bankForm.accountNumber);
      formData.append('accountHolder', bankForm.accountHolder);
      if (qrFile) {
        formData.append('qrCodeImage', qrFile);
      }

      const response = await api.post('/seller-bankqr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setBankQR(response.data.data);
        setQrFile(null);
        setQrPreview(null);
        showToastMsg(response.data.message || 'Lưu thông tin ngân hàng thành công', 'success', 'Thành công');
      }
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể lưu thông tin', 'error', 'Lỗi');
    } finally {
      setBankLoading(false);
    }
  };

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
      showToastMsg('Đã cập nhật trạng thái đơn hàng', 'success', 'Thành công');
      loadStats();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể cập nhật trạng thái', 'error', 'Lỗi');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      picked_up: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return badges[status] || badges.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      picked_up: 'Đang giao hàng',
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
                { id: 'reviews', label: 'Đánh giá', icon: '⭐' },
                ...(isOwnDashboard ? [{ id: 'bank', label: 'Thông tin ngân hàng', icon: '🏦' }] : [])
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
        ) : activeTab === 'bank' && isOwnDashboard ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Upload / Edit */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span>🏦</span> Thiết lập tài khoản nhận tiền
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Điền thông tin ngân hàng của bạn. Khi có đơn hàng bán thành công, Admin sẽ chuyển tiền cho bạn qua QR này sau khi trừ đi 5.5% (phí dịch vụ 5% + VAT 10% trên phí).
              </p>

              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên Ngân Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankFormChange}
                    placeholder="Ví dụ: Vietcombank, MB Bank, Techcombank..."
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số Tài Khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankFormChange}
                    placeholder="Nhập số tài khoản ngân hàng"
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-805 text-gray-800 dark:text-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên Chủ Tài Khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={bankForm.accountHolder}
                    onChange={handleBankFormChange}
                    placeholder="Nhập tên viết hoa không dấu, vd: NGUYEN VAN A"
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ảnh QR Code Thanh Toán <span className="text-red-500">{bankQR ? '' : '*'}</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 dark:file:bg-gray-700 dark:file:text-gray-200 hover:file:bg-orange-100"
                    required={!bankQR}
                  />
                </div>

                {qrPreview && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-gray-500 block mb-1">Xem trước QR mới chọn:</span>
                    <img src={qrPreview} alt="QR Preview" className="w-48 h-48 object-contain border dark:border-gray-700 rounded-lg" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bankLoading}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition-all disabled:bg-gray-400"
                >
                  {bankLoading ? 'Đang xử lý...' : 'Lưu thông tin ngân hàng'}
                </button>
              </form>
            </div>

            {/* Display Current QR Bank Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  QR Hiện Tại
                </h2>
                
                {bankLoading && !bankQR ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">Đang tải...</div>
                ) : bankQR ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Trạng thái</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${
                          bankQR.isVerified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}>
                          {bankQR.isVerified ? '✅ Đã xác minh' : '⏳ Chờ xác minh'}
                        </span>
                      </div>
                      {bankQR.isVerified && (
                        <span className="text-xs text-gray-500">
                          Duyệt bởi Admin
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><strong>Ngân hàng:</strong> {bankQR.bankName}</p>
                      <p><strong>Số tài khoản:</strong> {bankQR.accountNumber}</p>
                      <p><strong>Chủ tài khoản:</strong> {bankQR.accountHolder}</p>
                    </div>

                    {bankQR.qrCodeImage && (
                      <div className="flex justify-center pt-2">
                        <img 
                          src={bankQR.qrCodeImage} 
                          alt="QR Code" 
                          className="w-64 h-64 object-contain border dark:border-gray-700 rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-white"
                          onClick={() => setSelectedImage(bankQR.qrCodeImage)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-750 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Bạn chưa thiết lập QR ngân hàng</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vui lòng điền thông tin bên trái để nhận tiền bán sản phẩm</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu thống kê</p>
          </div>
        )}

        {/* Orders Section */}
        {activeTab !== 'bank' && (
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
                          {order.couponCode && (
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                              🎟️ Đã áp dụng mã: <span className="font-bold">{order.couponCode}</span> (-{formatPrice(order.discountAmount)} ₫)
                            </p>
                          )}
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

                  {/* Payment and Proof Info for Pending orders */}
                  {order.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl space-y-3">
                        <h4 className="text-sm font-bold text-gray-750 dark:text-gray-300">Thông tin thanh toán chuyển khoản:</h4>
                        {order.payment ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-sm">
                              <p className="text-gray-600 dark:text-gray-400">
                                <strong>Mã giao dịch:</strong> <span className="font-mono bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded">{order.payment.transactionCode}</span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <strong>Số tiền:</strong> <span className="text-red-500 font-bold">{formatPrice(order.payment.amount)} ₫</span>
                              </p>
                              <div className="flex flex-col space-y-1 mt-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Trạng thái phê duyệt:</span>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${order.payment.sellerApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Người bán: {order.payment.sellerApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${order.payment.adminApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Admin: {order.payment.adminApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                              {order.payment.paymentProof ? (
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 block">Ảnh minh chứng (Click để xem):</span>
                                  <div 
                                    className="relative w-24 h-24 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-white"
                                    onClick={() => setSelectedImage(order.payment.paymentProof)}
                                  >
                                    <img 
                                      src={order.payment.paymentProof} 
                                      alt="Biên lai" 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                      Phóng to
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-1 border border-yellow-100 dark:border-yellow-900/30">
                                  <span>⚠️ Chờ người mua tải lên ảnh chuyển khoản</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-1 border border-yellow-100 dark:border-yellow-900/30">
                            <span>⚠️ Chờ người mua thực hiện thanh toán</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        {order.payment ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                            disabled={order.payment.sellerApproved}
                            className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                              order.payment.sellerApproved 
                                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {order.payment.sellerApproved ? 'Đã duyệt (Chờ Admin)' : 'Xác nhận đơn hàng'}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-semibold"
                            title="Không tìm thấy thông tin thanh toán"
                          >
                            Xác nhận đơn hàng
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                        >
                          Từ chối / Hủy đơn
                        </button>
                      </div>
                    </div>
                  )}

                  {['confirmed', 'picked_up'].includes(order.status) && (
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
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

                      {/* Trạng thái nhận tiền */}
                      {order.payment?.sellerPaid ? (
                        <div className="space-y-2">
                          {/* Hiển thị số tiền được nhận */}
                          <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl px-4 py-2.5">
                            <div>
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400">💰 Tiền của bạn</p>
                              <p className="text-base font-black text-green-800 dark:text-green-300">{formatPrice(order.payment.sellerAmount || 0)} ₫</p>
                              <p className="text-[10px] text-green-600 dark:text-green-500">(Sau khi trừ {order.payment.platformFeePercent || 5}% phí sàn + {order.payment.vatPercent || 10}% VAT)</p>
                            </div>
                            {order.payment.sellerConfirmedReceipt ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">✅ Đã xác nhận</span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">⏳ Chờ xác nhận</span>
                            )}
                          </div>

                          {/* Ảnh biên lai Admin gửi */}
                          {order.payment.sellerPaymentProof && (
                            <div
                              className="relative cursor-pointer group"
                              onClick={() => setSelectedImage(order.payment.sellerPaymentProof)}
                            >
                              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">📎 Biên lai chuyển khoản từ Admin:</p>
                              <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 max-h-40">
                                <img
                                  src={order.payment.sellerPaymentProof}
                                  alt="Biên lai Admin"
                                  className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                  <span className="text-white text-xs font-bold">🔍 Xem to</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Nút xác nhận nhận tiền / Báo lỗi */}
                          {!order.payment.sellerConfirmedReceipt ? (
                            order.payment.sellerReportedIssue ? (
                              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-xs">
                                <strong>⚠️ Đã báo cáo lỗi:</strong> {order.payment.sellerReportReason}
                                <p className="mt-1 opacity-80">Admin đang kiểm tra lại giao dịch này.</p>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReportIssue(order.payment._id, order._id)}
                                  disabled={reportingIssueId === order.payment._id || confirmingReceiptId === order.payment._id}
                                  className="w-1/3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-60 font-bold rounded-xl text-xs flex flex-col items-center justify-center transition-colors shadow-sm"
                                >
                                  <span>⚠️ Báo lỗi</span>
                                </button>
                                <button
                                  onClick={() => handleConfirmSellerReceipt(order.payment._id, order._id)}
                                  disabled={confirmingReceiptId === order.payment._id || reportingIssueId === order.payment._id}
                                  className="w-2/3 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                  {confirmingReceiptId === order.payment._id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : '✅'}
                                  {confirmingReceiptId === order.payment._id ? 'Đang xác nhận...' : 'Tôi đã nhận được tiền'}
                                </button>
                              </div>
                            )
                          ) : (
                            <p className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✅ Đã xác nhận lúc {new Date(order.payment.sellerReceiptConfirmedAt).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
                          ⏳ Admin chưa chuyển tiền. Vui lòng chờ Admin xử lý.
                        </div>
                      )}

                      <Link
                        to={`/products/${order.productId?._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs block text-right"
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
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Enlarged Proof" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Báo cáo sự cố</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phản hồi lại cho Admin hệ thống</p>
                </div>
              </div>
              <button 
                onClick={() => setIssueModal({ isOpen: false, paymentId: null, orderId: null, reason: '' })}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả chi tiết sự cố
                </label>
                <textarea
                  value={issueModal.reason}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ví dụ: Tôi chưa nhận được tiền trong tài khoản, hoặc Admin chuyển sai số tiền thực nhận..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none"
                  rows="4"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-xs text-blue-800 dark:text-blue-300">
                <strong>Lưu ý:</strong> Báo cáo của bạn sẽ được gửi trực tiếp đến Ban quản trị để xử lý. Vui lòng kiểm tra kỹ số dư ngân hàng trước khi gửi báo cáo.
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={() => setIssueModal({ isOpen: false, paymentId: null, orderId: null, reason: '' })}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitIssueReport}
                disabled={reportingIssueId === issueModal.paymentId || !issueModal.reason.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {reportingIssueId === issueModal.paymentId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        title={toast.title}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
