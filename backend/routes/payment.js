const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentByOrderId,
  uploadPaymentProof,
  getPendingPayments,
  confirmPayment,
  rejectPayment,
  getAllPayments,
  getMyPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

// Create payment (Buyer)
router.post('/', protect, createPayment);

// Get payment by order ID (Buyer or Admin)
router.get('/order/:orderId', protect, getPaymentByOrderId);

// Upload payment proof (Buyer)
router.put('/:id/upload-proof', protect, upload.single('paymentProof'), uploadPaymentProof);

// Get all pending payments (Admin)
router.get('/pending', protect, authorize(), getPendingPayments);

// Get buyer's payment history
router.get('/my-payments', protect, getMyPayments);

// Get all payments (Admin)
router.get('/', protect, authorize(), getAllPayments);

// Confirm payment (Admin)
router.put('/:id/confirm', protect, authorize(), confirmPayment);

// Reject payment (Admin)
router.put('/:id/reject', protect, authorize(), rejectPayment);

module.exports = router;

