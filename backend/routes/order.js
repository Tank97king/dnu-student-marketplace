const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;

