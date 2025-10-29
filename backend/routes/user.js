const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getMyProducts,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile/:id', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.get('/products', protect, getMyProducts);
router.post('/favorites/:productId', protect, addToFavorites);
router.delete('/favorites/:productId', protect, removeFromFavorites);
router.get('/favorites', protect, getFavorites);
router.get('/stats', protect, getUserStats);

module.exports = router;







