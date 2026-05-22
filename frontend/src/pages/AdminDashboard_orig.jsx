import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateUser } from '../store/slices/authSlice'
import api from '../utils/api'
import AlertModal from '../components/AlertModal'

function AdminDashboard() {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const [isSuperAdmin, setIsSuperAdmin] = useState(currentUser?.isSuperAdmin || false)

  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: 'ThĂ´ng bĂ¡o',
    message: ''
  })

  // Coupon management state
  const [coupons, setCoupons] = useState([])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    description: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true,
    applicableCategories: []
  })
  const [couponFilter, setCouponFilter] = useState('all')

  // Fetch current user data to get latest isSuperAdmin status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me')
        if (response.data.success && response.data.data) {
          const userData = response.data.data
          dispatch(updateUser(userData))
          setIsSuperAdmin(userData.isSuperAdmin || false)
          console.log('AdminDashboard - Fetched user data:', userData)
          console.log('AdminDashboard - isSuperAdmin:', userData.isSuperAdmin)
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }

    fetchCurrentUser()
  }, [dispatch])

  useEffect(() => {
    fetchStats()
    fetchPendingProducts()
    fetchUsers()
    fetchCoupons()
  }, [couponFilter])

  const fetchCoupons = async () => {
    try {
      const response = await api.get(`/admin/coupons?status=${couponFilter}`)
      setCoupons(response.data.data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal) return

      switch (e.key) {
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          setShowImageModal(false)
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
        case '0':
          resetZoom()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, selectedProduct])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPendingProducts = async () => {
    try {
      const response = await api.get('/admin/products/pending')
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data)
      setFilteredUsers(response.data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSearchUsers = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.studentId?.toLowerCase().includes(query)
      )
      setFilteredUsers(filtered)
    }
  }

  const viewUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const approveProduct = async (id) => {
    try {
      await api.put(`/admin/products/${id}/approve`)
      fetchPendingProducts()
      fetchStats()
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'ThĂ nh cĂ´ng!',
        message: 'ÄĂ£ duyá»‡t sáº£n pháº©m thĂ nh cĂ´ng!'
      })
    } catch (error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Lá»—i!',
        message: 'KhĂ´ng thá»ƒ duyá»‡t sáº£n pháº©m'
      })
    }
  }

  const rejectProduct = async (id) => {
    try {
      await api.put(`/admin/products/${id}/reject`)
      fetchPendingProducts()
      fetchStats()
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: 'ÄĂ£ tá»« chá»‘i',
        message: 'ÄĂ£ tá»« chá»‘i sáº£n pháº©m!'
      })
    } catch (error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Lá»—i!',
        message: 'KhĂ´ng thá»ƒ tá»« chá»‘i sáº£n pháº©m'
      })
    }
  }

  const viewProduct = (product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const openImageModal = (index) => {
    setCurrentImageIndex(index)
    setImageZoom(1)
    setShowImageModal(true)
  }

  const nextImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      )
    }
  }

  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  const resetZoom = () => {
    setImageZoom(1)
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      await api.delete(`/admin/users/${userToDelete._id}`)
      alert('ÄĂ£ xĂ³a tĂ i khoáº£n thĂ nh cĂ´ng!')
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      fetchUsers()
      fetchStats()
      if (showUserModal && selectedUser?._id === userToDelete._id) {
        setShowUserModal(false)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ xĂ³a tĂ i khoáº£n')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }

  const updateUserStatus = async (userId, updates) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updates)
      alert(response.data.message || 'Cáº­p nháº­t thĂ nh cĂ´ng!')

      // Update selected user in modal immediately if it's the same user
      if (showUserModal && selectedUser?._id === userId && response.data.data) {
        setSelectedUser(response.data.data)
      }

      // Refresh users list
      await fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ cáº­p nháº­t')
    }
  }

  const handlePromoteAdmin = (user) => {
    if (window.confirm(`Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n bá»• nhiá»‡m ${user.name} lĂ m admin?`)) {
      updateUserStatus(user._id, { isAdmin: true })
    }
  }

  const handleRemoveAdmin = (user) => {
    if (window.confirm(`Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a quyá»n admin cá»§a ${user.name}?`)) {
      updateUserStatus(user._id, { isAdmin: false })
    }
  }

  const handleToggleActive = (user) => {
    const action = user.isActive ? 'khĂ³a' : 'má»Ÿ khĂ³a'
    if (window.confirm(`Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n ${action} tĂ i khoáº£n cá»§a ${user.name}?`)) {
      updateUserStatus(user._id, { isActive: !user.isActive })
    }
  }

  // Coupon management functions
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...couponFormData,
        discountValue: parseFloat(couponFormData.discountValue),
        minPurchase: parseFloat(couponFormData.minPurchase) || 0,
        maxDiscount: couponFormData.maxDiscount ? parseFloat(couponFormData.maxDiscount) : null,
        usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null
      }

      const response = await api.post('/admin/coupons', data)
      alert(response.data.message || 'Táº¡o mĂ£ giáº£m giĂ¡ thĂ nh cĂ´ng!')
      setShowCouponForm(false)
      setSelectedCoupon(null)
      fetchCoupons()
      setCouponFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        description: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true,
        applicableCategories: []
      })
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ táº¡o mĂ£ giáº£m giĂ¡')
    }
  }

  const handleUpdateCoupon = async (e) => {
    e.preventDefault()
    if (!selectedCoupon) return

    try {
      const data = {
        ...couponFormData,
        discountValue: parseFloat(couponFormData.discountValue),
        minPurchase: parseFloat(couponFormData.minPurchase) || 0,
        maxDiscount: couponFormData.maxDiscount ? parseFloat(couponFormData.maxDiscount) : null,
        usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null
      }

      const response = await api.put(`/admin/coupons/${selectedCoupon._id}`, data)
      alert(response.data.message || 'Cáº­p nháº­t mĂ£ giáº£m giĂ¡ thĂ nh cĂ´ng!')
      setShowCouponForm(false)
      setSelectedCoupon(null)
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ cáº­p nháº­t mĂ£ giáº£m giĂ¡')
    }
  }

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon)
    setCouponFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || '',
      maxDiscount: coupon.maxDiscount || '',
      description: coupon.description || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      applicableCategories: coupon.applicableCategories || []
    })
    setShowCouponForm(true)
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a mĂ£ giáº£m giĂ¡ nĂ y?')) return

    try {
      await api.delete(`/admin/coupons/${couponId}`)
      alert('XĂ³a mĂ£ giáº£m giĂ¡ thĂ nh cĂ´ng!')
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ xĂ³a mĂ£ giáº£m giĂ¡')
    }
  }

  const handleToggleCouponActive = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      alert(coupon.isActive ? 'ÄĂ£ vĂ´ hiá»‡u hĂ³a mĂ£ giáº£m giĂ¡' : 'ÄĂ£ kĂ­ch hoáº¡t mĂ£ giáº£m giĂ¡')
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'KhĂ´ng thá»ƒ cáº­p nháº­t tráº¡ng thĂ¡i')
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Báº£ng Ä‘iá»u khiá»ƒn Quáº£n trá»‹</h1>
        <div className="flex space-x-2">
          <Link
            to="/admin/revenue"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            đŸ“ Thá»‘ng kĂª doanh thu
          </Link>
          <Link
            to="/admin/payments"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            đŸ’³ Quáº£n lĂ½ thanh toĂ¡n
          </Link>
          {isSuperAdmin && (
            <Link
              to="/admin/bankqr"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              đŸ¦ Quáº£n lĂ½ QR Code
            </Link>
          )}
          <button
            onClick={() => setShowCouponModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            đŸŸï¸ Quáº£n lĂ½ mĂ£ giáº£m giĂ¡
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">Tá»•ng ngÆ°á»i dĂ¹ng</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.users.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">Sáº£n pháº©m Ä‘ang bĂ¡n</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.products.available}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">ÄĂ£ bĂ¡n</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.products.sold}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">Chá» duyá»‡t</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.products.pending}</p>
          </div>
          {stats.payments && (
            <>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">Tá»•ng doanh thu</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat('vi-VN').format(stats.payments.totalRevenue || 0)} â‚«
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">Thanh toĂ¡n Ä‘Ă£ xĂ¡c nháº­n</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.payments.confirmed || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">Chá» xĂ¡c nháº­n</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.payments.pending || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">Tá»•ng thanh toĂ¡n</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.payments.total || 0}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pending Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Sáº£n pháº©m chá» duyá»‡t</h2>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex-1 cursor-pointer" onClick={() => viewProduct(product)}>
                  <h3 className="font-semibold hover:text-blue-600">{product.title}</h3>
                  <p className="text-gray-500">{product.userId?.name}</p>
                  <p className="text-sm text-gray-400">{product.price?.toLocaleString()} VNÄ</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewProduct(product)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => approveProduct(product._id)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Duyá»‡t
                  </button>
                  <button
                    onClick={() => rejectProduct(product._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Tá»« chá»‘i
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">KhĂ´ng cĂ³ sáº£n pháº©m nĂ o chá» duyá»‡t</p>
        )}
      </div>

      {/* Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">NgÆ°á»i dĂ¹ng</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="TĂ¬m kiáº¿m ngÆ°á»i dĂ¹ng theo tĂªn, email, sá»‘ Ä‘iá»‡n thoáº¡i..."
            value={searchQuery}
            onChange={handleSearchUsers}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewUser(user)}
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/40'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.isSuperAdmin && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                        Admin Tá»•ng
                      </span>
                    )}
                    {user.isAdmin && !user.isSuperAdmin && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        ÄĂ£ khĂ³a
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      {/* Chá»‰ super admin má»›i cĂ³ thá»ƒ bá»• nhiá»‡m/xĂ³a admin */}
                      {isSuperAdmin && (
                        <>
                          {!user.isAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePromoteAdmin(user)
                              }}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                              title="Bá»• nhiá»‡m Admin"
                            >
                              Bá»• nhiá»‡m Admin
                            </button>
                          ) : !user.isSuperAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAdmin(user)
                              }}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                              title="XĂ³a quyá»n Admin"
                            >
                              XĂ³a quyá»n Admin
                            </button>
                          ) : null}
                        </>
                      )}
                      {/* Chá»‰ super admin má»›i cĂ³ thá»ƒ xĂ³a admin, admin thÆ°á»ng cĂ³ thá»ƒ xĂ³a user thÆ°á»ng */}
                      {(!user.isAdmin || isSuperAdmin) && !user.isSuperAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(user)
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          title="XĂ³a tĂ i khoáº£n"
                        >
                          XĂ³a
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            {searchQuery ? 'KhĂ´ng tĂ¬m tháº¥y ngÆ°á»i dĂ¹ng nĂ o' : 'KhĂ´ng cĂ³ ngÆ°á»i dĂ¹ng'}
          </p>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chi tiáº¿t sáº£n pháº©m</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">HĂ¬nh áº£nh:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.title} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">TiĂªu Ä‘á»:</h4>
                  <p className="text-gray-700">{selectedProduct.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">GiĂ¡:</h4>
                  <p className="text-gray-700 font-bold text-green-600">
                    {selectedProduct.price?.toLocaleString()} VNÄ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Danh má»¥c:</h4>
                  <p className="text-gray-700">{selectedProduct.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold">TĂ¬nh tráº¡ng:</h4>
                  <p className="text-gray-700">{selectedProduct.condition}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Khu vá»±c:</h4>
                  <p className="text-gray-700">{selectedProduct.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold">NgĂ y Ä‘Äƒng:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold">MĂ´ táº£:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProduct.description}</p>
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div>
                <h4 className="font-semibold">ThĂ´ng tin ngÆ°á»i bĂ¡n:</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>TĂªn:</strong> {selectedProduct.userId?.name}</p>
                  <p><strong>Email:</strong> {selectedProduct.userId?.email}</p>
                  {selectedProduct.userId?.phone && (
                    <p><strong>SÄT:</strong> {selectedProduct.userId.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowProductModal(false)
                  rejectProduct(selectedProduct._id)
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tá»« chá»‘i
              </button>
              <button
                onClick={() => {
                  setShowProductModal(false)
                  approveProduct(selectedProduct._id)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Duyá»‡t sáº£n pháº©m
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">ThĂ´ng tin ngÆ°á»i dĂ¹ng</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4 pb-4 border-b">
                <img
                  src={selectedUser.avatar || 'https://via.placeholder.com/100'}
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full"
                />
                <div>
                  <h4 className="text-xl font-bold">{selectedUser.name}</h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {selectedUser.isAdmin && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                    {selectedUser.isActive ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Äang hoáº¡t Ä‘á»™ng
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        ÄĂ£ khĂ³a
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Sá»‘ Ä‘iá»‡n thoáº¡i:</h4>
                  <p className="text-gray-900">{selectedUser.phone || 'ChÆ°a cáº­p nháº­t'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">MĂ£ sá»‘ sinh viĂªn:</h4>
                  <p className="text-gray-900">{selectedUser.studentId || 'ChÆ°a cáº­p nháº­t'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Äá»‹a chá»‰:</h4>
                  <p className="text-gray-900">{selectedUser.address || 'ChÆ°a cáº­p nháº­t'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">NgĂ y Ä‘Äƒng kĂ½:</h4>
                  <p className="text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Rating Info */}
              {selectedUser.rating && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">ÄĂ¡nh giĂ¡:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>
                      <span className="font-semibold">Äiá»ƒm trung bĂ¬nh:</span>{' '}
                      {selectedUser.rating.average?.toFixed(1) || '0.0'}/5.0
                    </p>
                    <p>
                      <span className="font-semibold">Sá»‘ Ä‘Ă¡nh giĂ¡:</span>{' '}
                      {selectedUser.rating.count || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">TÆ°Æ¡ng tĂ¡c:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{selectedUser.followers?.length || 0}</p>
                    <p className="text-sm text-gray-600">NgÆ°á»i theo dĂµi</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{selectedUser.following?.length || 0}</p>
                    <p className="text-sm text-gray-600">Äang theo dĂµi</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Giá»›i thiá»‡u:</h4>
                  <p className="text-gray-900">{selectedUser.bio}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-2 mt-6 pt-4 border-t">
              <a
                href={`/user/${selectedUser._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Xem trang cĂ¡ nhĂ¢n
              </a>

              {/* Admin Actions - Chá»‰ super admin má»›i cĂ³ thá»ƒ bá»• nhiá»‡m/xĂ³a admin */}
              {isSuperAdmin && (
                <>
                  {!selectedUser.isAdmin ? (
                    <button
                      onClick={() => handlePromoteAdmin(selectedUser)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Bá»• nhiá»‡m Admin
                    </button>
                  ) : !selectedUser.isSuperAdmin ? (
                    <button
                      onClick={() => handleRemoveAdmin(selectedUser)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      XĂ³a quyá»n Admin
                    </button>
                  ) : null}
                </>
              )}

              {/* Toggle Active Status */}
              <button
                onClick={() => handleToggleActive(selectedUser)}
                className={`px-4 py-2 rounded-lg ${selectedUser.isActive
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {selectedUser.isActive ? 'KhĂ³a tĂ i khoáº£n' : 'Má»Ÿ khĂ³a tĂ i khoáº£n'}
              </button>

              {/* Delete User - Chá»‰ super admin má»›i cĂ³ thá»ƒ xĂ³a admin */}
              {(!selectedUser.isAdmin || isSuperAdmin) && !selectedUser.isSuperAdmin && (
                <button
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  XĂ³a tĂ i khoáº£n
                </button>
              )}

              <button
                onClick={() => setShowUserModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                ÄĂ³ng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedProduct?.images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex flex-col">
            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={zoomOut}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-full text-sm hover:bg-opacity-80"
              >
                {Math.round(imageZoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image Area */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Navigation Arrows */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-opacity-80 z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Main Image */}
              <img
                src={selectedProduct.images[currentImageIndex]}
                alt={`${selectedProduct.title} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${imageZoom})` }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Image Counter */}
              {selectedProduct.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {selectedProduct.images.length}
                </div>
              )}

              {/* Thumbnail Navigation */}
              {selectedProduct.images.length > 1 && (
                <div className="flex justify-center space-x-2 pb-2">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${index === currentImageIndex
                        ? 'border-white'
                        : 'border-transparent hover:border-gray-400'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Management Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedCoupon ? 'Chá»‰nh sá»­a mĂ£ giáº£m giĂ¡' : 'Táº¡o mĂ£ giáº£m giĂ¡ má»›i'}</h3>
              <button
                onClick={() => {
                  setShowCouponForm(false)
                  setSelectedCoupon(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={selectedCoupon ? handleUpdateCoupon : handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">MĂ£ giáº£m giĂ¡ *</label>
                  <input
                    type="text"
                    required
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: SALE50"
                    disabled={!!selectedCoupon}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Loáº¡i giáº£m giĂ¡ *</label>
                  <select
                    required
                    value={couponFormData.discountType}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Pháº§n trÄƒm (%)</option>
                    <option value="fixed">Sá»‘ tiá»n cá»‘ Ä‘á»‹nh (VNÄ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GiĂ¡ trá»‹ giáº£m giĂ¡ *</label>
                  <input
                    type="number"
                    required
                    min={couponFormData.discountType === 'percentage' ? 1 : 0}
                    max={couponFormData.discountType === 'percentage' ? 100 : undefined}
                    step={couponFormData.discountType === 'percentage' ? 1 : 1000}
                    value={couponFormData.discountValue}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={couponFormData.discountType === 'percentage' ? 'VD: 20 (cho 20%)' : 'VD: 50000'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">ÄÆ¡n hĂ ng tá»‘i thiá»ƒu (VNÄ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={couponFormData.minPurchase}
                    onChange={(e) => setCouponFormData({ ...couponFormData, minPurchase: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>

              {couponFormData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Giáº£m tá»‘i Ä‘a (VNÄ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={couponFormData.maxDiscount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="KhĂ´ng giá»›i háº¡n"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NgĂ y háº¿t háº¡n *</label>
                  <input
                    type="date"
                    required
                    value={couponFormData.expiryDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giá»›i háº¡n sá»­ dá»¥ng</label>
                  <input
                    type="number"
                    min="1"
                    value={couponFormData.usageLimit}
                    onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="KhĂ´ng giá»›i háº¡n"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">MĂ´ táº£</label>
                <textarea
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="MĂ´ táº£ mĂ£ giáº£m giĂ¡..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Danh má»¥c Ă¡p dá»¥ng</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'].map(cat => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={couponFormData.applicableCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCouponFormData({
                              ...couponFormData,
                              applicableCategories: [...couponFormData.applicableCategories, cat]
                            })
                          } else {
                            setCouponFormData({
                              ...couponFormData,
                              applicableCategories: couponFormData.applicableCategories.filter(c => c !== cat)
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedCoupon && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={couponFormData.isActive}
                      onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span>KĂ­ch hoáº¡t mĂ£ giáº£m giĂ¡</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCouponForm(false)
                    setSelectedCoupon(null)
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Há»§y
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {selectedCoupon ? 'Cáº­p nháº­t' : 'Táº¡o mĂ£'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon List Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Quáº£n lĂ½ mĂ£ giáº£m giĂ¡</h3>
              <div className="flex space-x-2">
                <select
                  value={couponFilter}
                  onChange={(e) => setCouponFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Táº¥t cáº£</option>
                  <option value="active">Äang hoáº¡t Ä‘á»™ng</option>
                  <option value="expired">ÄĂ£ háº¿t háº¡n</option>
                  <option value="used">ÄĂ£ sá»­ dá»¥ng</option>
                </select>
                <button
                  onClick={() => {
                    setShowCouponModal(false)
                    setShowCouponForm(true)
                    setSelectedCoupon(null)
                    setCouponFormData({
                      code: '',
                      discountType: 'percentage',
                      discountValue: '',
                      minPurchase: '',
                      maxDiscount: '',
                      description: '',
                      expiryDate: '',
                      usageLimit: '',
                      isActive: true,
                      applicableCategories: []
                    })
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  + Táº¡o má»›i
                </button>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {coupons.length > 0 ? (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) <= new Date()
                  const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit

                  return (
                    <div key={coupon._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-lg">{coupon.code}</span>
                            {coupon.isActive && !isExpired && !isUsedUp ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Hoáº¡t Ä‘á»™ng</span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">KhĂ´ng hoáº¡t Ä‘á»™ng</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{coupon.description || 'KhĂ´ng cĂ³ mĂ´ táº£'}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">Loáº¡i:</span>{' '}
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : `${coupon.discountValue.toLocaleString('vi-VN')} VNÄ`}
                            </div>
                            <div>
                              <span className="font-semibold">ÄÆ¡n tá»‘i thiá»ƒu:</span>{' '}
                              {coupon.minPurchase ? `${coupon.minPurchase.toLocaleString('vi-VN')} VNÄ` : 'KhĂ´ng'}
                            </div>
                            <div>
                              <span className="font-semibold">Háº¿t háº¡n:</span>{' '}
                              {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                            </div>
                            <div>
                              <span className="font-semibold">Sá»­ dá»¥ng:</span>{' '}
                              {coupon.usedCount}/{coupon.usageLimit || 'âˆ'}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowCouponModal(false)
                              handleEditCoupon(coupon)
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Sá»­a
                          </button>
                          <button
                            onClick={() => handleToggleCouponActive(coupon)}
                            className={`px-3 py-1 rounded text-sm ${coupon.isActive
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            {coupon.isActive ? 'VĂ´ hiá»‡u' : 'KĂ­ch hoáº¡t'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            XĂ³a
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-8">ChÆ°a cĂ³ mĂ£ giáº£m giĂ¡ nĂ o</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">XĂ¡c nháº­n xĂ³a tĂ i khoáº£n</h3>
              <button
                onClick={cancelDeleteUser}
                className="text-gray-500 hover:text-gray-700"
                disabled={deleting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Báº¡n cĂ³ cháº¯c cháº¯n muá»‘n xĂ³a tĂ i khoáº£n cá»§a:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-lg">{userToDelete.name}</p>
                <p className="text-gray-600">{userToDelete.email}</p>
              </div>
              <p className="text-red-600 text-sm mt-4 font-semibold">
                â ï¸ Cáº£nh bĂ¡o: HĂ nh Ä‘á»™ng nĂ y khĂ´ng thá»ƒ hoĂ n tĂ¡c!
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Táº¥t cáº£ dá»¯ liá»‡u liĂªn quan (sáº£n pháº©m, Ä‘Æ¡n hĂ ng, tin nháº¯n, Ä‘Ă¡nh giĂ¡...) sáº½ bá»‹ xĂ³a hoáº·c vĂ´ hiá»‡u hĂ³a.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                disabled={deleting}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Há»§y
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Äang xĂ³a...' : 'XĂ¡c nháº­n xĂ³a'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  )
}

export default AdminDashboard

