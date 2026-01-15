const express = require('express');
const {
  createComment,
  getComments,
  replyToComment,
  deleteComment,
  updateComment,
  likeComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Comment routes for products
router.get('/products/:productId/comments', getComments);
router.post('/products/:productId/comments', protect, createComment);

// Comment routes for posts
router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', protect, createComment);

// General comment routes
router.put('/comments/:commentId', protect, updateComment);
router.post('/comments/:commentId/reply', protect, replyToComment);
router.post('/comments/:commentId/like', protect, likeComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
