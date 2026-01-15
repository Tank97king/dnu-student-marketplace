const { body, validationResult } = require('express-validator');

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

// Validation cho đăng ký
exports.validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .matches(/@dnu\.edu\.vn$/)
    .withMessage('Email phải có đuôi @dnu.edu.vn')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
    .optional({ nullable: true, checkFalsy: true }),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Mã số sinh viên phải từ 5-20 ký tự'),
  handleValidationErrors
];

// Validation cho đăng nhập
exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu'),
  handleValidationErrors
];

// Validation cho quên mật khẩu
exports.validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  handleValidationErrors
];

// Validation cho reset password
exports.validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
    .optional({ nullable: true, checkFalsy: true }),
  handleValidationErrors
];

// Validation cho verify OTP
exports.validateVerifyOTP = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('verificationCode')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Mã xác minh phải có 6 chữ số')
    .isNumeric()
    .withMessage('Mã xác minh chỉ được chứa số'),
  handleValidationErrors
];
