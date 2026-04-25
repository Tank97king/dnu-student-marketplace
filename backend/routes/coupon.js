const express = require('express');
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAvailableCoupons
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes (require authentication)
router.post('/validate', protect, validateCoupon);
router.get('/available', protect, getAvailableCoupons);

// Admin routes (require authentication and admin role)
const adminRouter = express.Router();
adminRouter.use(protect);
adminRouter.use(authorize());

adminRouter.post('/', createCoupon);
adminRouter.get('/', getAllCoupons);
adminRouter.get('/:id', getCouponById);
adminRouter.put('/:id', updateCoupon);
adminRouter.delete('/:id', deleteCoupon);

module.exports = { router, adminRouter };
