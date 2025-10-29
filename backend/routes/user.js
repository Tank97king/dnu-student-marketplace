const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getMyProducts,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getUserStats,
  getUserPublicProfile,
  getUserProducts,
  followUser,
  unfollowUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:userId/public', getUserPublicProfile);
router.get('/:userId/products', getUserProducts);

// Protected routes
router.get('/profile/:id', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.get('/products', protect, getMyProducts);
router.post('/favorites/:productId', protect, addToFavorites);
router.delete('/favorites/:productId', protect, removeFromFavorites);
router.get('/favorites', protect, getFavorites);
router.get('/stats', protect, getUserStats);
router.post('/:userId/follow', protect, followUser);
router.delete('/:userId/follow', protect, unfollowUser);

module.exports = router;








