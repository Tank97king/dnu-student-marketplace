import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateUser } from '../store/slices/authSlice';
import api from '../utils/api';
import Toast from '../components/Toast';

export default function ShipperDashboard() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('delivering'); // 'new', 'delivering', 'completed', 'settings'
  const [myOrders, setMyOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ idCard: '', vehicleType: 'motorbike', operatingArea: '', bio: '' });
  const [adminQR, setAdminQR] = useState(null);
  
  // File upload state for each order ID
  const [selectedFiles, setSelectedFiles] = useState({}); // { [orderId]: File }
  const [filePreviews, setFilePreviews] = useState({}); // { [orderId]: dataUrl }
  const [submittingOrderId, setSubmittingOrderId] = useState(null);
  const [claimingOrderId, setClaimingOrderId] = useState(null);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    bankName: user?.shipperInfo?.bankAccount?.bankName || '',
    accountNumber: user?.shipperInfo?.bankAccount?.accountNumber || '',
    accountHolder: user?.shipperInfo?.bankAccount?.accountHolder || '',
    qrCodeImage: null
  });
  const [bankPreview, setBankPreview] = useState(user?.shipperInfo?.bankAccount?.qrCodeImage || null);
  const [savingBank, setSavingBank] = useState(false);

  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success', title: '' });

  const showToastMsg = (message, type = 'success', title = '') => {
    setToast({ isVisible: true, message, type, title });
  };

  useEffect(() => {
    if (user && user.isShipper && user.shipperStatus === 'approved') {
      loadData();
      loadAdminQR();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'new') {
        const res = await api.get('/shipper/available-orders');
        setAvailableOrders(res.data.data || []);
      } else {
        const res = await api.get('/shipper/my-orders');
        setMyOrders(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading shipper data:', error);
      showToastMsg('Không thể tải danh sách đơn hàng', 'error', 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminQR = async () => {
    try {
      const res = await api.get('/bankqr');
      if (res.data.data?.length > 0) {
        setAdminQR(res.data.data.find(q => q.isActive) || res.data.data[0]);
      }
    } catch (error) {
      console.error('Error loading admin QR:', error);
    }
  };

  // Nhận đơn hàng mới
  const handleAcceptOrder = async (orderId) => {
    try {
      setClaimingOrderId(orderId);
      await api.put(`/shipper/orders/${orderId}/accept`);
      showToastMsg('Nhận giao đơn hàng thành công!', 'success', 'Thành công');
      // Chuyển sang tab đang giao và tải lại
      setActiveTab('delivering');
      loadData();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể nhận đơn hàng', 'error', 'Lỗi');
    } finally {
      setClaimingOrderId(null);
    }
  };

  // Chọn ảnh cho đơn hàng
  const handleFileChange = (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giới hạn dung lượng 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToastMsg('Kích thước ảnh tối đa là 2MB', 'warning', 'Cảnh báo');
      return;
    }

    setSelectedFiles(prev => ({ ...prev, [orderId]: file }));

    // Tạo preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews(prev => ({ ...prev, [orderId]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh đã chọn
  const handleClearFile = (orderId) => {
    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
    setFilePreviews(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  // Xác nhận đã nhận hàng từ người bán (Bước 1)
  const handleConfirmPickup = async (orderId) => {
    const file = selectedFiles[orderId];
    if (!file) {
      showToastMsg('Vui lòng chụp ảnh hoặc chọn ảnh xác nhận đã nhận hàng', 'warning', 'Yêu cầu');
      return;
    }

    try {
      setSubmittingOrderId(orderId);
      const formData = new FormData();
      formData.append('image', file);

      await api.put(`/shipper/orders/${orderId}/pickup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToastMsg('Đã xác nhận lấy hàng từ người bán!', 'success', 'Thành công');
      // Clear file selection
      handleClearFile(orderId);
      loadData();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận lấy hàng', 'error', 'Lỗi');
    } finally {
      setSubmittingOrderId(null);
    }
  };

  // Xác nhận đã giao hàng thành công cho người mua (Bước 2)
  const handleConfirmDelivery = async (orderId) => {
    const file = selectedFiles[orderId];
    if (!file) {
      showToastMsg('Vui lòng chụp ảnh hoặc chọn ảnh xác nhận đã giao hàng', 'warning', 'Yêu cầu');
      return;
    }

    try {
      setSubmittingOrderId(orderId);
      const formData = new FormData();
      formData.append('image', file);

      await api.put(`/shipper/orders/${orderId}/delivered`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToastMsg('Đã xác nhận giao hàng thành công!', 'success', 'Thành công');
      // Clear file selection
      handleClearFile(orderId);
      loadData();
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác nhận giao hàng', 'error', 'Lỗi');
    } finally {
      setSubmittingOrderId(null);
    }
  };

  const handleApply = async () => {
    if (!applyForm.idCard.trim() || !applyForm.operatingArea.trim()) {
      showToastMsg('Vui lòng điền đầy đủ số CMND/CCCD và khu vực hoạt động', 'warning', 'Cảnh báo');
      return;
    }
    try {
      setApplying(true);
      await api.post('/shipper/apply', applyForm);
      showToastMsg('Đã nộp đơn đăng ký Shipper. Vui lòng chờ Admin xét duyệt.', 'success', 'Đã gửi');
      dispatch(updateUser({
        isShipper: true,
        shipperStatus: 'pending'
      }));
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể nộp đơn', 'error', 'Lỗi');
    } finally {
      setApplying(false);
    }
  };

  const handleBankFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToastMsg('Kích thước ảnh tối đa là 2MB', 'warning', 'Cảnh báo');
      return;
    }

    setBankForm(prev => ({ ...prev, qrCodeImage: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setBankPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBank = async () => {
    if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim() || !bankForm.accountHolder.trim()) {
      showToastMsg('Vui lòng điền đầy đủ thông tin ngân hàng', 'warning', 'Cảnh báo');
      return;
    }

    if (!user?.shipperInfo?.bankAccount?.qrCodeImage && !bankForm.qrCodeImage) {
      showToastMsg('Vui lòng upload ảnh QR nhận tiền', 'warning', 'Cảnh báo');
      return;
    }

    try {
      setSavingBank(true);
      const formData = new FormData();
      formData.append('bankName', bankForm.bankName);
      formData.append('accountNumber', bankForm.accountNumber);
      formData.append('accountHolder', bankForm.accountHolder);
      if (bankForm.qrCodeImage) {
        formData.append('qrCodeImage', bankForm.qrCodeImage);
      }

      const response = await api.put('/shipper/bank', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToastMsg('Đã cập nhật thông tin nhận lương!', 'success', 'Thành công');
      
      // Update local user state
      const updatedUser = { ...user };
      updatedUser.shipperInfo.bankAccount = response.data.data;
      dispatch(updateUser(updatedUser));
      
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể cập nhật thông tin ngân hàng', 'error', 'Lỗi');
    } finally {
      setSavingBank(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  const getStatusBadge = (status) => {
    const map = {
      confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      picked_up: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const map = {
      confirmed: '🚴 Đang chờ lấy hàng',
      picked_up: '📦 Đang giao hàng',
      completed: '✅ Đã giao hàng',
    };
    return map[status] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Vui lòng <Link to="/login" className="text-orange-500 underline">đăng nhập</Link></p>
      </div>
    );
  }

  // Chưa đăng ký hoặc đang chờ
  if (!user.isShipper || user.shipperStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-10">
        <div className="max-w-xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-4xl shadow-lg mb-4">🛵</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng ký làm Shipper</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Giao hàng và nhận thu nhập thêm từ các đơn hàng trên sàn</p>
          </div>

          {user.shipperStatus === 'pending' ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-300 text-lg">Đang chờ Admin xét duyệt</h3>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">Đơn đăng ký của bạn đã được gửi. Hãy chờ Admin xét duyệt sớm nhất có thể.</p>
            </div>
          ) : user.shipperStatus === 'rejected' ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center mb-6">
              <div className="text-4xl mb-3">❌</div>
              <h3 className="font-bold text-red-800 dark:text-red-300">Đơn bị từ chối</h3>
              <p className="text-red-700 dark:text-red-400 text-sm mt-1">Đơn đăng ký trước của bạn bị từ chối. Bạn có thể nộp lại.</p>
            </div>
          ) : null}

          {(user.shipperStatus === 'none' || user.shipperStatus === 'rejected' || !user.shipperStatus) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Số CMND/CCCD <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={applyForm.idCard}
                  onChange={e => setApplyForm(prev => ({ ...prev, idCard: e.target.value }))}
                  placeholder="VD: 001234567890"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phương tiện</label>
                <select
                  value={applyForm.vehicleType}
                  onChange={e => setApplyForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="motorbike">🛵 Xe máy</option>
                  <option value="bicycle">🚲 Xe đạp</option>
                  <option value="car">🚗 Ô tô</option>
                  <option value="walking">🚶 Đi bộ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Khu vực hoạt động <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={applyForm.operatingArea}
                  onChange={e => setApplyForm(prev => ({ ...prev, operatingArea: e.target.value }))}
                  placeholder="VD: Khuôn viên trường, KTX, Phú Thị..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Giới thiệu bản thân</label>
                <textarea
                  value={applyForm.bio}
                  onChange={e => setApplyForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Kinh nghiệm giao hàng, mô tả bản thân..."
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-60"
              >
                {applying ? '⏳ Đang gửi...' : '🛵 Nộp đơn đăng ký Shipper'}
              </button>
            </div>
          )}
        </div>
        <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} title={toast.title} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
      </div>
    );
  }

  // Lọc danh sách đơn hàng cho tab
  const getFilteredOrders = () => {
    if (activeTab === 'new') return availableOrders;
    if (activeTab === 'delivering') {
      return myOrders.filter(o => o.status === 'confirmed' || o.status === 'picked_up');
    }
    if (activeTab === 'completed') {
      return myOrders.filter(o => o.status === 'completed');
    }
    return [];
  };

  const filteredOrders = getFilteredOrders();

  // Dashboard chính của Shipper
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="w-16 h-16 rounded-full border-2 border-white/50 object-cover" />
            <div>
              <h1 className="text-xl font-bold">Xin chào, {user.name}! 🛵</h1>
              <p className="text-orange-100 text-sm">
                Khu vực hoạt động: {user.shipperInfo?.operatingArea || 'Toàn hệ thống'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 mb-6 shadow-sm border border-gray-150 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'new'
                ? 'bg-orange-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📦 Đơn hàng mới ({activeTab === 'new' ? filteredOrders.length : '...'})
          </button>
          <button
            onClick={() => setActiveTab('delivering')}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'delivering'
                ? 'bg-orange-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🚴 Đang giao ({activeTab === 'delivering' ? filteredOrders.length : '...'})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'completed'
                ? 'bg-orange-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ✅ Đã hoàn thành ({activeTab === 'completed' ? filteredOrders.length : '...'})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ⚙️ Nhận lương
          </button>
        </div>

        {/* Cài đặt nhận lương (Settings Tab) */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thông tin tài khoản nhận lương</h2>
            <p className="text-gray-500 text-sm mb-6">Cung cấp tài khoản ngân hàng và mã QR để Admin thanh toán lương cho bạn.</p>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên ngân hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="VD: Vietcombank, MB Bank..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Số tài khoản <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="VD: 1234567890"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên chủ tài khoản <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="VD: NGUYEN VAN A"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white uppercase outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mã QR nhận tiền <span className="text-red-500">*</span></label>
                
                {bankPreview ? (
                  <div className="relative w-40 h-40 mb-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden group">
                    <img src={bankPreview} alt="Bank QR Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-2xl mb-1">🔄</span>
                      <span className="text-xs font-semibold">Đổi ảnh QR</span>
                      <input type="file" accept="image/*" onChange={handleBankFileChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors mb-3">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-xs text-gray-500 font-semibold">Tải lên mã QR</span>
                    <input type="file" accept="image/*" onChange={handleBankFileChange} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Chụp mã QR ngân hàng của bạn để Admin chuyển lương.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleSaveBank}
                  disabled={savingBank}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {savingBank ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : <span>💾</span>}
                  {savingBank ? 'Đang lưu...' : 'Lưu thông tin nhận lương'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List of Orders */}
        {activeTab !== 'settings' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeTab === 'new' && 'Danh sách đơn hàng chưa có người giao'}
                {activeTab === 'delivering' && 'Đơn hàng bạn đang phụ trách'}
                {activeTab === 'completed' && 'Lịch sử giao hàng thành công'}
              </h2>
              <button 
                onClick={loadData}
                className="text-xs text-orange-500 hover:underline flex items-center gap-1 font-semibold"
              >
                🔄 Tải lại danh sách
              </button>
            </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-gray-500 mt-4 text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'new' && 'Hiện tại không có đơn hàng mới nào cần giao.'}
              {activeTab === 'delivering' && 'Bạn chưa nhận giao đơn hàng nào.'}
              {activeTab === 'completed' && 'Bạn chưa hoàn thành đơn hàng nào.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                {/* Product Header Info */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <img
                    src={order.productId?.images?.[0] || '/default-product.png'}
                    alt={order.productId?.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1.5 ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">{order.productId?.title}</h3>
                    <p className="text-orange-600 font-bold text-lg mt-0.5">{formatPrice(order.finalPrice)} ₫</p>
                  </div>
                </div>

                {/* Delivery Information details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                  {/* Seller info (Pick-up) */}
                  <div className="p-3 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-xl space-y-1">
                    <p className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1">
                      <span>🏪</span> Điểm lấy hàng (Người bán)
                    </p>
                    <p className="text-gray-850 dark:text-gray-200 font-medium">{order.sellerId?.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">📞 {order.sellerId?.phone}</p>
                    <p className="text-gray-650 dark:text-gray-400 leading-relaxed">
                      📍 {order.sellerId?.address || 'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>

                  {/* Buyer info */}
                  <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-1">
                    <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <span>👤</span> Điểm giao hàng (Người mua)
                    </p>
                    <p className="text-gray-850 dark:text-gray-200 font-medium">{order.shippingAddress?.fullName || order.buyerId?.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">📞 {order.shippingAddress?.phone || order.buyerId?.phone}</p>
                    <p className="text-gray-650 dark:text-gray-400 leading-relaxed">
                      📍 {[
                        order.shippingAddress?.address,
                        order.shippingAddress?.ward,
                        order.shippingAddress?.district,
                        order.shippingAddress?.city
                      ].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>
                </div>

                {/* Assigned date */}
                {order.shipperAssignedAt && (
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <span>📅</span> Đã nhận đơn lúc: {new Date(order.shipperAssignedAt).toLocaleString('vi-VN')}
                  </p>
                )}

                {/* CONDITIONAL ACTION / STEPS ACCORDING TO TABS & STATUSES */}

                {/* TAB: NEW ORDERS */}
                {activeTab === 'new' && (
                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={claimingOrderId === order._id}
                    className="mt-5 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {claimingOrderId === order._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang nhận đơn...</span>
                      </>
                    ) : (
                      <>
                        <span>🛵 Nhận giao đơn hàng này</span>
                      </>
                    )}
                  </button>
                )}

                {/* TAB: DELIVERING (IN PROGRESS) */}
                {activeTab === 'delivering' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                    {/* BƯỚC 1: Lấy hàng từ người bán */}
                    {order.status === 'confirmed' && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                          📌 Bước 1: Đến người bán nhận hàng và chụp ảnh xác nhận
                        </p>
                        
                        {/* File preview */}
                        {filePreviews[order._id] && (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                            <img src={filePreviews[order._id]} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleClearFile(order._id)}
                              className="absolute top-1 right-1 bg-red-650 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-150 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm cursor-pointer border border-gray-300 dark:border-gray-650 transition-colors">
                            <span>📸 Chụp/Chọn ảnh lấy hàng</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handleFileChange(order._id, e)}
                            />
                          </label>

                          <button
                            onClick={() => handleConfirmPickup(order._id)}
                            disabled={submittingOrderId === order._id || !selectedFiles[order._id]}
                            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                          >
                            {submittingOrderId === order._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : null}
                            <span>Đã lấy hàng</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* BƯỚC 2: Giao hàng cho người mua */}
                    {order.status === 'picked_up' && (
                      <div className="space-y-4">
                        {/* Hiển thị minh chứng đã nhận hàng ở Bước 1 */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-150 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-500 mb-2">📸 Ảnh minh chứng đã nhận hàng từ người bán:</p>
                          <img 
                            src={order.pickupProof} 
                            alt="Pickup Proof" 
                            className="w-28 h-28 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                            onClick={() => window.open(order.pickupProof, '_blank')}
                          />
                        </div>

                        {/* KIỂM TRA ĐIỀU KIỆN HIỂN THỊ MÃ QR THU TIỀN COD */}
                        {order.payment?.status !== 'confirmed' ? (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                              <span>📱</span> Yêu cầu người mua quét QR thu tiền COD
                            </div>
                            
                            {adminQR ? (
                              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-white dark:bg-gray-800 p-3 rounded-lg border border-amber-100">
                                <img
                                  src={adminQR.qrCodeImage}
                                  alt="QR Admin"
                                  className="w-32 h-32 rounded-lg object-cover border border-gray-200 cursor-pointer"
                                  onClick={() => window.open(adminQR.qrCodeImage, '_blank')}
                                />
                                <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300 w-full">
                                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{adminQR.accountHolder}</p>
                                  <p>{adminQR.bankName}</p>
                                  <p className="font-mono">{adminQR.accountNumber}</p>
                                  <div className="pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-gray-500 font-medium">Số tiền COD cần thu:</p>
                                    <p className="text-base text-red-600 font-extrabold">{formatPrice(order.finalPrice)} ₫</p>
                                  </div>
                                  <p className="text-orange-500 text-[10px] mt-1 font-semibold italic">⚠ Người mua chuyển khoản đúng số tiền, ghi nội dung mã đơn hàng.</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-amber-700 dark:text-amber-400">Không tìm thấy tài khoản nhận tiền của Admin. Vui lòng thu tiền mặt: <span className="font-extrabold text-red-650">{formatPrice(order.finalPrice)} ₫</span></p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl text-green-800 dark:text-green-300 font-semibold text-sm flex items-center gap-2">
                            <span>✅</span> Đơn hàng đã thanh toán trước qua chuyển khoản. Không cần thu tiền!
                          </div>
                        )}

                        {/* Form chụp ảnh giao hàng */}
                        <div className="space-y-3 pt-2">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-300">
                            📌 Bước 2: Chụp ảnh xác nhận đã giao hàng thành công tới người mua
                          </p>

                          {order.payment?.status !== 'confirmed' ? (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-300 font-semibold text-sm flex items-center gap-2">
                              <span>⏳</span> Vui lòng chờ Admin xác nhận đã nhận tiền COD trước khi xác nhận giao hàng.
                            </div>
                          ) : (
                            <>
                              {/* File preview */}
                              {filePreviews[order._id] && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                                  <img src={filePreviews[order._id]} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => handleClearFile(order._id)}
                                    className="absolute top-1 right-1 bg-red-650 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}

                              <div className="flex gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-150 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm cursor-pointer border border-gray-300 dark:border-gray-650 transition-colors">
                                  <span>📸 Chụp/Chọn ảnh giao hàng</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(order._id, e)}
                                  />
                                </label>

                                <button
                                  onClick={() => handleConfirmDelivery(order._id)}
                                  disabled={submittingOrderId === order._id || !selectedFiles[order._id]}
                                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                  {submittingOrderId === order._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : null}
                                  <span>Xác nhận giao xong</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: COMPLETED ORDERS */}
                {activeTab === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">🖼 Minh chứng giao hàng đã lưu:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2 bg-gray-50 dark:bg-gray-750 border border-gray-100 rounded-xl text-center">
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">🏪 Nhận hàng từ người bán</p>
                        {order.pickupProof ? (
                          <img
                            src={order.pickupProof}
                            alt="Pickup Proof"
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 mx-auto"
                            onClick={() => window.open(order.pickupProof, '_blank')}
                          />
                        ) : (
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
                        )}
                        {order.pickedUpAt && (
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(order.pickedUpAt).toLocaleString('vi-VN')}</p>
                        )}
                      </div>

                      <div className="p-2 bg-gray-50 dark:bg-gray-750 border border-gray-100 rounded-xl text-center">
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">👤 Giao hàng cho người mua</p>
                        {order.deliveryProof ? (
                          <img
                            src={order.deliveryProof}
                            alt="Delivery Proof"
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 mx-auto"
                            onClick={() => window.open(order.deliveryProof, '_blank')}
                          />
                        ) : (
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Không có ảnh</div>
                        )}
                        {order.deliveredAt && (
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(order.deliveredAt).toLocaleString('vi-VN')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
        )}
      </div>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} title={toast.title} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}
