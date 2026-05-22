const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  upsertSellerBankQR,
  getMySellerBankQR,
  getAllSellerBankQRs,
  verifySellerBankQR,
  markSellerPaid,
  confirmSellerReceipt,
  reportPaymentIssue
} = require('../controllers/sellerBankQRController');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'), false);
    }
  }
});

// Người bán
router.post('/', protect, upload.single('qrCodeImage'), upsertSellerBankQR);
router.get('/my', protect, getMySellerBankQR);

// Người bán xác nhận đã nhận tiền
router.put('/payments/:paymentId/confirm-receipt', protect, confirmSellerReceipt);
router.put('/payments/:paymentId/report-issue', protect, reportPaymentIssue);

// Admin
router.get('/all', protect, authorize(), getAllSellerBankQRs);
router.put('/:id/verify', protect, authorize(), verifySellerBankQR);
// Admin chuyển tiền người bán kèm ảnh biên lai
router.put('/payments/:paymentId/mark-seller-paid', protect, authorize(), upload.single('sellerPaymentProof'), markSellerPaid);

module.exports = router;
