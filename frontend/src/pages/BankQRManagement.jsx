import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Chỉ Super Admin mới có quyền truy cập trang này
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý QR Code Ngân Hàng
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            + Thêm QR Code
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : bankQRs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có QR code nào</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              Thêm QR Code đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankQRs.map((bankQR) => (
              <div
                key={bankQR._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${
                  !bankQR.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      bankQR.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {bankQR.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </div>

                <div className="mb-3">
                  <img
                    src={bankQR.qrCodeImage}
                    alt="QR Code"
                    className="w-full h-48 object-contain border border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bankQR.bankName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>STK:</strong> {bankQR.accountNumber}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Chủ TK:</strong> {bankQR.accountHolder}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Tạo bởi: {bankQR.createdBy?.name || 'N/A'}
                  </p>
                </div>

                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(bankQR)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleToggleActive(bankQR)}
                    className={`flex-1 py-2 rounded text-sm ${
                      bankQR.isActive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {bankQR.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    onClick={() => handleDelete(bankQR._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingQR ? 'Sửa QR Code' : 'Thêm QR Code'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên ngân hàng *
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số tài khoản *
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên chủ tài khoản *
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolder}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolder: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ảnh QR Code {!editingQR && '*'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100
                        dark:file:bg-orange-900/20 dark:file:text-orange-300"
                      required={!editingQR}
                    />
                    {formData.qrCodeImage && (
                      <img
                        src={URL.createObjectURL(formData.qrCodeImage)}
                        alt="Preview"
                        className="mt-2 w-full rounded border border-gray-300 dark:border-gray-600"
                      />
                    )}
                    {editingQR && !formData.qrCodeImage && (
                      <img
                        src={editingQR.qrCodeImage}
                        alt="Current QR"
                        className="mt-2 w-full rounded border border-gray-300 dark:border-gray-600"
                      />
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {uploading ? 'Đang lưu...' : editingQR ? 'Cập nhật' : 'Thêm'}
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



