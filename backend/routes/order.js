const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  createDirectOrder,
  confirmOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createDirectOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/confirm', protect, confirmOrder);

module.exports = router;

