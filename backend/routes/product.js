const express = require('express');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  markAsSold,
  reportProduct,
  approveProduct,
  getPendingProducts,
  rejectProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');
const {
  validateCreateProduct,
  validateUpdateProduct
} = require('../middleware/validators/productValidator');

const router = express.Router();

router.get('/', getProducts);
router.get('/pending', protect, getPendingProducts);
router.get('/:id', getProduct);

// Protected routes - giới hạn tối đa 5 ảnh với validation
router.post('/', protect, upload.array('images', 5), validateCreateProduct, createProduct);
router.put('/:id', protect, upload.array('images', 5), validateUpdateProduct, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/sold', protect, markAsSold);
router.post('/:id/report', protect, reportProduct);

// Admin routes
router.put('/:id/approve', protect, approveProduct);
router.put('/:id/reject', protect, rejectProduct);

module.exports = router;





