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

// Validation cho tạo sản phẩm
exports.validateCreateProduct = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Tiêu đề phải từ 5-100 ký tự'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả phải từ 10-2000 ký tự'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Giá phải là số dương và lớn hơn 0'),
  body('category')
    .isIn(['electronics', 'books', 'clothing', 'furniture', 'other'])
    .withMessage('Danh mục không hợp lệ'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Tình trạng không hợp lệ'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Địa điểm không được vượt quá 100 ký tự'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 10) {
          throw new Error('Tối đa 10 thẻ tag');
        }
        if (tags.some(tag => tag.length > 20)) {
          throw new Error('Mỗi tag không được vượt quá 20 ký tự');
        }
      }
      return true;
    }),
  handleValidationErrors
];

// Validation cho cập nhật sản phẩm
exports.validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Product ID không hợp lệ'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Tiêu đề phải từ 5-100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả phải từ 10-2000 ký tự'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Giá phải là số dương và lớn hơn 0'),
  body('category')
    .optional()
    .isIn(['electronics', 'books', 'clothing', 'furniture', 'other'])
    .withMessage('Danh mục không hợp lệ'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Tình trạng không hợp lệ'),
  handleValidationErrors
];
