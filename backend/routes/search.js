const express = require('express');
const {
  getAutocomplete,
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  searchNatural,
  searchSemantic
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/autocomplete', getAutocomplete);
router.post('/natural', searchNatural);
router.post('/semantic', searchSemantic);           // Tìm kiếm ngữ nghĩa AI
router.get('/history', protect, getSearchHistory);
router.post('/history', protect, saveSearchHistory);
router.delete('/history/:id', protect, deleteSearchHistory);

module.exports = router;


