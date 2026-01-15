const express = require('express');
const router = express.Router();
const {
  getTrendingHashtags,
  getHashtag,
  searchHashtags
} = require('../controllers/hashtagController');

router.get('/trending', getTrendingHashtags);
router.get('/search', searchHashtags);
router.get('/:name', getHashtag);

module.exports = router;

