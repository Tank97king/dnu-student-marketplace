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
const { paymentLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../utils/uploadImage');
const {
  validateCreatePayment,
  validateUploadProof,
  validatePaymentAction
} = require('../middleware/validators/paymentValidator');

// Create payment (Buyer) - với rate limiting và validation
router.post('/', paymentLimiter, protect, validateCreatePayment, createPayment);

// Get payment by order ID (Buyer or Admin)
router.get('/order/:orderId', protect, getPaymentByOrderId);

// Upload payment proof (Buyer) - với rate limiting và validation
router.put('/:id/upload-proof', uploadLimiter, protect, upload.single('paymentProof'), validateUploadProof, uploadPaymentProof);

// Get all pending payments (Admin)
router.get('/pending', protect, authorize(), getPendingPayments);

// Get buyer's payment history
router.get('/my-payments', protect, getMyPayments);

// Get all payments (Admin)
router.get('/', protect, authorize(), getAllPayments);

// Confirm payment (Admin) - với validation
router.put('/:id/confirm', protect, authorize(), validatePaymentAction, confirmPayment);

// Reject payment (Admin) - với validation
router.put('/:id/reject', protect, authorize(), validatePaymentAction, rejectPayment);

module.exports = router;

