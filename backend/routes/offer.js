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
const { protect, blockShipper } = require('../middleware/auth');

router.post('/', protect, blockShipper, createOffer);
router.get('/', protect, getOffers);
router.put('/:id/accept', protect, blockShipper, acceptOffer);
router.put('/:id/reject', protect, blockShipper, rejectOffer);
router.put('/:id/counter', protect, blockShipper, counterOffer);
router.put('/:id/accept-counter', protect, blockShipper, acceptCounterOffer);
router.put('/:id/cancel', protect, blockShipper, cancelOffer);

module.exports = router;

