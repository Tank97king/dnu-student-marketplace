import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function BuyNowModal({ product, isOpen, onClose, onOrderCreated }) {
  const { user } = useSelector(state => state.auth);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCreatedData, setOrderCreatedData] = useState(null);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Geographic states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [loadingGeography, setLoadingGeography] = useState({
    provinces: false,
    districts: false,
    wards: false
  });

  useEffect(() => {
    if (isOpen) {
      setShippingAddress({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        ward: '',
        district: '',
        city: '',
        note: ''
      });
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setDistricts([]);
      setWards([]);
      setOrderCreatedData(null);
      setCouponInput('');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError('');
      setCouponSuccess('');
    }
  }, [user, isOpen]);

  // Fetch provinces when modal is opened in delivery mode
  useEffect(() => {
    if (isOpen && provinces.length === 0) {
      const fetchProvinces = async () => {
        setLoadingGeography(prev => ({ ...prev, provinces: true }));
        try {
          const res = await fetch('https://provinces.open-api.vn/api/p/');
          const data = await res.json();
          setProvinces(data);
        } catch (err) {
          console.error('Error fetching provinces:', err);
        } finally {
          setLoadingGeography(prev => ({ ...prev, provinces: false }));
        }
      };
      fetchProvinces();
    }
  }, [isOpen, provinces.length]);

  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedDistrictCode('');
    setSelectedWardCode('');
    setDistricts([]);
    setWards([]);

    const provinceObj = provinces.find(p => String(p.code) === String(code));
    const provinceName = provinceObj ? provinceObj.name : '';

    setShippingAddress(prev => ({
      ...prev,
      city: provinceName,
      district: '',
      ward: ''
    }));

    if (code) {
      setLoadingGeography(prev => ({ ...prev, districts: true }));
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error('Error fetching districts:', err);
      } finally {
        setLoadingGeography(prev => ({ ...prev, districts: false }));
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    setSelectedWardCode('');
    setWards([]);

    const districtObj = districts.find(d => String(d.code) === String(code));
    const districtName = districtObj ? districtObj.name : '';

    setShippingAddress(prev => ({
      ...prev,
      district: districtName,
      ward: ''
    }));

    if (code) {
      setLoadingGeography(prev => ({ ...prev, wards: true }));
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error('Error fetching wards:', err);
      } finally {
        setLoadingGeography(prev => ({ ...prev, wards: false }));
      }
    }
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    setSelectedWardCode(code);

    const wardObj = wards.find(w => String(w.code) === String(code));
    const wardName = wardObj ? wardObj.name : '';

    setShippingAddress(prev => ({
      ...prev,
      ward: wardName
    }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const response = await api.post('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        amount: product.price,
        category: product.category
      });
      if (response.data.success) {
        setAppliedCoupon(response.data.data.coupon);
        setDiscountAmount(response.data.data.discountAmount);
        setCouponSuccess(`Áp dụng thành công! Giảm ${response.data.data.discountAmount.toLocaleString('vi-VN')} ₫`);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(response.data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(err.response?.data?.message || 'Không thể xác thực mã giảm giá');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate shipping address
    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.district ||
      !shippingAddress.ward
    ) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, SĐT, Địa chỉ chi tiết, Tỉnh/Thành, Quận/Huyện, Phường/Xã)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/orders', {
        productId: product._id,
        shippingAddress,
        deliveryMethod: 'delivery',
        paymentMethod,
        notes: notes.trim(),
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });
      
      setOrderCreatedData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (orderCreatedData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all scale-100 animate-scale-in">
          {/* Animated checkmark icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-4 animate-bounce-short">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Đơn hàng thành công!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-2 leading-relaxed">
            Đã tạo đơn hàng thành công! Vui lòng chờ người bán xác nhận đơn hàng của bạn.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onOrderCreated(orderCreatedData);
                onClose();
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-orange-600/25 active:scale-[0.98]"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-xl transition-all active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        </div>
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-bounce-short {
            animation: bounceShort 1.2s ease-in-out infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes bounceShort {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mua ngay</h3>
        
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm:</p>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{product.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Giá thanh toán:</p>
          {discountAmount > 0 ? (
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Giá gốc:</span>
                <span className="line-through">{product.price.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                <span>Giảm giá ({appliedCoupon?.code}):</span>
                <span>-{discountAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-600">
                <span className="font-semibold text-gray-900 dark:text-white">Tổng tiền:</span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {(product.price - discountAmount).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              {product.price.toLocaleString('vi-VN')} ₫
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Phương thức thanh toán *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="transfer">Chuyển khoản</option>
              <option value="cash">Tiền mặt (Thanh toán khi nhận hàng)</option>
            </select>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Giao hàng:</strong> Shipper sẽ giao hàng tận nơi cho bạn.
            </p>
          </div>

          <div className="mb-4 pb-4 border-b dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Nhập mã giảm giá (ví dụ: DNU50)..."
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white uppercase text-sm"
                disabled={isValidatingCoupon}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon || !couponInput.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 font-semibold text-sm transition-all"
              >
                {isValidatingCoupon ? 'Đang kiểm...' : 'Áp dụng'}
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {couponError}
              </p>
            )}
            {couponSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1 font-medium">
                <span>✓</span> {couponSuccess}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Họ tên người nhận *
            </label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
              placeholder="Nhập họ tên..."
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
              placeholder="Nhập số điện thoại..."
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Địa chỉ chi tiết *
                </label>
                <textarea
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="2"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tỉnh/Thành phố *
                </label>
                <select
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">{loadingGeography.provinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành phố'}</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Quận/Huyện *
                  </label>
                  <select
                    value={selectedDistrictCode}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode || loadingGeography.districts}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">
                      {loadingGeography.districts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
                    </option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Phường/Xã *
                  </label>
                  <select
                    value={selectedWardCode}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictCode || loadingGeography.wards}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">
                      {loadingGeography.wards ? 'Đang tải...' : 'Chọn Phường/Xã'}
                    </option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>


          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho người bán..."
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows="3"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              {loading ? 'Đang tạo...' : 'Xác nhận mua'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













