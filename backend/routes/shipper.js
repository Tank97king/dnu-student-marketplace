const express = require('express');
const router = express.Router();
const {
  applyShipper,
  getShipperList,
  approveShipper,
  rejectShipper,
  assignShipper,
  getMyShipperOrders,
  getAvailableOrders,
  acceptOrder,
  markPickedUp,
  markDelivered,
  toggleShipperRole,
  updateShipperBank
} = require('../controllers/shipperController');
const { protect, authorize, authorizeShipper } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

// Người dùng đăng ký làm shipper
router.post('/apply', protect, applyShipper);

// Shipper cập nhật thông tin nhận lương
router.put('/bank', protect, authorizeShipper, upload.single('qrCodeImage'), updateShipperBank);

// Shipper xem đơn hàng mới (chưa có người giao)
router.get('/available-orders', protect, authorizeShipper, getAvailableOrders);

// Shipper nhận giao đơn
router.put('/orders/:orderId/accept', protect, authorizeShipper, acceptOrder);

// Shipper xem đơn của mình
router.get('/my-orders', protect, authorizeShipper, getMyShipperOrders);

// Shipper báo đã nhận hàng từ người bán (bước 1)
router.put('/orders/:orderId/pickup', protect, authorizeShipper, upload.single('image'), markPickedUp);

// Shipper báo đã giao hàng thành công (bước 2)
router.put('/orders/:orderId/delivered', protect, authorizeShipper, upload.single('image'), markDelivered);

// Admin routes
router.get('/list', protect, authorize(), getShipperList);
router.put('/:id/approve', protect, authorize(), approveShipper);
router.put('/:id/reject', protect, authorize(), rejectShipper);
router.put('/assign/:orderId', protect, authorize(), assignShipper);
router.put('/:id/role', protect, authorize(), toggleShipperRole);

module.exports = router;
