const express = require('express');
const {
  getSimilarProducts,
  getAlsoViewed,
  getRecommendedProducts,
  getTrendingProducts,
  getLatestProducts,
  getNearbyProducts
} = require('../controllers/productRecommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/products/:id/similar', getSimilarProducts);
router.get('/products/:id/also-viewed', getAlsoViewed);
router.get('/products/recommended', protect, getRecommendedProducts);
router.get('/products/trending', getTrendingProducts);
router.get('/products/latest', getLatestProducts);
router.get('/products/nearby', protect, getNearbyProducts);

module.exports = router;

