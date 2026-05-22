const express = require('express');
const router = express.Router();
const {
  getBankQRs,
  getBankQR,
  createBankQR,
  updateBankQR,
  deleteBankQR
} = require('../controllers/bankQRController');
const { protect, authorize, authorizeSuperAdmin } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

// Get all active bank QR codes (Authenticated users including shippers can view)
router.get('/', protect, getBankQRs);

// Get bank QR code by ID (Authenticated users including shippers can view)
router.get('/:id', protect, getBankQR);

// Create bank QR code (Super Admin only)
router.post('/', protect, authorizeSuperAdmin, upload.single('qrCodeImage'), createBankQR);

// Update bank QR code (Super Admin only)
router.put('/:id', protect, authorizeSuperAdmin, upload.single('qrCodeImage'), updateBankQR);

// Delete bank QR code (Super Admin only)
router.delete('/:id', protect, authorizeSuperAdmin, deleteBankQR);

module.exports = router;



