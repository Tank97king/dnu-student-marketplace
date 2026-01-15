const express = require('express');
const router = express.Router();
const {
  createStory,
  getStories,
  getUserStories,
  viewStory,
  reactToStory,
  deleteStory
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

router.post('/', protect, upload.single('media'), createStory);
router.get('/', protect, getStories);
router.get('/user/:userId', getUserStories);
router.get('/:id', protect, viewStory);
router.post('/:id/reaction', protect, reactToStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;

