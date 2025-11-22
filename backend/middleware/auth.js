const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    console.log('Protect middleware - URL:', req.url);
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token ? 'Yes' : 'No');
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập, vui lòng đăng nhập'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded for user ID:', decoded.id);
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('User not found in database - user may have been deleted');
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị xóa. Vui lòng đăng ký lại.'
      });
    }

    console.log('User found:', req.user.email, 'isAdmin:', req.user.isAdmin);

    if (!req.user.isActive) {
      console.log('User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    console.log('Protect middleware passed');
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
    console.log('Authorize middleware - User:', req.user?.email, 'isAdmin:', req.user?.isAdmin, 'isSuperAdmin:', req.user?.isSuperAdmin);
    
    // If no roles specified, only allow admin
    if (roles.length === 0) {
      if (!req.user.isAdmin) {
        console.log('Access denied - User is not admin');
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này`
        });
      }
    } else {
      if (!roles.includes(req.user.role) && !req.user.isAdmin) {
        console.log('Access denied - User role not authorized');
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này`
        });
      }
    }
    console.log('Access granted');
    next();
  };
};

// Grant access to super admin only
exports.authorizeSuperAdmin = (req, res, next) => {
  console.log('AuthorizeSuperAdmin middleware - User:', req.user?.email, 'isSuperAdmin:', req.user?.isSuperAdmin);
  
  if (!req.user.isSuperAdmin) {
    console.log('Access denied - User is not super admin');
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin tổng mới có quyền thực hiện hành động này'
    });
  }
  
  console.log('Super admin access granted');
  next();
};

