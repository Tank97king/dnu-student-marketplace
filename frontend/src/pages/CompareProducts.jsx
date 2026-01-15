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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">So sánh sản phẩm</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Chưa có sản phẩm nào để so sánh
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Nhấn nút "So sánh" trên trang sản phẩm để thêm vào danh sách so sánh (tối đa 3 sản phẩm)
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">So sánh sản phẩm</h1>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Xóa tất cả
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left text-gray-900 dark:text-white font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10">Tiêu chí</th>
                  {products.map((product) => (
                    <th key={product._id} className="p-4 text-center min-w-[250px]">
                      <button
                        onClick={() => handleRemoveFromCompare(product._id)}
                        className="float-right text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/200'}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{product.title}</h3>
                      </Link>
                    </th>
                  ))}
                  {products.length < 3 && (
                    <th className="p-4 text-center min-w-[250px] border-l-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-gray-400 dark:text-gray-500">
                        <p className="mb-2">Thêm sản phẩm</p>
                        <Link
                          to="/products"
                          className="text-primary-600 hover:underline"
                        >
                          Tìm sản phẩm →
                        </Link>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Giá</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-900 dark:text-white">
                      <span className="text-xl font-bold text-red-600 dark:text-red-400">
                        {formatPrice(product.price)} ₫
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Danh mục</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {product.category}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Tình trạng</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {getConditionText(product.condition)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Khu vực</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {product.location === 'Campus' ? '🏫 Khuôn viên' :
                       product.location === 'Dormitory' ? '🏠 Ký túc xá' : '📍 Lân cận'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Lượt xem</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {product.viewCount || 0}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Đánh giá</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      ⭐ {product.averageRating?.toFixed(1) || '0.0'} ({product.totalReviews || 0})
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Thời gian đăng</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">Mô tả</td>
                  {products.map((product) => (
                    <td key={product._id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                      <p className="text-sm line-clamp-3">{product.description}</p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Export function to add product to compare
export const addToCompare = (productId) => {
  const saved = localStorage.getItem('compareProducts');
  let compareList = saved ? JSON.parse(saved) : [];
  
  if (compareList.length >= 3) {
    alert('Chỉ có thể so sánh tối đa 3 sản phẩm');
    return false;
  }
  if (compareList.includes(productId)) {
    alert('Sản phẩm này đã có trong danh sách so sánh');
    return false;
  }
  
  compareList.push(productId);
  localStorage.setItem('compareProducts', JSON.stringify(compareList));
  return true;
};

