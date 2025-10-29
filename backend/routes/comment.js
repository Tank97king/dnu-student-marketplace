const express = require('express');
const {
  createComment,
  getComments,
  replyToComment,
  deleteComment,
  updateComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Comment routes
router.get('/products/:id/comments', getComments);
router.post('/products/:id/comments', protect, createComment);
router.put('/comments/:commentId', protect, updateComment);
router.post('/comments/:commentId/reply', protect, replyToComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
