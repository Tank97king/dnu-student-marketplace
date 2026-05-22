const jwt = require('jsonwebtoken');
const User = require('../models/User');

const debugAuth = () => process.env.DEBUG_AUTH === '1' || process.env.DEBUG_AUTH === 'true';

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    if (debugAuth()) console.log('Protect middleware - URL:', req.url);

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      if (debugAuth()) console.log('Token found:', token ? 'Yes' : 'No');
    }

    if (!token) {
      if (debugAuth()) console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập, vui lòng đăng nhập'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (debugAuth()) console.log('Token decoded for user ID:', decoded.id);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      if (debugAuth()) console.log('User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị xóa. Vui lòng đăng ký lại.'
      });
    }

    if (debugAuth()) console.log('User found:', req.user.email, 'isAdmin:', req.user.isAdmin);

    if (!req.user.isActive) {
      if (debugAuth()) console.log('User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    if (debugAuth()) console.log('Protect middleware passed');
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Grant access to admin
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (debugAuth()) console.log('Authorize middleware - User:', req.user?.email, 'isAdmin:', req.user?.isAdmin);

    if (roles.length === 0) {
      if (!req.user.isAdmin) {
        if (debugAuth()) console.log('Access denied - User is not admin');
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này`
        });
      }
    } else {
      if (!roles.includes(req.user.role) && !req.user.isAdmin) {
        if (debugAuth()) console.log('Access denied - User role not authorized');
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này`
        });
      }
    }
    if (debugAuth()) console.log('Access granted');
    next();
  };
};

// Grant access to super admin only
exports.authorizeSuperAdmin = (req, res, next) => {
  if (debugAuth()) console.log('AuthorizeSuperAdmin - User:', req.user?.email, 'isSuperAdmin:', req.user?.isSuperAdmin);

  if (!req.user.isSuperAdmin) {
    if (debugAuth()) console.log('Access denied - User is not super admin');
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin tổng mới có quyền thực hiện hành động này'
    });
  }

  if (debugAuth()) console.log('Super admin access granted');
  next();
};

// Grant access to shippers only
exports.authorizeShipper = (req, res, next) => {
  if (!req.user.isShipper || req.user.shipperStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Shipper đã được phê duyệt mới có quyền thực hiện hành động này'
    });
  }
  next();
};

// Block shippers from buyer/seller actions
exports.blockShipper = (req, res, next) => {
  if (req.user.isShipper && req.user.shipperStatus === 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản Shipper không được phép mua bán sản phẩm'
    });
  }
  next();
};
