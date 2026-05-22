import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function CompareProducts() {
  const { user } = useSelector(state => state.auth);
  const [compareList, setCompareList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load compare list from localStorage
    const saved = localStorage.getItem('compareProducts');
    if (saved) {
      const ids = JSON.parse(saved);
      setCompareList(ids);
      if (ids.length > 0) {
        loadProducts(ids);
      }
    }
  }, []);

  const loadProducts = async (productIds) => {
    setLoading(true);
    try {
      const promises = productIds.map(id => api.get(`/products/${id}`));
      const responses = await Promise.all(promises);
      setProducts(responses.map(r => r.data.data));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCompare = (productId) => {
    if (compareList.length >= 3) {
      alert('Chỉ có thể so sánh tối đa 3 sản phẩm');
      return;
    }
    if (compareList.includes(productId)) {
      alert('Sản phẩm này đã có trong danh sách so sánh');
      return;
    }
    const newList = [...compareList, productId];
    setCompareList(newList);
    localStorage.setItem('compareProducts', JSON.stringify(newList));
    loadProducts(newList);
  };

  const handleRemoveFromCompare = (productId) => {
    const newList = compareList.filter(id => id !== productId);
    setCompareList(newList);
    localStorage.setItem('compareProducts', JSON.stringify(newList));
    const newProducts = products.filter(p => p._id !== productId);
    setProducts(newProducts);
  };

  const handleClearAll = () => {
    setCompareList([]);
    setProducts([]);
    localStorage.removeItem('compareProducts');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getConditionText = (condition) => {
    // Map cả giá trị cũ (tiếng Anh) và mới (tiếng Việt)
    const conditionMap = {
      // Giá trị mới (tiếng Việt)
      'Rất tốt': 'Rất tốt',
      'Tốt': 'Tốt',
      'Khá': 'Khá',
      'Đã dùng nhiều': 'Đã dùng nhiều',
      'Cần sửa chữa': 'Cần sửa chữa',
      // Giá trị cũ (tiếng Anh) - map sang tiếng Việt
      'New': 'Mới',
      'Like New': 'Như mới',
      'Excellent': 'Rất tốt',
      'Good': 'Tốt',
      'Fair': 'Khá',
      'Used': 'Đã dùng nhiều',
      'NeedsRepair': 'Cần sửa chữa'
    };
    return conditionMap[condition] || condition || '';
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <nav className="flex text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 dark:text-gray-200">So sánh sản phẩm</span>
          </nav>
        </div>

        <div className="max-w-md mx-auto px-4 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M3 12h18M6 7l6-2 6 2M6 17l6-2 6 2" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">So sánh sản phẩm</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Bạn chưa thêm sản phẩm nào vào danh sách so sánh. Hãy khám phá các sản phẩm và nhấn nút <strong className="text-orange-500">So sánh</strong> để đối chiếu thông tin dễ dàng hơn!
            </p>
            
            <Link
              to="/products"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 dark:shadow-none hover:-translate-y-0.5 transition-all duration-300"
            >
              Tìm kiếm sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <nav className="flex text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">So sánh sản phẩm</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                So sánh sản phẩm
              </h1>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {products.length} / 3 sản phẩm
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đối chiếu thông tin chi tiết để chọn được sản phẩm phù hợp nhất.
            </p>
          </div>
          
          <button
            onClick={handleClearAll}
            className="self-start sm:self-center px-4 py-2.5 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 bg-red-50/50 hover:bg-red-600 hover:text-white dark:bg-red-950/10 dark:hover:bg-red-900/60 transition-all rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa tất cả
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center text-gray-600 dark:text-gray-400 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải thông tin sản phẩm...</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/40">
                    <th className="p-6 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest min-w-[180px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                      Tiêu chí đối chiếu
                    </th>
                    {products.map((product) => (
                      <th key={product._id} className="p-6 text-center min-w-[280px] max-w-[320px] relative group border-l border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => handleRemoveFromCompare(product._id)}
                          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-red-50 hover:bg-red-500 dark:bg-red-950/30 dark:hover:bg-red-900 text-red-500 hover:text-white dark:text-red-400 flex items-center justify-center transition-all shadow-sm z-20"
                          title="Xóa khỏi so sánh"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <div className="flex flex-col items-center">
                          <Link to={`/products/${product._id}`} className="block w-full group/img overflow-hidden rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
                              alt={product.title}
                              className="w-full h-44 object-cover group-hover/img:scale-105 transition-transform duration-500"
                            />
                          </Link>
                          <Link to={`/products/${product._id}`} className="block hover:text-orange-500 transition-colors">
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-2 text-center px-2 leading-snug">
                              {product.title}
                            </h3>
                          </Link>
                        </div>
                      </th>
                    ))}
                    {products.length < 3 && (
                      <th className="p-6 text-center min-w-[280px] max-w-[320px] border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-3 text-gray-400 dark:text-gray-500">
                            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">Thêm sản phẩm so sánh</p>
                          <Link
                            to="/products"
                            className="text-xs font-extrabold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-950/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Tìm kiếm ngay →
                          </Link>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      💰 Giá bán
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700">
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                          {formatPrice(product.price)} <span className="text-xs uppercase font-extrabold text-orange-600/85">VNĐ</span>
                        </span>
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      📂 Danh mục
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                          {product.category}
                        </span>
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      ✨ Độ mới / Tình trạng
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {getConditionText(product.condition)}
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      📍 Khu vực nhận hàng
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {product.location === 'Campus' ? '🏫 Khuôn viên' :
                         product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      👁️ Lượt xem tin
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200">
                        {product.viewCount || 0}
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      ⭐ Đánh giá người bán
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                          <span className="text-yellow-400">★</span>
                          <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-400 font-medium">({product.totalReviews || 0})</span>
                        </div>
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      📅 Ngày đăng bán
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      📝 Mô tả chi tiết
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 border-l border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 max-w-[320px] text-justify leading-relaxed">
                        <p className="line-clamp-6">{product.description}</p>
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>

                  <tr className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="p-5 font-bold text-xs text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      ⚡ Thao tác nhanh
                    </td>
                    {products.map((product) => (
                      <td key={product._id} className="p-5 text-center border-l border-gray-100 dark:border-gray-700">
                        <Link
                          to={`/products/${product._id}`}
                          className="inline-flex items-center justify-center w-full max-w-[200px] px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    ))}
                    {products.length < 3 && <td className="border-l border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800/10"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const addToCompare = (productId) => {
  const saved = localStorage.getItem('compareProducts');
  let compareList = saved ? JSON.parse(saved) : [];
  
  if (compareList.length >= 3) {
    return { success: false, message: 'Chỉ có thể so sánh tối đa 3 sản phẩm.' };
  }
  if (compareList.includes(productId)) {
    return { success: false, message: 'Sản phẩm này đã có trong danh sách so sánh.' };
  }
  
  compareList.push(productId);
  localStorage.setItem('compareProducts', JSON.stringify(compareList));
  return { success: true, message: 'Đã thêm vào danh sách so sánh.' };
};

