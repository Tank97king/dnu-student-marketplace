const express = require('express');
const router = express.Router();
const {
  createBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
  getBookmarkTags
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBookmark);
router.get('/', protect, getBookmarks);
router.get('/tags', protect, getBookmarkTags);
router.put('/:id', protect, updateBookmark);
router.delete('/:id', protect, deleteBookmark);

module.exports = router;

