import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import StarRating from '../components/StarRating';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [productCounts, setProductCounts] = useState({ available: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
    checkFollowingStatus();
  }, [userId, currentUser]);


  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/public`);
      setProfile(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const checkFollowingStatus = async () => {
    if (!currentUser || currentUser.id === userId) return;
    
    try {
      const response = await api.get(`/users/${userId}/public`);
      const followers = response.data.data.followers || [];
      setIsFollowing(followers.some(f => f._id === currentUser.id));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const loadProducts = async (status) => {
    try {
      const statusMap = {
        'available': 'Available',
        'sold': 'Sold'
      };
      const response = await api.get(`/users/${userId}/products?status=${statusMap[status] || 'Available'}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadProductCounts = async () => {
    try {
      const [availableRes, soldRes] = await Promise.all([
        api.get(`/users/${userId}/products?status=Available&limit=1`),
        api.get(`/users/${userId}/products?status=Sold&limit=1`)
      ]);
      setProductCounts({
        available: availableRes.data.pagination?.total || 0,
        sold: soldRes.data.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error loading product counts:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      loadProductCounts();
      if (activeTab === 'posts') {
        loadPosts();
      } else {
        loadProducts(activeTab);
      }
    }
  }, [userId, profile]);

  useEffect(() => {
    if (profile) {
      if (activeTab === 'posts') {
        loadPosts();
      } else {
        loadProducts(activeTab);
      }
    }
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await api.delete(`/users/${userId}/follow`);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          followersCount: prev.followersCount - 1
        }));
      } else {
        await api.post(`/users/${userId}/follow`);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1
        }));
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-64 bg-gray-300 rounded"></div>
              <div className="lg:col-span-2 h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy người dùng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
            <span className="mx-2">›</span>
            <span>Trang cá nhân của {profile.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
              {/* Avatar */}
              <div className="text-center mb-4">
                <img
                  src={profile.avatar || 'https://via.placeholder.com/120'}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile.name}
                </h1>

                {/* Rating */}
                {profile.rating && profile.rating.count > 0 ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-center mb-1">
                      <StarRating rating={profile.rating.average || 0} size="sm" />
                    </div>
                    <Link
                      to={`/user/${userId}/reviews`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                    >
                      {profile.rating.count} đánh giá
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Chưa có đánh giá
                  </p>
                )}

                {/* Followers/Following */}
                <div className="flex justify-center space-x-4 mb-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {profile.followers?.length || profile.followersCount || 0}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Người theo dõi</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {profile.following?.length || profile.followingCount || 0}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Đang theo dõi</p>
                  </div>
                </div>

                {/* Follow Button */}
                {currentUser && currentUser.id !== userId && (
                  <button
                    onClick={handleFollow}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isFollowing ? '✓ Đã theo dõi' : '+ Theo dõi'}
                  </button>
                )}

                {/* Chat Response Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phản hồi chat: Chưa có thông tin
                  </p>
                </div>

                {/* Dashboard Link */}
                {currentUser && (currentUser.id === userId || currentUser.isAdmin) && (
                  <div className="mt-4">
                    <Link
                      to={`/seller-dashboard${currentUser.id === userId ? '' : `/${userId}`}`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center transition-colors"
                    >
                      📊 Dashboard Người Bán
                    </Link>
                  </div>
                )}

                {/* Join Date */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Đã tham gia: {profile.joinDuration || 'Chưa có thông tin'}
                  </p>
                </div>

                {/* Verification Status */}
                {profile.isVerified && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Đã xác thực:
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓ Email</span>
                    </div>
                  </div>
                )}

                {/* Address */}
                {profile.address && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Địa chỉ: {profile.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4 px-6">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                      activeTab === 'posts'
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Bài đăng ({profile.postCount || posts.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('available')}
                    className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                      activeTab === 'available'
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Đang hiển thị ({productCounts.available})
                  </button>
                  <button
                    onClick={() => setActiveTab('sold')}
                    className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                      activeTab === 'sold'
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Đã bán ({productCounts.sold})
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'posts' ? (
                  posts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        Chưa có bài đăng nào
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {posts.map((post) => (
                        <Link
                          key={post._id}
                          to={`/posts/${post._id}`}
                          className="relative aspect-square group overflow-hidden rounded"
                        >
                          <img
                            src={post.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={post.caption}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-4 text-white">
                              <span className="flex items-center space-x-1">
                                <span>❤️</span>
                                <span>{post.likeCount || 0}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>💬</span>
                                <span>{post.commentCount || 0}</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {activeTab === 'available' 
                        ? 'Chưa có sản phẩm nào đang hiển thị'
                        : 'Chưa có sản phẩm nào đã bán'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                      >
                        <div className="relative">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                          />
                          {product.status === 'Sold' && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Đã bán
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                            {formatPrice(product.price)} ₫
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDate(product.createdAt)}</span>
                            <span>{product.location === 'Dormitory' ? '🏠 Ký túc xá' : product.location}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
