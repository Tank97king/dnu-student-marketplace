const express = require('express');
const {
  getAutocomplete,
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistory
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/autocomplete', getAutocomplete);
router.get('/history', protect, getSearchHistory);
router.post('/history', protect, saveSearchHistory);
router.delete('/history/:id', protect, deleteSearchHistory);

module.exports = router;

