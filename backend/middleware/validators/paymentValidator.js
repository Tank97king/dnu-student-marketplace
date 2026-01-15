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

// Validation cho tạo thanh toán
exports.validateCreatePayment = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID là bắt buộc')
    .isMongoId()
    .withMessage('Order ID không hợp lệ'),
  body('amount')
    .notEmpty()
    .withMessage('Số tiền là bắt buộc')
    .isFloat({ min: 0.01 })
    .withMessage('Số tiền phải lớn hơn 0'),
  body('bankQRId')
    .optional()
    .isMongoId()
    .withMessage('Bank QR ID không hợp lệ'),
  handleValidationErrors
];

// Validation cho upload payment proof
exports.validateUploadProof = [
  param('id')
    .isMongoId()
    .withMessage('Payment ID không hợp lệ'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),
  handleValidationErrors
];

// Validation cho confirm/reject payment
exports.validatePaymentAction = [
  param('id')
    .isMongoId()
    .withMessage('Payment ID không hợp lệ'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),
  handleValidationErrors
];
