const express = require('express');
const router = express.Router();
const {
  createOffer,
  getOffers,
  acceptOffer,
  rejectOffer,
  counterOffer,
  acceptCounterOffer,
  cancelOffer
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOffer);
router.get('/', protect, getOffers);
router.put('/:id/accept', protect, acceptOffer);
router.put('/:id/reject', protect, rejectOffer);
router.put('/:id/counter', protect, counterOffer);
router.put('/:id/accept-counter', protect, acceptCounterOffer);
router.put('/:id/cancel', protect, cancelOffer);

module.exports = router;

