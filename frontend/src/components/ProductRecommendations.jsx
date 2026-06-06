import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProductRecommendations({ type, productId, limit = 8 }) {
  const { user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    loadRecommendations();
  }, [type, productId, user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (type) {
        case 'ai-similar':
          endpoint = `/products/${productId}/ai-similar`;
          break;
        case 'similar':
          endpoint = `/products/${productId}/similar`;
          break;
        case 'also-viewed':
          endpoint = `/products/${productId}/also-viewed`;
          break;
        case 'recommended':
          if (!user) {
            setLoading(false);
            return;
          }
          endpoint = '/products/recommended';
          break;
        case 'nearby':
          if (!user) {
            setLoading(false);
            return;
          }
          endpoint = '/products/nearby';
          break;
        default:
          setLoading(false);
          return;
      }

      const response = await api.get(endpoint);
      setProducts((response.data.data || []).slice(0, limit));
    } catch (error) {
      console.error(`Error loading ${type} products:`, error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.product-card')?.offsetWidth || 280;
      const gap = 16; // gap-4 = 16px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.product-card')?.offsetWidth || 280;
      const gap = 16; // gap-4 = 16px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getTitle = () => {
    const titles = {
      'ai-similar': 'Gợi ý bằng AI',
      similar: 'Sản phẩm tương tự',
      'also-viewed': 'Người dùng cũng xem',
      recommended: 'Sản phẩm bạn có thể thích',
      nearby: 'Sản phẩm gần bạn'
    };
    return titles[type] || 'Gợi ý sản phẩm';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{getTitle()}</h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{getTitle()}</h2>
      <div className="relative">
        {/* Previous Button */}
        {products.length > 4 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sản phẩm trước"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="product-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full flex-shrink-0"
              style={{ minWidth: '280px', maxWidth: '280px' }}
            >
              <div className="w-full h-48 overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image';
                  }}
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-semibold line-clamp-2 text-gray-800 dark:text-gray-200 text-sm mb-2 min-h-[2.5rem] leading-tight">
                  {product.title}
                </h3>
                <div className="mt-auto">
                  <p className="text-orange-600 dark:text-orange-400 font-bold text-base mb-1">
                    {formatPrice(product.price)} ₫
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {product.location === 'Campus' ? '🏫' :
                        product.location === 'Dormitory' ? '🏠' : '📍'}
                    </span>
                    {product.averageRating > 0 && (
                      <span className="flex items-center">
                        ⭐ {product.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Next Button */}
        {products.length > 4 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sản phẩm tiếp theo"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

