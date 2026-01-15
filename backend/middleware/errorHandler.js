// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB CastError (Invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle MongoDB Duplicate Fields
const handleDuplicateFieldsDB = (err) => {
  // Extract duplicate field value from error message
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] : 'field';
  const field = Object.keys(err.keyPattern || {})[0] || 'field';
  
  let message;
  if (field === 'email') {
    message = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
  } else if (field === 'phone') {
    message = 'Số điện thoại đã được sử dụng. Vui lòng sử dụng số điện thoại khác.';
  } else {
    message = `${field} đã được sử dụng. Vui lòng thử lại với giá trị khác.`;
  }
  
  return new AppError(message, 400);
};

// Handle MongoDB Validation Error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT Errors
const handleJWTError = () => {
  return new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    });
  }
};

// Global Error Handler Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports.AppError = AppError;
