import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout, updateUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import api from '../utils/api';

export default function ProfileDropdown() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data with followers/following if not present
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && (!user.followers || !user.following)) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data) {
            dispatch(updateUser({
              followers: response.data.data.followers || [],
              following: response.data.data.following || [],
              rating: response.data.data.rating || { average: 0, count: 0 }
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  // Calculate followers and following counts
  const followersCount = Array.isArray(user?.followers) ? user.followers.length : (user?.followersCount || 0);
  const followingCount = Array.isArray(user?.following) ? user.following.length : (user?.followingCount || 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <img 
          src={user?.avatar || 'https://via.placeholder.com/40'} 
          alt="Avatar" 
          className="w-10 h-10 rounded-full"
        />
        <span className="text-gray-700 dark:text-gray-200">{user?.name}</span>
        <svg 
          className={`w-4 h-4 text-gray-700 dark:text-gray-200 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-[100] max-h-[90vh] overflow-y-auto">
          {/* Yellow Header */}
          <div className="bg-yellow-400 h-4 rounded-t-lg"></div>

          {/* Profile Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start">
              <Link 
                to={`/user/${user?.id}`} 
                onClick={() => setIsOpen(false)}
                className="relative mr-4 block hover:opacity-80 transition-opacity"
              >
                <img
                  src={user?.avatar || 'https://via.placeholder.com/80'}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover cursor-pointer"
                />
              </Link>
              <div className="relative flex-1">
                <Link 
                  to={`/user/${user?.id}`} 
                  onClick={() => setIsOpen(false)}
                  className="block hover:opacity-70 transition-opacity"
                >
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{user?.name}</h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mr-2">
                    {user?.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                  <StarRating rating={Math.round(user?.rating?.average || 0)} size="sm" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {user?.rating?.count > 0 ? `${user.rating.count} đánh giá` : 'Chưa có đánh giá'}
                  </span>
                </div>

                {/* Followers/Following */}
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                  <span>{followersCount} Người theo dõi</span>
                  <span className="mx-2">•</span>
                  <span>{followingCount} Đang theo dõi</span>
                </div>
                
                {/* Edit icon - positioned absolutely */}
                <Link
                  to="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-700 text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-6.707 6.707L10.293 7.5l2.828 2.828-6.707 6.707H6v-2.586z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Quản lí đơn hàng Section */}
          <div className="px-6 pb-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Quản lí đơn hàng</h2>
            <div className="space-y-2">
              <Link 
                to="/orders?type=buying" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Đơn mua</span>
              </Link>
              
              <Link 
                to="/seller-dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Đơn bán</span>
              </Link>
              
              <Link 
                to="/offers?type=received" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Đề nghị giá</span>
              </Link>
              
              <Link 
                to="/payments" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Lịch sử thanh toán</span>
              </Link>
            </div>
          </div>

          {/* Tiện ích Section */}
          <div className="px-6 pb-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Tiện ích</h2>
            <div className="space-y-2">
              <Link 
                to="/favorites" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Sản phẩm đã lưu</span>
              </Link>
              
              <Link 
                to={`/user/${user.id}/reviews`} 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="w-5 h-5 bg-yellow-400 rounded mr-3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.76c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-gray-800 dark:text-gray-200">Đánh giá từ tôi</span>
              </Link>
              
              <Link 
                to="/transaction-history" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Lịch sử giao dịch</span>
              </Link>
            </div>
          </div>

          {/* Ưu đãi, khuyến mãi Section */}
          <div className="px-6 pb-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Ưu đãi, khuyến mãi</h2>
            <div className="space-y-2">
              <Link 
                to="/my-promotions" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="w-5 h-5 bg-green-500 rounded mr-3 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">%</span>
                </div>
                <span className="text-gray-800 dark:text-gray-200">Ưu đãi của tôi</span>
              </Link>
            </div>
          </div>

          {/* Khác Section */}
          <div className="px-6 pb-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Khác</h2>
            <div className="space-y-2">
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Cài đặt tài khoản</span>
              </Link>
              
              <Link 
                to="/notifications/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Cài đặt thông báo</span>
              </Link>
              
              <Link 
                to="/help" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Trợ giúp</span>
              </Link>
              
              <Link 
                to="/feedback" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Đóng góp ý kiến</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
