const express = require('express');
const router = express.Router();
const {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection
} = require('../controllers/collectionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createCollection);
router.get('/', getCollections);
router.get('/:id', getCollection);
router.put('/:id', protect, updateCollection);
router.delete('/:id', protect, deleteCollection);
router.post('/:id/posts/:postId', protect, addPostToCollection);
router.delete('/:id/posts/:postId', protect, removePostFromCollection);

module.exports = router;

