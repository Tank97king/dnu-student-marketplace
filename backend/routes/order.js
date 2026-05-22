const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  createDirectOrder,
  confirmOrder,
  requestReturn,
  approveReturn,
  rejectReturn,
  getReturnRequests,
  getAllOrdersForAdmin
} = require('../controllers/orderController');
const { protect, authorize, blockShipper } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validators/orderValidator');

router.post('/', protect, blockShipper, validateCreateOrder, createDirectOrder);
router.get('/', protect, getOrders);
router.get('/return-requests', protect, authorize(), getReturnRequests); // Admin
router.get('/admin/all', protect, authorize(), getAllOrdersForAdmin); // Admin
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, blockShipper, updateOrderStatus);
router.put('/:id/confirm', protect, blockShipper, confirmOrder);
router.post('/:id/return-request', protect, blockShipper, requestReturn);
router.put('/:id/return-approve', protect, authorize(), approveReturn); // Admin
router.put('/:id/return-reject', protect, authorize(), rejectReturn);   // Admin

module.exports = router;
