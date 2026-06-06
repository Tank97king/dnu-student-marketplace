import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateUser } from '../store/slices/authSlice'
import api from '../utils/api'
import AlertModal from '../components/AlertModal'
import Toast from '../components/Toast'
import { useConfirm } from '../components/ConfirmModal'

function AdminDashboard() {
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const { user: currentUser } = useSelector((state) => state.auth)
  const [isSuperAdmin, setIsSuperAdmin] = useState(currentUser?.isSuperAdmin || false)

  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])
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
  const [reportedProducts, setReportedProducts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Toast Notification State
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    title: ''
  })

  const showToastMsg = (message, type = 'success', title = '') => {
    setToast({
      isVisible: true,
      message,
      type,
      title
    })
  }

  // --- Return/Refund State ---
  const [returnRequests, setReturnRequests] = useState([])
  const [showReturnRejectModal, setShowReturnRejectModal] = useState(false)
  const [returnToReject, setReturnToReject] = useState(null)
  const [returnRejectionReason, setReturnRejectionReason] = useState('')

  // --- Shipper Management State ---
  const [shippers, setShippers] = useState([])
  const [showShipperRejectModal, setShowShipperRejectModal] = useState(false)
  const [shipperToReject, setShipperToReject] = useState(null)
  const [shipperRejectReason, setShipperRejectReason] = useState('')
  const [isSuspendAction, setIsSuspendAction] = useState(false)

  const [orders, setOrders] = useState([])
  const [showAssignShipperModal, setShowAssignShipperModal] = useState(false)
  const [orderToAssign, setOrderToAssign] = useState(null)
  const [selectedShipperId, setSelectedShipperId] = useState('')

  // --- Seller QR State ---
  const [sellerQRs, setSellerQRs] = useState([])
  const [selectedQR, setSelectedQR] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'success',
    title: 'Thông báo',
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

  // Sold products search and filter states
  const [soldProductsSearch, setSoldProductsSearch] = useState('')
  const [soldProductsFilter, setSoldProductsFilter] = useState('all')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receiptZoom, setReceiptZoom] = useState(1)

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
    fetchReportedProducts()
    fetchReturnRequests()
    fetchShippers()
    fetchSellerQRs()
    fetchOrders()
    fetchPayments()
  }, [couponFilter])

  const fetchReturnRequests = async () => {
    try {
      const response = await api.get('/orders/return-requests')
      setReturnRequests(response.data.data || [])
    } catch (error) {
      console.error('Error fetching return requests:', error)
    }
  }

  const fetchShippers = async () => {
    try {
      const response = await api.get('/shipper/list')
      setShippers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching shippers:', error)
    }
  }

  const fetchSellerQRs = async () => {
    try {
      const response = await api.get('/seller-bankqr/all')
      setSellerQRs(response.data.data || [])
    } catch (error) {
      console.error('Error fetching seller bank QRs:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/admin/all')
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments')
      setPayments(response.data.data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
  }

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

  const fetchReportedProducts = async () => {
    try {
      const response = await api.get('/admin/reports')
      setReportedProducts(response.data.data || [])
    } catch (error) {
      console.error('Error fetching reported products:', error)
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
        title: 'Thành công!',
        message: 'Đã duyệt sản phẩm thành công!'
      })
    } catch (error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi!',
        message: 'Không thể duyệt sản phẩm'
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
        title: 'Đã từ chối',
        message: 'Đã từ chối sản phẩm!'
      })
    } catch (error) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Lỗi!',
        message: 'Không thể từ chối sản phẩm'
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

  const handleToggleShipperRole = async (user) => {
    const action = user.isShipper ? 'thu hồi quyền Shipper của' : 'cấp quyền Shipper cho'
    if (window.confirm(`Bạn có chắc chắn muốn ${action} ${user.name}?`)) {
      try {
        const response = await api.put(`/shipper/${user._id}/role`, { isShipper: !user.isShipper })
        showToastMsg(response.data.message || 'Cập nhật thành công!', 'success')
        await fetchUsers()
      } catch (error) {
        showToastMsg(error.response?.data?.message || 'Không thể cập nhật quyền Shipper', 'error')
      }
    }
  }

  const handleToggleActive = (user) => {
    const action = user.isActive ? 'khóa' : 'mở khóa'
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.name}?`)) {
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
      alert(response.data.message || 'Tạo mã giảm giá thành công!')
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
      alert(error.response?.data?.message || 'Không thể tạo mã giảm giá')
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
      alert(response.data.message || 'Cập nhật mã giảm giá thành công!')
      setShowCouponForm(false)
      setSelectedCoupon(null)
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật mã giảm giá')
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return

    try {
      await api.delete(`/admin/coupons/${couponId}`)
      alert('Xóa mã giảm giá thành công!')
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa mã giảm giá')
    }
  }

  const handleToggleCouponActive = async (coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      alert(coupon.isActive ? 'Đã vô hiệu hóa mã giảm giá' : 'Đã kích hoạt mã giảm giá')
      fetchCoupons()
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái')
    }
  }

  // --- Return/Refund Actions ---
  const handleApproveReturn = async (orderId) => {
    const isConfirmed = await confirm({
      title: 'Duyệt hoàn hàng',
      message: 'Bạn có chắc chắn muốn duyệt yêu cầu hoàn hàng này? Đơn hàng sẽ bị hủy, và sản phẩm sẽ được tự động mở bán lại.',
      type: 'question'
    })
    if (!isConfirmed) return

    try {
      const response = await api.put(`/orders/${orderId}/return-approve`)
      showToastMsg(response.data.message || 'Đã chấp nhận yêu cầu hoàn hàng', 'success', 'Thành công')
      fetchReturnRequests()
      fetchStats()
      fetchOrders()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể duyệt hoàn hàng', 'error', 'Lỗi')
    }
  }

  const handleRejectReturnClick = (orderId) => {
    setReturnToReject(orderId)
    setReturnRejectionReason('')
    setShowReturnRejectModal(true)
  }

  const handleRejectReturnSubmit = async (e) => {
    e.preventDefault()
    if (!returnRejectionReason.trim()) {
      showToastMsg('Vui lòng cung cấp lý do từ chối', 'warning', 'Cảnh báo')
      return
    }

    try {
      const response = await api.put(`/orders/${returnToReject}/return-reject`, {
        rejectionReason: returnRejectionReason
      })
      showToastMsg(response.data.message || 'Đã từ chối hoàn hàng', 'success', 'Thành công')
      setShowReturnRejectModal(false)
      setReturnToReject(null)
      setReturnRejectionReason('')
      fetchReturnRequests()
      fetchStats()
      fetchOrders()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể từ chối hoàn hàng', 'error', 'Lỗi')
    }
  }

  // --- Shipper Management Actions ---
  const handleApproveShipper = async (shipperId, shipperName) => {
    const isConfirmed = await confirm({
      title: 'Phê duyệt Shipper',
      message: `Bạn có chắc chắn muốn duyệt đơn đăng ký Shipper của ${shipperName}?`,
      type: 'question'
    })
    if (!isConfirmed) return

    try {
      const response = await api.put(`/shipper/${shipperId}/approve`)
      showToastMsg(response.data.message || 'Đã duyệt Shipper thành công!', 'success', 'Thành công')
      fetchShippers()
      fetchUsers()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể duyệt Shipper', 'error', 'Lỗi')
    }
  }

  const handleRejectShipperClick = (shipper, suspend = false) => {
    setShipperToReject(shipper)
    setIsSuspendAction(suspend)
    setShipperRejectReason('')
    setShowShipperRejectModal(true)
  }

  const handleRejectShipperSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put(`/shipper/${shipperToReject._id}/reject`, {
        reason: shipperRejectReason,
        suspend: isSuspendAction
      })
      showToastMsg(response.data.message || 'Đã cập nhật trạng thái Shipper', 'success', 'Thành công')
      setShowShipperRejectModal(false)
      setShipperToReject(null)
      setShipperRejectReason('')
      fetchShippers()
      fetchUsers()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Lỗi xử lý', 'error', 'Lỗi')
    }
  }

  const handleAssignShipperClick = (order) => {
    setOrderToAssign(order)
    setSelectedShipperId('')
    setShowAssignShipperModal(true)
  }

  const handleAssignShipperSubmit = async (e) => {
    e.preventDefault()
    if (!selectedShipperId) {
      showToastMsg('Vui lòng chọn Shipper', 'warning', 'Cảnh báo')
      return
    }

    try {
      const response = await api.put(`/shipper/assign/${orderToAssign._id}`, {
        shipperId: selectedShipperId
      })
      showToastMsg(response.data.message || 'Đã gán Shipper cho đơn hàng thành công!', 'success', 'Thành công')
      setShowAssignShipperModal(false)
      setOrderToAssign(null)
      setSelectedShipperId('')
      fetchOrders()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể phân công Shipper', 'error', 'Lỗi')
    }
  }

  // --- Seller QR Actions ---
  const handleVerifyQR = async (qrId, sellerName) => {
    const isConfirmed = await confirm({
      title: 'Xác minh QR',
      message: `Xác nhận thông tin tài khoản và QR ngân hàng của ${sellerName} là chính xác?`,
      type: 'question'
    })
    if (!isConfirmed) return

    try {
      const response = await api.put(`/seller-bankqr/${qrId}/verify`)
      showToastMsg(response.data.message || 'Đã xác minh QR ngân hàng', 'success', 'Thành công')
      fetchSellerQRs()
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Không thể xác minh QR ngân hàng', 'error', 'Lỗi')
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Modern Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/20 mb-8">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Hệ thống quản trị</span>
            <h1 className="text-3xl sm:text-4xl font-black mt-1 text-white drop-shadow-sm leading-normal">BẢNG ĐIỀU KHIỂN</h1>
            <p className="text-orange-50/90 text-sm mt-1">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/admin/revenue" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-md font-medium text-sm">
              <span>📊</span> Thống kê doanh thu
            </Link>
            <Link to="/admin/payments" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-md font-medium text-sm">
              <span>💳</span> Quản lý thanh toán
            </Link>
            <Link to="/admin/payments" state={{ filter: 'need_payout' }} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-md font-medium text-sm">
              <span>💸</span> Trả tiền Seller
              {payments.filter(p => p.status === 'confirmed' && !p.sellerPaid).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                  {payments.filter(p => p.status === 'confirmed' && !p.sellerPaid).length}
                </span>
              )}
            </Link>
            {isSuperAdmin && (
              <Link to="/admin/bankqr" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-md font-medium text-sm">
                <span>🏦</span> QR Code
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-900/60 p-1.5 rounded-2xl mb-8 overflow-x-auto whitespace-nowrap gap-1">
        {[
          { id: 'overview', label: 'Tổng quan', icon: '📊' },
          { id: 'pending', label: 'Sản phẩm chờ duyệt', icon: '🕒', badge: products.length },
          { id: 'pending_payments', label: 'Giao dịch chờ duyệt', icon: '💳', badge: payments.filter(p => p.status === 'pending').length },
          { id: 'sold_products', label: 'Sản phẩm đã bán', icon: '🛍️', badge: orders.filter(o => ['confirmed', 'picked_up', 'completed'].includes(o.status)).length },
          { id: 'reports', label: 'Báo cáo vi phạm', icon: '🚨', badge: reportedProducts.length },
          { id: 'users', label: 'Người dùng', icon: '👥' },
          { id: 'coupons', label: 'Mã giảm giá', icon: '🎟️' },
          { id: 'returns', label: 'Yêu cầu hoàn hàng', icon: '🔄', badge: returnRequests.length },
          { id: 'shippers', label: 'Quản lý Shipper', icon: '🛵', badge: shippers.filter(s => s.shipperStatus === 'pending').length },
          { id: 'seller_qrs', label: 'Xác minh QR', icon: '🏦', badge: sellerQRs.filter(q => !q.isVerified).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'overview') fetchStats()
              if (tab.id === 'pending') fetchPendingProducts()
              if (tab.id === 'pending_payments') fetchPayments()
              if (tab.id === 'sold_products') fetchOrders()
              if (tab.id === 'reports') fetchReportedProducts()
              if (tab.id === 'users') fetchUsers()
              if (tab.id === 'coupons') fetchCoupons()
              if (tab.id === 'returns') fetchReturnRequests()
              if (tab.id === 'shippers') fetchShippers()
              if (tab.id === 'seller_qrs') fetchSellerQRs()
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-md border border-gray-200/10'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-850/40'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${tab.id === 'reports' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white'
                }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Doanh thu card */}
              {stats.payments && (
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-650 text-white rounded-3xl p-6 shadow-xl shadow-indigo-500/10">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">Tổng Doanh Thu</p>
                      <h3 className="text-3xl font-black mt-2">
                        {new Intl.NumberFormat('vi-VN').format(stats.payments.totalRevenue || 0)} ₫
                      </h3>
                    </div>
                    <span className="text-3xl bg-white/20 p-3 rounded-2xl">💰</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-indigo-100">
                    <div>
                      <p className="opacity-80">Chờ xác nhận</p>
                      <p className="text-lg font-bold mt-0.5">{stats.payments.pending || 0}</p>
                    </div>
                    <div>
                      <p className="opacity-80">Đã xác nhận</p>
                      <p className="text-lg font-bold mt-0.5">{stats.payments.confirmed || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Người dùng card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold uppercase tracking-wider">Thành viên</p>
                    <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{stats.users.total}</h3>
                  </div>
                  <span className="text-3xl bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">👥</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500">Đang hoạt động</p>
                    <p className="text-lg font-bold mt-0.5 text-green-600 dark:text-green-400">{stats.users.active}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500">Đã khóa</p>
                    <p className="text-lg font-bold mt-0.5 text-red-650 dark:text-red-400">{stats.users.inactive}</p>
                  </div>
                </div>
              </div>

              {/* Sản phẩm card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold uppercase tracking-wider">Tin đăng</p>
                    <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">
                      {stats.products.total}
                    </h3>
                  </div>
                  <span className="text-3xl bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl">📦</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                  <div>
                    <p className="text-gray-400 dark:text-gray-550">Đang bán</p>
                    <p className="text-base font-bold mt-0.5 text-green-600 dark:text-green-400">{stats.products.available}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-550">Chờ duyệt</p>
                    <p className="text-base font-bold mt-0.5 text-yellow-600 dark:text-yellow-400">{stats.products.pending}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-550">Đã bán</p>
                    <p className="text-base font-bold mt-0.5 text-gray-500 dark:text-gray-405">{stats.products.sold}</p>
                  </div>
                </div>
              </div>
            </div>

            {stats.categoryStats && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
                <h3 className="text-lg font-bold mb-4 text-gray-950 dark:text-white">Phân bố sản phẩm theo danh mục</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {stats.categoryStats.map((cat) => (
                    <div key={cat._id} className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                      <p className="text-2xl mb-1">
                        {cat._id === 'Sách' ? '📚' :
                          cat._id === 'Điện tử' ? '💻' :
                            cat._id === 'Nội thất' ? '🪑' :
                              cat._id === 'Quần áo' ? '👕' :
                                cat._id === 'Văn phòng phẩm' ? '✏️' :
                                  cat._id === 'Thể thao' ? '⚽' : '📦'}
                      </p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{cat._id}</p>
                      <p className="text-lg font-black mt-1 text-indigo-600 dark:text-indigo-400">{cat.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Sản phẩm chờ phê duyệt</h2>
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-750 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                {products.length} tin đăng chờ duyệt
              </span>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product._id} className="border border-gray-100 dark:border-gray-850 hover:border-indigo-100 dark:hover:border-indigo-900/30 rounded-2xl p-4 flex gap-4 transition-all duration-300 hover:shadow-lg bg-gray-50/50 dark:bg-gray-900/10">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 onClick={() => viewProduct(product)} className="font-bold hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 text-gray-900 dark:text-white">{product.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Người bán: <span className="font-semibold">{product.userId?.name}</span></p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">{product.price?.toLocaleString()} VNĐ</p>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => viewProduct(product)}
                          className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => approveProduct(product._id)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => rejectProduct(product._id)}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-750 transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Tuyệt vời! Không có sản phẩm nào chờ duyệt 🎉</p>
            )}
          </div>
        )}

        {activeTab === 'pending_payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Giao dịch / Đơn hàng chờ duyệt</h2>
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-750 dark:text-yellow-405 text-xs font-bold px-3 py-1 rounded-full">
                {payments.filter(p => p.status === 'pending').length} giao dịch chờ duyệt
              </span>
            </div>
            {payments.filter(p => p.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map((payment) => (
                  <div key={payment._id} className="border border-gray-100 dark:border-gray-850 hover:border-indigo-100 dark:hover:border-indigo-900/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/10">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-750 flex-shrink-0">
                        {payment.orderId?.productId?.images?.[0] ? (
                          <img
                            src={payment.orderId.productId.images[0]}
                            alt={payment.orderId.productId.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg bg-indigo-50 text-indigo-500">📦</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{payment.orderId?.productId?.title || 'Sản phẩm đã gỡ'}</h3>
                        <p className="text-xs text-gray-550 mt-0.5">
                          Người mua: <span className="font-semibold text-gray-850 dark:text-white">{payment.buyerName}</span> ({payment.buyerPhone})
                        </p>
                        <p className="text-xs text-gray-555 mt-0.5">
                          Mã GD: <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{payment.transactionCode}</span>
                        </p>
                        <div className="flex gap-2 mt-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${payment.sellerApproved
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50'
                              : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200/50'
                            }`}>
                            Người bán: {payment.sellerApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${payment.adminApproved
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50'
                              : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200/50'
                            }`}>
                            Admin: {payment.adminApproved ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-medium">Số tiền</span>
                        <span className="text-lg font-black text-red-650 dark:text-red-400">
                          {new Intl.NumberFormat('vi-VN').format(payment.amount || 0)} ₫
                        </span>
                      </div>
                      <Link
                        to="/admin/payments"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        Đến trang duyệt 💳
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-555 text-center py-8">Tuyệt vời! Không có giao dịch nào đang chờ duyệt 🎉</p>
            )}
          </div>
        )}

        {activeTab === 'sold_products' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white">Sản phẩm đã bán</h2>
                <p className="text-xs text-gray-450 dark:text-gray-400 mt-1 font-medium">Quản lý và đối soát biên lai chuyển khoản đơn hàng</p>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Tìm theo sản phẩm, mã GD, người mua..."
                    value={soldProductsSearch}
                    onChange={(e) => setSoldProductsSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white text-sm"
                  />
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-550 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={soldProductsFilter}
                  onChange={(e) => setSoldProductsFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white cursor-pointer font-bold text-gray-700 dark:text-gray-200"
                >
                  <option value="all">Tất cả sản phẩm đã bán ({orders.filter(o => ['confirmed', 'picked_up', 'completed'].includes(o.status)).length})</option>
                  <option value="confirmed">Đã xác nhận ({orders.filter(o => o.status === 'confirmed').length})</option>
                  <option value="picked_up">Đang giao hàng ({orders.filter(o => o.status === 'picked_up').length})</option>
                  <option value="completed">Đã hoàn thành ({orders.filter(o => o.status === 'completed').length})</option>
                  <option value="return_requested">Yêu cầu trả hàng ({orders.filter(o => o.status === 'return_requested').length})</option>
                  <option value="returned">Đã trả hàng ({orders.filter(o => o.status === 'returned').length})</option>
                  <option value="cancelled">Đã hủy ({orders.filter(o => o.status === 'cancelled').length})</option>
                </select>
              </div>
            </div>

            {/* List of Sold Products */}
            {orders.filter(order => {
              const orderStatus = order.status;
              if (soldProductsFilter === 'all') {
                if (!['confirmed', 'picked_up', 'completed'].includes(orderStatus)) return false;
              } else {
                if (orderStatus !== soldProductsFilter) return false;
              }

              if (soldProductsSearch.trim() !== '') {
                const q = soldProductsSearch.toLowerCase();
                const productTitle = order.productId?.title?.toLowerCase() || '';
                const buyerName = order.buyerId?.name?.toLowerCase() || '';
                const buyerPhone = order.buyerId?.phone?.toLowerCase() || '';
                const sellerName = order.sellerId?.name?.toLowerCase() || '';
                const sellerPhone = order.sellerId?.phone?.toLowerCase() || '';
                const transactionCode = order.payment?.transactionCode?.toLowerCase() || '';

                const matchProduct = productTitle.includes(q);
                const matchBuyer = buyerName.includes(q) || buyerPhone.includes(q);
                const matchSeller = sellerName.includes(q) || sellerPhone.includes(q);
                const matchTx = transactionCode.includes(q);

                return matchProduct || matchBuyer || matchSeller || matchTx;
              }
              return true;
            }).length > 0 ? (
              <div className="space-y-4">
                {orders.filter(order => {
                  const orderStatus = order.status;
                  if (soldProductsFilter === 'all') {
                    if (!['confirmed', 'picked_up', 'completed'].includes(orderStatus)) return false;
                  } else {
                    if (orderStatus !== soldProductsFilter) return false;
                  }

                  if (soldProductsSearch.trim() !== '') {
                    const q = soldProductsSearch.toLowerCase();
                    const productTitle = order.productId?.title?.toLowerCase() || '';
                    const buyerName = order.buyerId?.name?.toLowerCase() || '';
                    const buyerPhone = order.buyerId?.phone?.toLowerCase() || '';
                    const sellerName = order.sellerId?.name?.toLowerCase() || '';
                    const sellerPhone = order.sellerId?.phone?.toLowerCase() || '';
                    const transactionCode = order.payment?.transactionCode?.toLowerCase() || '';

                    const matchProduct = productTitle.includes(q);
                    const matchBuyer = buyerName.includes(q) || buyerPhone.includes(q);
                    const matchSeller = sellerName.includes(q) || sellerPhone.includes(q);
                    const matchTx = transactionCode.includes(q);

                    return matchProduct || matchBuyer || matchSeller || matchTx;
                  }
                  return true;
                }).map((order) => {
                  const payment = order.payment;
                  const paymentProof = payment?.paymentProof;

                  return (
                    <div key={order._id} className="border border-gray-150 dark:border-gray-750 hover:border-indigo-100 dark:hover:border-indigo-900/30 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/30 dark:bg-gray-900/10 transition-all duration-300">
                      
                      {/* Left: Product Details */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-750 bg-gray-100 flex-shrink-0">
                          {order.productId?.images?.[0] ? (
                            <img
                              src={order.productId.images[0]}
                              alt={order.productId.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-indigo-50 text-indigo-550">📦</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-base">
                            {order.productId?.title || 'Sản phẩm đã gỡ'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                            <span>Phân loại: <strong>{order.productId?.category || 'Khác'}</strong></span>
                            <span>•</span>
                            <span>Ngày mua: <strong>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                          </div>
                          <div className="text-sm font-black text-red-650 dark:text-red-400 mt-1">
                            {new Intl.NumberFormat('vi-VN').format(order.finalPrice || 0)} ₫
                            {order.discountAmount > 0 && (
                              <span className="text-[10px] text-gray-400 line-through ml-2 font-normal">
                                {new Intl.NumberFormat('vi-VN').format(order.finalPrice + order.discountAmount)} ₫
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Partner Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-100 dark:border-gray-800 px-0 lg:px-6 py-4 lg:py-0">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Người bán</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.sellerId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.sellerId?.phone || 'Chưa cung cấp SĐT'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wide">Người mua</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.shippingAddress?.fullName || order.buyerId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-505">{order.shippingAddress?.phone || order.buyerId?.phone || 'Chưa cung cấp SĐT'}</p>
                        </div>
                      </div>

                      {/* Right: Payment & Status details */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 w-full lg:w-48 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 dark:border-gray-800">
                        <div className="space-y-1.5 lg:text-right">
                          {payment?.transactionCode ? (
                            <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded">
                              {payment.transactionCode}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-450 italic">Không có mã GD</span>
                          )}
                          
                          <div className="flex lg:justify-end items-center gap-1.5 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              order.status === 'picked_up' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              order.status === 'return_requested' ? 'bg-orange-105 text-orange-850 dark:bg-orange-900/30 dark:text-orange-400' :
                              order.status === 'returned' ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {order.status === 'completed' ? 'Thành công' :
                               order.status === 'picked_up' ? 'Đang giao' :
                               order.status === 'confirmed' ? 'Đã duyệt' :
                               order.status === 'return_requested' ? 'Yêu cầu hoàn' :
                               order.status === 'returned' ? 'Đã trả hàng' : 'Đã hủy'}
                            </span>
                          </div>
                        </div>

                        {/* Thumbnail or Payment Proof preview */}
                        <div className="flex-shrink-0">
                          {paymentProof ? (
                            <div className="flex flex-col items-center">
                              <div className="relative group w-14 h-20 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-0.5 shadow-sm hover:shadow-md transition-shadow">
                                <img
                                  src={paymentProof}
                                  alt="Receipt proof"
                                  className="h-full w-full object-contain rounded"
                                />
                                <div
                                  onClick={() => {
                                    setSelectedReceipt(order);
                                    setReceiptZoom(1);
                                    setShowReceiptModal(true);
                                  }}
                                  className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer text-center px-1"
                                >
                                  Xem biên lai
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedReceipt(order);
                                  setReceiptZoom(1);
                                  setShowReceiptModal(true);
                                }}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 cursor-pointer bg-transparent border-0"
                              >
                                📷 Xem ảnh
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Không có biên lai</span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-750 rounded-3xl bg-gray-50/30 dark:bg-gray-900/10">
                <span className="text-4xl block mb-2">🔍</span>
                Không tìm thấy sản phẩm đã bán nào phù hợp.
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-red-650 dark:text-red-400 flex items-center gap-2">
                <span>🚨</span> Tin đăng bị báo cáo vi phạm
              </h2>
              <span className="bg-red-100 dark:bg-red-900/30 text-red-750 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                {reportedProducts.length} sản phẩm
              </span>
            </div>
            {reportedProducts.length > 0 ? (
              <div className="space-y-4">
                {reportedProducts.map((product) => (
                  <div key={product._id} className="border border-red-100 dark:border-red-950 rounded-2xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-red-50/5 dark:bg-red-950/5">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            onClick={() => viewProduct(product)}
                            className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
                            Người bán: <span className="font-semibold">{product.userId?.name || 'Không rõ'}</span> ({product.userId?.email || 'N/A'})
                          </p>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                            {product.price?.toLocaleString()} VNĐ
                          </p>
                        </div>
                        <span className="bg-red-150 dark:bg-red-900/40 text-red-750 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                          Bị báo cáo {product.reports?.length || 0} lần
                        </span>
                      </div>

                      {/* Reports list */}
                      <div className="mt-3 pl-3 border-l-2 border-red-300 dark:border-red-800 space-y-1.5 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-r-lg">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Danh sách lý do:</p>
                        {product.reports?.map((report, idx) => (
                          <div key={idx} className="text-xs text-gray-750 dark:text-gray-300 flex flex-wrap gap-x-2">
                            <span className="font-semibold text-red-600 dark:text-red-400">• {report.reason}</span>
                            {report.description && (
                              <span className="text-gray-550 dark:text-gray-400 italic">("{report.description}")</span>
                            )}
                            <span className="text-gray-400 dark:text-gray-550">
                              - {new Date(report.reportedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 self-end md:self-center">
                      <button
                        onClick={() => viewProduct(product)}
                        className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                      >
                        Xem
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn bỏ qua tất cả báo cáo cho sản phẩm này?')) {
                            try {
                              const response = await api.put(`/admin/products/${product._id}/dismiss-reports`)
                              alert(response.data.message || 'Đã bỏ qua báo cáo')
                              fetchReportedProducts()
                            } catch (error) {
                              alert('Không thể bỏ qua báo cáo')
                            }
                          }
                        }}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-lg text-sm font-bold hover:bg-gray-250 dark:hover:bg-gray-750 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                      >
                        Bỏ qua
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc chắn muốn gỡ sản phẩm này khỏi sàn giao dịch vì vi phạm?')) {
                            try {
                              await api.put(`/admin/products/${product._id}/reject`)
                              alert('Đã gỡ sản phẩm thành công!')
                              fetchReportedProducts()
                              fetchStats()
                            } catch (error) {
                              alert('Không thể từ chối sản phẩm')
                            }
                          }
                        }}
                        className="bg-red-600 text-white px-3.5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Gỡ sản phẩm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                Không có báo cáo vi phạm nào chưa xử lý 🎉
              </p>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Quản lý người dùng</h2>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={searchQuery}
                  onChange={handleSearchUsers}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-550 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Người dùng</th>
                      <th className="pb-3">Vai trò / Trạng thái</th>
                      <th className="pb-3 text-right pr-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => viewUser(u)}>
                            <img
                              src={u.avatar || 'https://via.placeholder.com/40'}
                              alt={u.name}
                              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                            />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400">{u.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {u.isSuperAdmin && (
                              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded text-[11px] font-bold">
                                Admin Tổng
                              </span>
                            )}
                            {u.isAdmin && !u.isSuperAdmin && (
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[11px] font-bold">
                                Admin
                              </span>
                            )}
                            {!u.isActive ? (
                              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded text-[11px] font-bold">
                                Đã khóa
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-[11px] font-bold">
                                Kích hoạt
                              </span>
                            )}
                            {u.isShipper && (
                              <span className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 px-2 py-0.5 rounded text-[11px] font-bold">
                                Shipper
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            {isSuperAdmin && (
                              <>
                                {!u.isAdmin ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePromoteAdmin(u)
                                    }}
                                    className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                                    title="Bổ nhiệm Admin"
                                  >
                                    + Admin
                                  </button>
                                ) : !u.isSuperAdmin ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveAdmin(u)
                                    }}
                                    className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                                    title="Xóa quyền Admin"
                                  >
                                    - Admin
                                  </button>
                                ) : null}
                              </>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleShipperRole(u)
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${u.isShipper
                                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100'
                                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                                }`}
                              title={u.isShipper ? "Thu hồi quyền Shipper" : "Cấp quyền Shipper"}
                            >
                              {u.isShipper ? '- Shipper' : '+ Shipper'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleActive(u)
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${u.isActive
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100'
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                                }`}
                            >
                              {u.isActive ? 'Khóa' : 'Mở'}
                            </button>
                            {(!u.isAdmin || isSuperAdmin) && !u.isSuperAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteUser(u)
                                }}
                                className="bg-red-50 dark:bg-red-900/20 text-red-650 dark:text-red-400 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                                title="Xóa tài khoản"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {searchQuery ? 'Không tìm thấy người dùng nào 🔍' : 'Không có người dùng'}
              </p>
            )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">Quản lý mã giảm giá</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={couponFilter}
                  onChange={(e) => setCouponFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Đã hết hạn</option>
                  <option value="used">Đã sử dụng</option>
                </select>
                <button
                  onClick={() => {
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
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md flex-1 sm:flex-none text-center"
                >
                  + Tạo mới
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.length > 0 ? (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) <= new Date()
                  const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit
                  const isActive = coupon.isActive && !isExpired && !isUsedUp

                  return (
                    <div key={coupon._id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col justify-between bg-gray-50/20 dark:bg-gray-900/10">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-xl tracking-wide text-indigo-600 dark:text-indigo-400">{coupon.code}</span>
                            <span className={`ml-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive
                                ? 'bg-green-100 text-green-850 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-150 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                              {isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditCoupon(coupon)}
                              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-650 dark:text-indigo-400 p-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => handleToggleCouponActive(coupon)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${coupon.isActive
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100'
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                                }`}
                              title={coupon.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            >
                              {coupon.isActive ? '🔒 Khóa' : '🔓 Mở'}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="bg-red-50 dark:bg-red-900/20 text-red-650 dark:text-red-400 p-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 font-medium">{coupon.description || 'Không có mô tả'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-500">
                        <div>
                          <span className="font-semibold text-gray-450">Giảm giá:</span>{' '}
                          <span className="font-bold text-gray-800 dark:text-white">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `${coupon.discountValue.toLocaleString('vi-VN')} VNĐ`}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-450">Min đơn:</span>{' '}
                          <span className="font-bold text-gray-800 dark:text-white">
                            {coupon.minPurchase ? `${coupon.minPurchase.toLocaleString('vi-VN')} VNĐ` : 'Không'}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-450">Hết hạn:</span>{' '}
                          <span className="font-bold text-gray-800 dark:text-white">
                            {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-450">Đã dùng:</span>{' '}
                          <span className="font-bold text-gray-800 dark:text-white">
                            {coupon.usedCount}/{coupon.usageLimit || '∞'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full py-8 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  Chưa có mã giảm giá nào
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span>🔄</span> Yêu cầu hoàn hàng
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-750 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                {returnRequests.length} yêu cầu cần xử lý
              </span>
            </div>
            {returnRequests.length > 0 ? (
              <div className="space-y-4">
                {returnRequests.map((order) => (
                  <div key={order._id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row md:justify-between gap-5 bg-gray-50/50 dark:bg-gray-900/20 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex gap-4 flex-1">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        <img
                          src={order.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={order.productId?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">{order.productId?.title || 'Sản phẩm đã xóa'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <p>Người mua: <span className="font-semibold text-gray-800 dark:text-gray-250">{order.buyerId?.name}</span> ({order.buyerId?.phone})</p>
                          <p>Người bán: <span className="font-semibold text-gray-800 dark:text-gray-250">{order.sellerId?.name}</span></p>
                          <p className="sm:col-span-2 mt-1">
                            Giá trị đơn: <span className="font-bold text-green-600 dark:text-green-400 text-sm">{order.finalPrice?.toLocaleString()} VNĐ</span>
                          </p>
                        </div>
                        <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-xl">
                          <p className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wider mb-1">Lý do hoàn hàng:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{order.returnReason}"</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-550 mt-2">
                            Yêu cầu lúc: {new Date(order.returnRequestedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-end gap-2.5 self-end md:self-center">
                      <button
                        onClick={() => handleApproveReturn(order._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-500/10 cursor-pointer text-center flex-1 md:flex-none"
                      >
                        ✓ Duyệt hoàn
                      </button>
                      <button
                        onClick={() => handleRejectReturnClick(order._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/10 cursor-pointer text-center flex-1 md:flex-none"
                      >
                        ✗ Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-750 rounded-3xl bg-gray-50/30 dark:bg-gray-900/10">
                <span className="text-4xl block mb-2">🎉</span>
                Không có yêu cầu hoàn hàng nào cần xử lý.
              </div>
            )}
          </div>
        )}

        {activeTab === 'shippers' && (
          <div className="space-y-8">
            {/* Section 1: Shipper Application Requests */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>🛵</span> Đơn đăng ký làm Shipper
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-750 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                  {shippers.filter(s => s.shipperStatus === 'pending').length} đơn đang chờ
                </span>
              </div>
              {shippers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Thành viên</th>
                        <th className="pb-3">Thông tin chi tiết</th>
                        <th className="pb-3">Trạng thái</th>
                        <th className="pb-3 text-right pr-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                      {shippers.map((shipper) => (
                        <tr key={shipper._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={shipper.avatar || 'https://via.placeholder.com/40'}
                                alt={shipper.name}
                                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                              />
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{shipper.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{shipper.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">SĐT: {shipper.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 max-w-xs">
                            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                              <p><strong>CMND/CCCD:</strong> {shipper.shipperInfo?.idCard}</p>
                              <p>
                                <strong>Phương tiện:</strong>{' '}
                                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-medium">
                                  {shipper.shipperInfo?.vehicleType === 'motorbike' ? 'Xe máy' :
                                    shipper.shipperInfo?.vehicleType === 'bicycle' ? 'Xe đạp' :
                                      shipper.shipperInfo?.vehicleType === 'walking' ? 'Đi bộ' :
                                        shipper.shipperInfo?.vehicleType === 'car' ? 'Ô tô' : shipper.shipperInfo?.vehicleType}
                                </span>
                              </p>
                              <p><strong>Khu vực:</strong> {shipper.shipperInfo?.operatingArea}</p>
                              {shipper.shipperInfo?.bio && (
                                <p className="italic text-gray-550 line-clamp-1">"{shipper.shipperInfo.bio}"</p>
                              )}
                              {shipper.shipperInfo?.bankAccount && shipper.shipperInfo.bankAccount.bankName && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800/50">
                                  <p className="text-[10px] text-green-700 dark:text-green-400 font-bold mb-0.5 flex items-center gap-1">
                                    <span>💳</span> TK Nhận Lương:
                                  </p>
                                  <p className="text-[10px] text-gray-700 dark:text-gray-300 font-medium">
                                    {shipper.shipperInfo.bankAccount.bankName} - {shipper.shipperInfo.bankAccount.accountNumber}
                                  </p>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase">
                                    {shipper.shipperInfo.bankAccount.accountHolder}
                                  </p>
                                  {shipper.shipperInfo.bankAccount.qrCodeImage && (
                                    <button
                                      onClick={() => window.open(shipper.shipperInfo.bankAccount.qrCodeImage, '_blank')}
                                      className="text-[10px] mt-1 bg-green-600 text-white px-2 py-0.5 rounded font-bold hover:bg-green-700 transition-colors"
                                    >
                                      Xem mã QR
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${shipper.shipperStatus === 'approved' ? 'bg-green-100 text-green-805 dark:bg-green-900/30 dark:text-green-400' :
                                shipper.shipperStatus === 'pending' ? 'bg-yellow-100 text-yellow-850 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  shipper.shipperStatus === 'suspended' ? 'bg-orange-100 text-orange-850 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                              {shipper.shipperStatus === 'approved' ? 'Đã duyệt' :
                                shipper.shipperStatus === 'pending' ? 'Chờ duyệt' :
                                  shipper.shipperStatus === 'suspended' ? 'Bị đình chỉ' : 'Bị từ chối'}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <div className="flex items-center justify-end gap-2">
                              {shipper.shipperStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveShipper(shipper._id, shipper.name)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectShipperClick(shipper, false)}
                                    className="bg-red-650 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-750 transition-colors cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {shipper.shipperStatus === 'approved' && (
                                <button
                                  onClick={() => handleRejectShipperClick(shipper, true)}
                                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                                >
                                  Đình chỉ
                                </button>
                              )}
                              {(shipper.shipperStatus === 'rejected' || shipper.shipperStatus === 'suspended') && (
                                <button
                                  onClick={() => handleApproveShipper(shipper._id, shipper.name)}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                                >
                                  Kích hoạt lại
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có người dùng nào đăng ký làm shipper.</p>
              )}
            </div>

            {/* Section 2: Order Shipping Assignment */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <span>📦</span> Đơn giao hàng (Phân công Shipper)
                </h2>
                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-750 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                  {orders.filter(o => o.deliveryMethod === 'delivery' && o.status === 'confirmed').length} đơn giao hàng
                </span>
              </div>

              {orders.filter(o => o.deliveryMethod === 'delivery').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Sản phẩm</th>
                        <th className="pb-3">Khách hàng / Địa chỉ</th>
                        <th className="pb-3">Trạng thái đơn</th>
                        <th className="pb-3">Shipper phụ trách</th>
                        <th className="pb-3 text-right pr-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                      {orders
                        .filter(o => o.deliveryMethod === 'delivery')
                        .map((order) => {
                          const isAssigned = !!order.shipperId
                          return (
                            <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                              <td className="py-4 pl-2">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={order.productId?.images?.[0] || 'https://via.placeholder.com/40'}
                                    alt={order.productId?.title}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{order.productId?.title || 'Sản phẩm đã gỡ'}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold">{order.finalPrice?.toLocaleString()} VNĐ</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="text-xs text-gray-700 dark:text-gray-300">
                                  <p><strong>Người nhận:</strong> {order.shippingAddress?.fullName || order.buyerId?.name}</p>
                                  <p><strong>SĐT:</strong> {order.shippingAddress?.phone || order.buyerId?.phone}</p>
                                  <p className="line-clamp-1"><strong>ĐC:</strong> {order.shippingAddress?.address}</p>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    order.status === 'picked_up' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-850 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          order.status === 'return_requested' ? 'bg-orange-100 text-orange-850 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                  {order.status === 'completed' ? 'Thành công' :
                                    order.status === 'picked_up' ? 'Đang giao hàng' :
                                      order.status === 'confirmed' ? 'Đã xác nhận' :
                                        order.status === 'pending' ? 'Chờ thanh toán' :
                                          order.status === 'return_requested' ? 'Yêu cầu hoàn' : 'Đã hủy'}
                                </span>
                              </td>
                              <td className="py-4">
                                {isAssigned ? (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={order.shipperId.avatar || 'https://via.placeholder.com/30'}
                                      alt={order.shipperId.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <div className="text-xs">
                                      <p className="font-bold text-gray-900 dark:text-white">{order.shipperId.name}</p>
                                      <p className="text-gray-550 dark:text-gray-400">{order.shipperId.phone}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-red-500 italic font-semibold">Chưa gán Shipper</span>
                                )}
                              </td>
                              <td className="py-4 text-right pr-2">
                                {!isAssigned && order.status === 'confirmed' ? (
                                  <button
                                    onClick={() => handleAssignShipperClick(order)}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                                  >
                                    Giao việc
                                  </button>
                                ) : !isAssigned ? (
                                  <span className="text-xs text-gray-450 italic">Không khả dụng</span>
                                ) : (
                                  <button
                                    onClick={() => handleAssignShipperClick(order)}
                                    className="bg-gray-105 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                                  >
                                    Đổi Shipper
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào đăng ký vận chuyển (delivery).</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seller_qrs' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-150 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span>🏦</span> Xác minh QR người bán
              </h2>
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-750 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                {sellerQRs.filter(q => !q.isVerified).length} QR chờ xác minh
              </span>
            </div>
            {sellerQRs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerQRs.map((qr) => (
                  <div key={qr._id} className="border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between bg-gray-50/30 dark:bg-gray-900/20 hover:shadow-lg transition-all duration-300">
                    <div>
                      {/* Seller Profile Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                        <img
                          src={qr.sellerId?.avatar || 'https://via.placeholder.com/40'}
                          alt={qr.sellerId?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{qr.sellerId?.name || 'Người bán đã xóa'}</h4>
                          <p className="text-[10px] text-gray-500">{qr.sellerId?.email}</p>
                          <p className="text-[10px] text-gray-500">SĐT: {qr.sellerId?.phone}</p>
                        </div>
                      </div>

                      {/* Bank account details */}
                      <div className="space-y-1.5 text-xs mb-4">
                        <p className="text-gray-655 dark:text-gray-400">Ngân hàng: <span className="font-bold text-gray-900 dark:text-white">{qr.bankName}</span></p>
                        <p className="text-gray-655 dark:text-gray-400">Số tài khoản: <span className="font-bold text-gray-900 dark:text-white tracking-wider">{qr.accountNumber}</span></p>
                        <p className="text-gray-655 dark:text-gray-400">Chủ tài khoản: <span className="font-bold text-gray-900 dark:text-white uppercase">{qr.accountHolder}</span></p>
                      </div>

                      {/* QR Thumbnail */}
                      <div className="relative group max-w-[150px] mx-auto mb-4 border dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={qr.qrCodeImage}
                          alt="QR Code"
                          className="w-full object-contain aspect-square cursor-pointer"
                          onClick={() => {
                            setSelectedQR(qr)
                            setShowQRModal(true)
                          }}
                        />
                        <div
                          onClick={() => {
                            setSelectedQR(qr)
                            setShowQRModal(true)
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer"
                        >
                          🔍 Xem chi tiết
                        </div>
                      </div>
                    </div>

                    {/* Verification Status & Button */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${qr.isVerified
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {qr.isVerified ? '✓ Đã xác minh' : '🕒 Chờ duyệt'}
                      </span>

                      {!qr.isVerified && (
                        <button
                          onClick={() => handleVerifyQR(qr._id, qr.sellerId?.name)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Xác minh
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có người bán nào đăng ký QR ngân hàng.</p>
            )}
          </div>
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
                className={`px-4 py-2 rounded-lg ${selectedUser.isActive
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
              <h3 className="text-xl font-bold">{selectedCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
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
                  <label className="block text-sm font-medium mb-1">Mã giảm giá *</label>
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
                  <label className="block text-sm font-medium mb-1">Loại giảm giá *</label>
                  <select
                    required
                    value={couponFormData.discountType}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giá trị giảm giá *</label>
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
                  <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu (VNĐ)</label>
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
                  <label className="block text-sm font-medium mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={couponFormData.maxDiscount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Không giới hạn"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày hết hạn *</label>
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
                  <label className="block text-sm font-medium mb-1">Giới hạn sử dụng</label>
                  <input
                    type="number"
                    min="1"
                    value={couponFormData.usageLimit}
                    onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Mô tả mã giảm giá..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Danh mục áp dụng</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other'].map(cat => {
                    const catLabels = {
                      'Books': 'Sách',
                      'Electronics': 'Điện tử',
                      'Furniture': 'Nội thất',
                      'Clothing': 'Quần áo',
                      'Stationery': 'Văn phòng phẩm',
                      'Sports': 'Thể thao',
                      'Other': 'Khác'
                    };
                    return (
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
                        <span className="text-sm">{catLabels[cat] || cat}</span>
                      </label>
                    );
                  })}
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
                    <span>Kích hoạt mã giảm giá</span>
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
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {selectedCoupon ? 'Cập nhật' : 'Tạo mã'}
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
              <h3 className="text-xl font-bold">Quản lý mã giảm giá</h3>
              <div className="flex space-x-2">
                <select
                  value={couponFilter}
                  onChange={(e) => setCouponFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Đã hết hạn</option>
                  <option value="used">Đã sử dụng</option>
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
                  + Tạo mới
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
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Hoạt động</span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Không hoạt động</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{coupon.description || 'Không có mô tả'}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">Loại:</span>{' '}
                              {coupon.discountType === 'percentage'
                                ? `${coupon.discountValue}%`
                                : `${coupon.discountValue.toLocaleString('vi-VN')} VNĐ`}
                            </div>
                            <div>
                              <span className="font-semibold">Đơn tối thiểu:</span>{' '}
                              {coupon.minPurchase ? `${coupon.minPurchase.toLocaleString('vi-VN')} VNĐ` : 'Không'}
                            </div>
                            <div>
                              <span className="font-semibold">Hết hạn:</span>{' '}
                              {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                            </div>
                            <div>
                              <span className="font-semibold">Sử dụng:</span>{' '}
                              {coupon.usedCount}/{coupon.usageLimit || '∞'}
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
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleCouponActive(coupon)}
                            className={`px-3 py-1 rounded text-sm ${coupon.isActive
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            {coupon.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có mã giảm giá nào</p>
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

      {/* Return Rejection Modal */}
      {showReturnRejectModal && returnToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-955 dark:text-white mb-4">Từ chối yêu cầu hoàn hàng</h3>
            <form onSubmit={handleRejectReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lý do từ chối hoàn hàng *
                </label>
                <textarea
                  required
                  rows="4"
                  value={returnRejectionReason}
                  onChange={(e) => setReturnRejectionReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết để thông báo cho người mua..."
                  className="w-full px-3.5 py-2.5 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnRejectModal(false)
                    setReturnToReject(null)
                    setReturnRejectionReason('')
                  }}
                  className="bg-gray-250 dark:bg-gray-750 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/10"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipper Rejection/Suspension Modal */}
      {showShipperRejectModal && shipperToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-955 dark:text-white mb-4">
              {isSuspendAction ? 'Đình chỉ tài khoản Shipper' : 'Từ chối đơn đăng ký Shipper'}
            </h3>
            <form onSubmit={handleRejectShipperSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lý do {isSuspendAction ? 'đình chỉ' : 'từ chối'} *
                </label>
                <textarea
                  required
                  rows="4"
                  value={shipperRejectReason}
                  onChange={(e) => setShipperRejectReason(e.target.value)}
                  placeholder={`Nhập lý do để thông báo cho ${shipperToReject.name}...`}
                  className="w-full px-3.5 py-2.5 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowShipperRejectModal(false)
                    setShipperToReject(null)
                    setShipperRejectReason('')
                  }}
                  className="bg-gray-250 dark:bg-gray-750 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`${isSuspendAction ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-650 hover:bg-red-700'} text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md`}
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Shipper Modal */}
      {showAssignShipperModal && orderToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-955 dark:text-white">Phân công Shipper</h3>
              <button
                onClick={() => {
                  setShowAssignShipperModal(false)
                  setOrderToAssign(null)
                  setSelectedShipperId('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignShipperSubmit} className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Đơn hàng cần giao:</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{orderToAssign.productId?.title}</p>
                <p className="text-xs text-gray-550 mt-1">
                  Địa chỉ nhận: {orderToAssign.shippingAddress?.fullName} - {orderToAssign.shippingAddress?.phone}
                </p>
                <p className="text-xs text-gray-450 italic mt-0.5">{orderToAssign.shippingAddress?.address}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Chọn Shipper *
                </label>
                <select
                  required
                  value={selectedShipperId}
                  onChange={(e) => setSelectedShipperId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="">-- Chọn Shipper đã phê duyệt --</option>
                  {shippers
                    .filter(s => s.isShipper && s.shipperStatus === 'approved')
                    .map(shipper => (
                      <option key={shipper._id} value={shipper._id}>
                        {shipper.name} ({shipper.shipperInfo?.operatingArea || 'Không rõ khu vực'}) - {shipper.phone}
                      </option>
                    ))}
                </select>
                {shippers.filter(s => s.isShipper && s.shipperStatus === 'approved').length === 0 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Chưa có Shipper nào được phê duyệt hoạt động.</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignShipperModal(false)
                    setOrderToAssign(null)
                    setSelectedShipperId('')
                  }}
                  className="bg-gray-250 dark:bg-gray-750 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!selectedShipperId}
                  className="bg-indigo-650 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/10"
                >
                  Xác nhận phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller QR Code View Detail Modal */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-750 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-955 dark:text-white">Chi tiết tài khoản ngân hàng</h3>
              <button
                onClick={() => {
                  setShowQRModal(false)
                  setSelectedQR(null)
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="w-full text-center space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl text-sm space-y-1.5 text-left border dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400">Chủ tài khoản: <span className="font-bold text-gray-900 dark:text-white uppercase">{selectedQR.accountHolder}</span></p>
                <p className="text-gray-600 dark:text-gray-400">Ngân hàng: <span className="font-bold text-gray-900 dark:text-white">{selectedQR.bankName}</span></p>
                <p className="text-gray-600 dark:text-gray-400">Số tài khoản: <span className="font-bold text-gray-955 dark:text-white tracking-wider">{selectedQR.accountNumber}</span></p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Liên hệ SĐT: {selectedQR.sellerId?.phone || 'N/A'}</p>
              </div>

              <div className="max-w-[280px] mx-auto border dark:border-gray-700 rounded-2xl overflow-hidden shadow-inner bg-white p-2">
                <img
                  src={selectedQR.qrCodeImage}
                  alt="QR Code"
                  className="w-full object-contain aspect-square"
                />
              </div>

              <div className="flex justify-center gap-2 pt-2">
                {!selectedQR.isVerified && (
                  <button
                    onClick={() => {
                      handleVerifyQR(selectedQR._id, selectedQR.sellerId?.name)
                      setShowQRModal(false)
                      setSelectedQR(null)
                    }}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-500/10 cursor-pointer"
                  >
                    Xác minh ngay
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowQRModal(false)
                    setSelectedQR(null)
                  }}
                  className="bg-gray-250 dark:bg-gray-755 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full shadow-2xl border border-gray-150 dark:border-gray-700/50 overflow-hidden flex flex-col my-8 max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết biên lai chuyển tiền</h3>
                <p className="text-xs text-gray-450 dark:text-gray-400 mt-0.5 font-medium">Đối chiếu thông tin chuyển khoản từ người mua</p>
              </div>
              <button
                onClick={() => {
                  setShowReceiptModal(false)
                  setSelectedReceipt(null)
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Transaction Info Summary Card */}
              <div className="bg-gray-55/50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <p className="text-gray-400 font-medium">Sản phẩm:</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-right line-clamp-1">{selectedReceipt.productId?.title || 'Sản phẩm đã gỡ'}</p>

                  <p className="text-gray-400 font-medium">Mã giao dịch:</p>
                  <p className="font-mono font-bold text-indigo-650 dark:text-indigo-400 text-right">{selectedReceipt.payment?.transactionCode || 'N/A'}</p>

                  <p className="text-gray-400 font-medium">Số tiền đơn hàng:</p>
                  <p className="font-black text-red-650 dark:text-red-400 text-right text-sm">{new Intl.NumberFormat('vi-VN').format(selectedReceipt.finalPrice || 0)} ₫</p>

                  <p className="text-gray-400 font-medium">Người mua:</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedReceipt.shippingAddress?.fullName || selectedReceipt.buyerId?.name || 'N/A'}</p>

                  <p className="text-gray-400 font-medium">SĐT Người mua:</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedReceipt.shippingAddress?.phone || selectedReceipt.buyerId?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReceiptZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                >
                  🔍- Thu nhỏ
                </button>
                <span className="text-xs font-bold text-gray-500 w-12 text-center">{Math.round(receiptZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setReceiptZoom(prev => Math.min(prev + 0.25, 3))}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                >
                  🔍+ Phóng to
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptZoom(1)}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                >
                  Đặt lại
                </button>
              </div>

              {/* Receipt Image Container */}
              <div className="border dark:border-gray-700 rounded-2xl overflow-hidden bg-gray-900 max-h-[450px] flex items-center justify-center p-4 relative">
                <div 
                  className="w-full h-[380px] overflow-auto flex items-center justify-center scrollbar-thin"
                >
                  <img
                    src={selectedReceipt.payment?.paymentProof}
                    alt="Receipt Image"
                    className="max-h-full max-w-full object-contain transition-transform duration-200 rounded-lg"
                    style={{ transform: `scale(${receiptZoom})` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReceiptModal(false)
                  setSelectedReceipt(null)
                }}
                className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-500/10 border-0"
              >
                Đóng biên lai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
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

