const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getPostLikes,
  sharePost,
  getUserPosts,
  getPostsByHashtag
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

// All routes require authentication except getPosts and getPost
router.post('/', protect, upload.array('images', 10), createPost);
router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);
router.get('/hashtag/:hashtag', getPostsByHashtag);
router.get('/:id', getPost);
router.put('/:id', protect, upload.array('images', 10), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.get('/:id/likes', getPostLikes);
router.post('/:id/share', protect, sharePost);

module.exports = router;

