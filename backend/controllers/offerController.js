const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createAndEmitNotification } = require('../utils/notifications');

// @desc    Create offer
// @route   POST /api/offers
// @access  Private
exports.createOffer = async (req, res) => {
  try {
    const { productId, offerPrice, message } = req.body;
    const buyerId = req.user.id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (product.userId.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể đề nghị giá cho sản phẩm của chính mình'
      });
    }

    if (product.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm này không còn khả dụng'
      });
    }

    if (offerPrice <= 0 || offerPrice > product.price) {
      return res.status(400).json({
        success: false,
        message: `Giá đề nghị phải lớn hơn 0 và không vượt quá giá gốc ${product.price.toLocaleString('vi-VN')} ₫`
      });
    }

    // Check for existing pending offer
    const existingOffer = await Offer.findOne({
      buyerId,
      productId,
      status: 'pending'
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có đề nghị giá đang chờ phản hồi cho sản phẩm này'
      });
    }

    const offer = await Offer.create({
      buyerId,
      sellerId: product.userId,
      productId,
      offerPrice,
      message: message || ''
    });

    await offer.populate('buyerId', 'name avatar');
    await offer.populate('productId', 'title images price');

    // Create notification for seller
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      product.userId,
      'new_offer',
      'Có đề nghị giá mới',
      `${req.user.name} đã đề nghị giá ${offerPrice.toLocaleString('vi-VN')} ₫ cho sản phẩm "${product.title}"`,
      { offerId: offer._id, productId, productName: product.title, offerPrice }
    );

    res.status(201).json({
      success: true,
      data: offer,
      message: 'Đề nghị giá đã được gửi'
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get offers for user
// @route   GET /api/offers
// @access  Private
exports.getOffers = async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'sent', 'received', 'all'
    const userId = req.user.id;

    let query = {};
    if (type === 'sent') {
      query.buyerId = userId;
    } else if (type === 'received') {
      query.sellerId = userId;
    } else {
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    const offers = await Offer.find(query)
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('productId', 'title images price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    console.error('Error getting offers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept offer
// @route   PUT /api/offers/:id/accept
// @access  Private
exports.acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('productId');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề nghị giá'
      });
    }

    if (offer.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấp nhận đề nghị này'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Đề nghị giá này không còn hiệu lực'
      });
    }

    offer.status = 'accepted';
    offer.acceptedAt = new Date();
    await offer.save();

    // Create order
    const order = await Order.create({
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      productId: offer.productId._id,
      offerId: offer._id,
      finalPrice: offer.offerPrice
    });

    // Mark product as sold
    await Product.findByIdAndUpdate(offer.productId._id, {
      status: 'Sold'
    });

    // Create notification for buyer
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      offer.buyerId,
      'offer_accepted',
      'Đề nghị giá đã được chấp nhận',
      `Người bán đã chấp nhận đề nghị giá ${offer.offerPrice.toLocaleString('vi-VN')} ₫ cho sản phẩm "${offer.productId.title}"`,
      { offerId: offer._id, orderId: order._id, productId: offer.productId._id, productName: offer.productId.title }
    );

    res.json({
      success: true,
      data: { offer, order },
      message: 'Đã chấp nhận đề nghị giá và tạo đơn hàng'
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject offer
// @route   PUT /api/offers/:id/reject
// @access  Private
exports.rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('productId');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề nghị giá'
      });
    }

    if (offer.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền từ chối đề nghị này'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Đề nghị giá này không còn hiệu lực'
      });
    }

    offer.status = 'rejected';
    offer.rejectedAt = new Date();
    offer.rejectedBy = req.user.id;
    await offer.save();

    // Create notification for buyer
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      offer.buyerId,
      'offer_rejected',
      'Đề nghị giá đã bị từ chối',
      `Người bán đã từ chối đề nghị giá của bạn cho sản phẩm "${offer.productId.title}"`,
      { offerId: offer._id, productId: offer.productId._id, productName: offer.productId.title }
    );

    res.json({
      success: true,
      data: offer,
      message: 'Đã từ chối đề nghị giá'
    });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Counter offer
// @route   PUT /api/offers/:id/counter
// @access  Private
exports.counterOffer = async (req, res) => {
  try {
    const { counterOfferPrice, sellerMessage } = req.body;
    const offer = await Offer.findById(req.params.id)
      .populate('productId');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề nghị giá'
      });
    }

    if (offer.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thương lượng lại đề nghị này'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Đề nghị giá này không còn hiệu lực'
      });
    }

    if (!counterOfferPrice || counterOfferPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá đề nghị lại không hợp lệ'
      });
    }

    offer.status = 'countered';
    offer.counterOfferPrice = counterOfferPrice;
    offer.sellerMessage = sellerMessage || '';
    await offer.save();

    // Create notification for buyer
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      offer.buyerId,
      'offer_countered',
      'Có đề nghị giá mới',
      `Người bán đã đề nghị giá ${counterOfferPrice.toLocaleString('vi-VN')} ₫ cho sản phẩm "${offer.productId.title}"`,
      { offerId: offer._id, productId: offer.productId._id, productName: offer.productId.title, counterOfferPrice }
    );

    res.json({
      success: true,
      data: offer,
      message: 'Đã gửi đề nghị giá lại'
    });
  } catch (error) {
    console.error('Error countering offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept counter offer
// @route   PUT /api/offers/:id/accept-counter
// @access  Private
exports.acceptCounterOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('productId');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề nghị giá'
      });
    }

    if (offer.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chấp nhận đề nghị này'
      });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({
        success: false,
        message: 'Đề nghị giá này không ở trạng thái thương lượng lại'
      });
    }

    if (!offer.counterOfferPrice) {
      return res.status(400).json({
        success: false,
        message: 'Không có giá đề nghị lại'
      });
    }

    offer.status = 'accepted';
    offer.acceptedAt = new Date();
    await offer.save();

    // Create order with counter offer price
    const order = await Order.create({
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      productId: offer.productId._id,
      offerId: offer._id,
      finalPrice: offer.counterOfferPrice
    });

    // Mark product as sold
    await Product.findByIdAndUpdate(offer.productId._id, {
      status: 'Sold'
    });

    // Create notification for seller
    const io = req.app.get('io');
    await createAndEmitNotification(
      io,
      offer.sellerId,
      'offer_accepted',
      'Đề nghị giá đã được chấp nhận',
      `${req.user.name} đã chấp nhận đề nghị giá ${offer.counterOfferPrice.toLocaleString('vi-VN')} ₫ cho sản phẩm "${offer.productId.title}"`,
      { offerId: offer._id, orderId: order._id, productId: offer.productId._id, productName: offer.productId.title }
    );

    res.json({
      success: true,
      data: { offer, order },
      message: 'Đã chấp nhận đề nghị giá và tạo đơn hàng'
    });
  } catch (error) {
    console.error('Error accepting counter offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel offer
// @route   PUT /api/offers/:id/cancel
// @access  Private
exports.cancelOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề nghị giá'
      });
    }

    if (offer.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể hủy đề nghị giá của chính mình'
      });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đề nghị giá này'
      });
    }

    offer.status = 'cancelled';
    await offer.save();

    res.json({
      success: true,
      data: offer,
      message: 'Đã hủy đề nghị giá'
    });
  } catch (error) {
    console.error('Error cancelling offer:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

