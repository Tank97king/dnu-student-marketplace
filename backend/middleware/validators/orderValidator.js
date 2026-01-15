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
  body('deliveryAddress')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Địa chỉ giao hàng là bắt buộc khi chọn giao hàng')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Địa chỉ giao hàng phải từ 10-200 ký tự'),
  body('deliveryPhone')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Số điện thoại giao hàng là bắt buộc')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  body('meetupLocation')
    .if(body('deliveryMethod').equals('meetup'))
    .notEmpty()
    .withMessage('Địa điểm gặp mặt là bắt buộc khi chọn gặp mặt')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Địa điểm gặp mặt phải từ 5-200 ký tự'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),
  handleValidationErrors
];
