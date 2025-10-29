const express = require('express');
const {
  getUsers,
  updateUser,
  getPendingProducts,
  approveProduct,
  getReports,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize());

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.get('/reports', getReports);

module.exports = router;





