const express = require('express');
const router = express.Router();
const {
  trackView,
  getRecentViews,
  getSimilarProducts
} = require('../controllers/productViewController');
const { protect } = require('../middleware/auth');

router.post('/:id/view', protect, trackView);
router.get('/views/recent', protect, getRecentViews);
router.get('/:id/similar', getSimilarProducts);

module.exports = router;

