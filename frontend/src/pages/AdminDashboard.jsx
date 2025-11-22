import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateUser } from '../store/slices/authSlice'
import api from '../utils/api'

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
  }, [])

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
      alert('Đã duyệt sản phẩm thành công!')
    } catch (error) {
      alert('Không thể duyệt sản phẩm')
    }
  }

  const rejectProduct = async (id) => {
    try {
      await api.put(`/admin/products/${id}/reject`)
      fetchPendingProducts()
      fetchStats()
      alert('Đã từ chối sản phẩm!')
    } catch (error) {
      alert('Không thể từ chối sản phẩm')
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
      alert('Đã xóa tài khoản thành công!')
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      fetchUsers()
      fetchStats()
      if (showUserModal && selectedUser?._id === userToDelete._id) {
        setShowUserModal(false)
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa tài khoản')
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
      alert(response.data.message || 'Cập nhật thành công!')
      
      // Update selected user in modal immediately if it's the same user
      if (showUserModal && selectedUser?._id === userId && response.data.data) {
        setSelectedUser(response.data.data)
      }
      
      // Refresh users list
      await fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const handlePromoteAdmin = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn bổ nhiệm ${user.name} làm admin?`)) {
      updateUserStatus(user._id, { isAdmin: true })
    }
  }

  const handleRemoveAdmin = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa quyền admin của ${user.name}?`)) {
      updateUserStatus(user._id, { isAdmin: false })
    }
  }

  const handleToggleActive = (user) => {
    const action = user.isActive ? 'khóa' : 'mở khóa'
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.name}?`)) {
      updateUserStatus(user._id, { isActive: !user.isActive })
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Bảng điều khiển Quản trị</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500">Tổng người dùng</p>
            <p className="text-3xl font-bold">{stats.users.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500">Sản phẩm đang bán</p>
            <p className="text-3xl font-bold">{stats.products.available}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500">Đã bán</p>
            <p className="text-3xl font-bold">{stats.products.sold}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500">Chờ duyệt</p>
            <p className="text-3xl font-bold">{stats.products.pending}</p>
          </div>
        </div>
      )}

      {/* Pending Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm chờ duyệt</h2>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex-1 cursor-pointer" onClick={() => viewProduct(product)}>
                  <h3 className="font-semibold hover:text-blue-600">{product.title}</h3>
                  <p className="text-gray-500">{product.userId?.name}</p>
                  <p className="text-sm text-gray-400">{product.price?.toLocaleString()} VNĐ</p>
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
                    Duyệt
                  </button>
                  <button
                    onClick={() => rejectProduct(product._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Không có sản phẩm nào chờ duyệt</p>
        )}
      </div>

      {/* Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Người dùng</h2>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên, email, số điện thoại..."
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
                        Admin Tổng
                      </span>
                    )}
                    {user.isAdmin && !user.isSuperAdmin && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        Đã khóa
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      {/* Chỉ super admin mới có thể bổ nhiệm/xóa admin */}
                      {isSuperAdmin && (
                        <>
                          {!user.isAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePromoteAdmin(user)
                              }}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                              title="Bổ nhiệm Admin"
                            >
                              Bổ nhiệm Admin
                            </button>
                          ) : !user.isSuperAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAdmin(user)
                              }}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                              title="Xóa quyền Admin"
                            >
                              Xóa quyền Admin
                            </button>
                          ) : null}
                        </>
                      )}
                      {/* Chỉ super admin mới có thể xóa admin, admin thường có thể xóa user thường */}
                      {(!user.isAdmin || isSuperAdmin) && !user.isSuperAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(user)
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          title="Xóa tài khoản"
                        >
                          Xóa
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
            {searchQuery ? 'Không tìm thấy người dùng nào' : 'Không có người dùng'}
          </p>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chi tiết sản phẩm</h3>
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
                  <h4 className="font-semibold mb-2">Hình ảnh:</h4>
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
                  <h4 className="font-semibold">Tiêu đề:</h4>
                  <p className="text-gray-700">{selectedProduct.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Giá:</h4>
                  <p className="text-gray-700 font-bold text-green-600">
                    {selectedProduct.price?.toLocaleString()} VNĐ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Danh mục:</h4>
                  <p className="text-gray-700">{selectedProduct.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Tình trạng:</h4>
                  <p className="text-gray-700">{selectedProduct.condition}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Khu vực:</h4>
                  <p className="text-gray-700">{selectedProduct.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Ngày đăng:</h4>
                  <p className="text-gray-700">
                    {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold">Mô tả:</h4>
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
                <h4 className="font-semibold">Thông tin người bán:</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Tên:</strong> {selectedProduct.userId?.name}</p>
                  <p><strong>Email:</strong> {selectedProduct.userId?.email}</p>
                  {selectedProduct.userId?.phone && (
                    <p><strong>SĐT:</strong> {selectedProduct.userId.phone}</p>
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
                Từ chối
              </button>
              <button
                onClick={() => {
                  setShowProductModal(false)
                  approveProduct(selectedProduct._id)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Duyệt sản phẩm
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
              <h3 className="text-xl font-bold">Thông tin người dùng</h3>
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
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        Đã khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Số điện thoại:</h4>
                  <p className="text-gray-900">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Mã số sinh viên:</h4>
                  <p className="text-gray-900">{selectedUser.studentId || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Địa chỉ:</h4>
                  <p className="text-gray-900">{selectedUser.address || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Ngày đăng ký:</h4>
                  <p className="text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Rating Info */}
              {selectedUser.rating && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Đánh giá:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>
                      <span className="font-semibold">Điểm trung bình:</span>{' '}
                      {selectedUser.rating.average?.toFixed(1) || '0.0'}/5.0
                    </p>
                    <p>
                      <span className="font-semibold">Số đánh giá:</span>{' '}
                      {selectedUser.rating.count || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Tương tác:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{selectedUser.followers?.length || 0}</p>
                    <p className="text-sm text-gray-600">Người theo dõi</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold">{selectedUser.following?.length || 0}</p>
                    <p className="text-sm text-gray-600">Đang theo dõi</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Giới thiệu:</h4>
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
                Xem trang cá nhân
              </a>
              
              {/* Admin Actions - Chỉ super admin mới có thể bổ nhiệm/xóa admin */}
              {isSuperAdmin && (
                <>
                  {!selectedUser.isAdmin ? (
                    <button
                      onClick={() => handlePromoteAdmin(selectedUser)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Bổ nhiệm Admin
                    </button>
                  ) : !selectedUser.isSuperAdmin ? (
                    <button
                      onClick={() => handleRemoveAdmin(selectedUser)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      Xóa quyền Admin
                    </button>
                  ) : null}
                </>
              )}

              {/* Toggle Active Status */}
              <button
                onClick={() => handleToggleActive(selectedUser)}
                className={`px-4 py-2 rounded-lg ${
                  selectedUser.isActive
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedUser.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>

              {/* Delete User - Chỉ super admin mới có thể xóa admin */}
              {(!selectedUser.isAdmin || isSuperAdmin) && !selectedUser.isSuperAdmin && (
                <button
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Xóa tài khoản
                </button>
              )}
              
              <button
                onClick={() => setShowUserModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Đóng
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
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        index === currentImageIndex 
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">Xác nhận xóa tài khoản</h3>
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
                Bạn có chắc chắn muốn xóa tài khoản của:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-lg">{userToDelete.name}</p>
                <p className="text-gray-600">{userToDelete.email}</p>
              </div>
              <p className="text-red-600 text-sm mt-4 font-semibold">
                ⚠️ Cảnh báo: Hành động này không thể hoàn tác!
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Tất cả dữ liệu liên quan (sản phẩm, đơn hàng, tin nhắn, đánh giá...) sẽ bị xóa hoặc vô hiệu hóa.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                disabled={deleting}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

