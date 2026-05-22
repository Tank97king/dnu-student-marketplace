const express = require('express');
const {
  getUsers,
  updateUser,
  deleteUser,
  getPendingProducts,
  approveProduct,
  getReports,
  getStats,
  rejectProduct,
  checkEmailConfig,
  getRevenueStats,
  dismissReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize());

router.get('/stats', getStats);
router.get('/revenue-stats', getRevenueStats);
router.get('/check-email-config', checkEmailConfig);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.get('/reports', getReports);
router.put('/products/:id/dismiss-reports', dismissReports);

module.exports = router;
