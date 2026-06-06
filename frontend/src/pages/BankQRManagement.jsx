import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function BankQRManagement() {
  const { user } = useSelector(state => state.auth);
  const [bankQRs, setBankQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    qrCodeImage: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && user.isSuperAdmin) {
      loadBankQRs();
    }
  }, [user]);

  const loadBankQRs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bankqr');
      setBankQRs(response.data.data || []);
    } catch (error) {
      console.error('Error loading bank QR codes:', error);
      alert('Không thể tải danh sách QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      setFormData({ ...formData, qrCodeImage: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!editingQR && !formData.qrCodeImage) {
      alert('Vui lòng upload ảnh QR code');
      return;
    }

    setUploading(true);
    try {
      const submitData = new FormData();
      submitData.append('bankName', formData.bankName);
      submitData.append('accountNumber', formData.accountNumber);
      submitData.append('accountHolder', formData.accountHolder);
      if (formData.qrCodeImage) {
        submitData.append('qrCodeImage', formData.qrCodeImage);
      }

      let response;
      if (editingQR) {
        response = await api.put(`/bankqr/${editingQR._id}`, submitData);
      } else {
        response = await api.post('/bankqr', submitData);
      }

      if (response.data.success) {
        alert(editingQR ? 'Đã cập nhật QR code thành công' : 'Đã tạo QR code thành công');
        loadBankQRs();
        handleCloseModal();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể lưu QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (bankQR) => {
    setEditingQR(bankQR);
    setFormData({
      bankName: bankQR.bankName,
      accountNumber: bankQR.accountNumber,
      accountHolder: bankQR.accountHolder,
      qrCodeImage: null
    });
    setShowModal(true);
  };

  const handleDelete = async (bankQRId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa QR code này?')) return;

    try {
      const response = await api.delete(`/bankqr/${bankQRId}`);
      if (response.data.success) {
        alert('Đã xóa QR code thành công');
        loadBankQRs();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa QR code');
    }
  };

  const handleToggleActive = async (bankQR) => {
    try {
      const response = await api.put(`/bankqr/${bankQR._id}`, {
        isActive: !bankQR.isActive
      });
      if (response.data.success) {
        loadBankQRs();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQR(null);
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      qrCodeImage: null
    });
  };

  if (!user || !user.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <span className="text-5xl">🔒</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Chỉ Super Admin mới có quyền quản lý thông tin QR Code ngân hàng của hệ thống.</p>
          <Link to="/admin" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/20 mb-8">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Cấu hình thanh toán</span>
              <h1 className="text-3xl font-black mt-1 text-white drop-shadow-sm leading-normal">QR CODE NGÂN HÀNG</h1>
              <p className="text-orange-50/90 text-sm mt-1">Quản lý các tài khoản nhận thanh toán của sàn giao dịch</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 font-medium text-sm backdrop-blur-md">
                ← Quay lại Dashboard
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-600 rounded-xl transition-all duration-300 font-bold text-sm shadow-md cursor-pointer"
              >
                + Thêm tài khoản QR
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Đang tải danh sách QR Code...</p>
          </div>
        ) : bankQRs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
            <span className="text-5xl">🏦</span>
            <p className="text-gray-500 dark:text-gray-400 my-4 font-medium">Chưa có QR Code ngân hàng nào được cấu hình</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
            >
              Thêm QR Code đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankQRs.map((bankQR) => (
              <div
                key={bankQR._id}
                className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-150 dark:border-gray-700/50 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  !bankQR.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-450 uppercase tracking-widest">Tài khoản nhận</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        bankQR.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-750 dark:bg-gray-700/40 dark:text-gray-400'
                      }`}
                    >
                      {bankQR.isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </div>

                  <div className="relative group overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 mb-4 flex justify-center">
                    <img
                      src={bankQR.qrCodeImage}
                      alt="QR Code"
                      className="h-48 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-2 bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-800 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Ngân hàng</span>
                      <span className="font-bold text-gray-900 dark:text-white">{bankQR.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Số tài khoản</span>
                      <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400 text-base">{bankQR.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Chủ tài khoản</span>
                      <span className="font-bold text-gray-900 dark:text-white uppercase">{bankQR.accountHolder}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex justify-between">
                      <span>Tạo bởi</span>
                      <span>{bankQR.createdBy?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleEdit(bankQR)}
                    className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-650 dark:text-indigo-400 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer text-center"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleToggleActive(bankQR)}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                      bankQR.isActive
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                    }`}
                  >
                    {bankQR.isActive ? '🔒 Tắt' : '🔓 Bật'}
                  </button>
                  <button
                    onClick={() => handleDelete(bankQR._id)}
                    className="bg-red-50 dark:bg-red-900/20 text-red-650 dark:text-red-400 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer text-center"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-gray-150 dark:border-gray-700/50 overflow-hidden transform scale-100">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingQR ? 'Sửa thông tin QR Code' : 'Thêm QR Code nhận tiền'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1">
                      Tên ngân hàng *
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white"
                      placeholder="Ví dụ: Vietcombank, MB Bank..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1">
                      Số tài khoản *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white"
                      placeholder="Nhập số tài khoản"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1">
                      Tên chủ tài khoản *
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolder}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolder: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white uppercase"
                      placeholder="VIET A NGUYEN"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1">
                      Ảnh QR Code {!editingQR && '*'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-xs file:font-bold
                        file:bg-indigo-50 file:text-indigo-650
                        hover:file:bg-indigo-100
                        dark:file:bg-indigo-950/30 dark:file:text-indigo-400 cursor-pointer"
                      required={!editingQR}
                    />
                    {formData.qrCodeImage && (
                      <img
                        src={URL.createObjectURL(formData.qrCodeImage)}
                        alt="Preview"
                        className="mt-3 w-full max-h-48 object-contain rounded-2xl border border-gray-200 dark:border-gray-700"
                      />
                    )}
                    {editingQR && !formData.qrCodeImage && (
                      <img
                        src={editingQR.qrCodeImage}
                        alt="Current QR"
                        className="mt-3 w-full max-h-48 object-contain rounded-2xl border border-gray-200 dark:border-gray-700"
                      />
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold text-sm cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md"
                    >
                      {uploading ? 'Đang lưu...' : editingQR ? 'Cập nhật' : 'Thêm tài khoản'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



