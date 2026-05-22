const { body, param, validationResult } = require('express-validator');

// Middleware để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation cho tạo đơn hàng
exports.validateCreateOrder = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID là bắt buộc')
    .isMongoId()
    .withMessage('Product ID không hợp lệ'),
  body('deliveryMethod')
    .isIn(['pickup', 'delivery', 'meetup'])
    .withMessage('Phương thức nhận hàng không hợp lệ'),
  
  // Validation cho shippingAddress khi chọn giao hàng hoặc gặp mặt
  body('shippingAddress.fullName')
    .if(body('deliveryMethod').isIn(['delivery', 'meetup']))
    .notEmpty()
    .withMessage('Họ tên người nhận là bắt buộc')
    .trim(),
  body('shippingAddress.phone')
    .if(body('deliveryMethod').isIn(['delivery', 'meetup']))
    .notEmpty()
    .withMessage('Số điện thoại người nhận là bắt buộc')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  
  body('shippingAddress.address')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Địa chỉ chi tiết là bắt buộc khi chọn giao hàng')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Địa chỉ chi tiết phải từ 5-200 ký tự'),
  body('shippingAddress.city')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Tỉnh/Thành phố là bắt buộc khi chọn giao hàng')
    .trim(),
  body('shippingAddress.district')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Quận/Huyện là bắt buộc khi chọn giao hàng')
    .trim(),
  body('shippingAddress.ward')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Phường/Xã là bắt buộc khi chọn giao hàng')
    .trim(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),
  body('couponCode')
    .optional()
    .trim()
    .toUpperCase(),
  handleValidationErrors
];
