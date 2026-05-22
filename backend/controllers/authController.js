const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const PendingPasswordReset = require('../models/PendingPasswordReset');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

// @desc    Register user (chỉ lưu tạm thời, chưa tạo tài khoản)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, address, studentId } = req.body;

    // Check if user already exists in database
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại đã được sử dụng',
        details: 'Nếu bạn vừa xóa tài khoản, vui lòng đợi vài giây hoặc liên hệ admin'
      });
    }

    // Check if there's a pending registration for this email/phone
    const pendingExists = await PendingRegistration.findOne({
      $or: [{ email }, { phone }]
    });

    if (pendingExists) {
      // Delete old pending registration
      await PendingRegistration.deleteOne({ _id: pendingExists._id });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to PendingRegistration (NOT User) - chưa tạo tài khoản thật
    const pendingRegistration = await PendingRegistration.create({
      name,
      email,
      phone,
      password, // Will be hashed when creating actual user
      address,
      studentId,
      verificationCode,
      verificationCodeExpire
    });

    // Send verification email with OTP code
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Chào mừng bạn đến với DNU Marketplace!</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Để xác minh bạn là sinh viên DNU, vui lòng sử dụng mã xác minh sau:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `;

    const textMessage = `
      Chào mừng bạn đến với DNU Marketplace!
      
      Xin chào ${name},
      
      Cảm ơn bạn đã đăng ký tài khoản. Để xác minh bạn là sinh viên DNU, vui lòng sử dụng mã xác minh sau:
      
      ${verificationCode}
      
      Mã này sẽ hết hạn sau 10 phút.
      
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
    `;

    try {
      // Use email from .env (Gmail) - more reliable than getting from database
      // If you want to use super admin email from database, ensure it has App Password configured
      const senderEmail = process.env.EMAIL_USER;
      const senderPassword = process.env.EMAIL_PASSWORD;

      // Debug logging
      console.log('🔍 Email Configuration Debug:');
      console.log('  EMAIL_USER from .env:', senderEmail);
      console.log('  EMAIL_PASSWORD exists:', !!senderPassword);
      console.log('  EMAIL_HOST from .env:', process.env.EMAIL_HOST);

      // Check if email is configured
      if (!senderEmail || !senderPassword) {
        console.warn('Email not configured - skipping email send');
        // Delete pending registration if email not configured
        await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
        return res.status(500).json({
          success: false,
          message: 'Email chưa được cấu hình. Vui lòng liên hệ admin.'
        });
      }

      console.log(`📧 Sending OTP email from: ${senderEmail} to: ${pendingRegistration.email}`);

      await sendEmail({
        email: pendingRegistration.email,
        subject: 'Mã xác minh tài khoản DNU Marketplace',
        message: textMessage,
        html: htmlMessage,
        fromEmail: senderEmail,
        fromPassword: senderPassword
      });

      res.status(200).json({
        success: true,
        message: 'Mã xác minh đã được gửi đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.',
        data: {
          email: pendingRegistration.email,
          expiresIn: '10 phút'
        }
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // Delete pending registration if email sending fails
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

      // In development, show verification code
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          success: true,
          message: 'Không thể gửi email. Mã xác minh (DEV): ' + verificationCode,
          data: {
            email: pendingRegistration.email,
            verificationCode: verificationCode // Show in dev mode
          }
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email xác minh. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.keyPattern) {
      console.error('Duplicate key pattern:', error.keyPattern);
    }
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email hoặc số điện thoại';
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : field === 'phone' ? 'Số điện thoại' : field} đã được sử dụng`,
        details: 'Vui lòng sử dụng email/số điện thoại khác hoặc liên hệ admin nếu bạn vừa xóa tài khoản'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: messages || 'Dữ liệu không hợp lệ'
      });
    }
    
    // Handle CastError (invalid ObjectId, etc)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ: ' + error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      } : undefined
    });
  }
};

// @desc    Verify email with OTP code - TẠO TÀI KHOẢN SAU KHI XÁC MINH THÀNH CÔNG
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mã xác minh'
      });
    }

    // Find pending registration (NOT user - vì chưa tạo user)
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký với email này. Vui lòng đăng ký lại.'
      });
    }

    // Verify OTP code
    if (pendingRegistration.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh không đúng'
      });
    }

    // Check if OTP expired
    if (new Date(pendingRegistration.verificationCodeExpire) < new Date()) {
      // Delete expired pending registration
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu gửi lại mã'
      });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ 
      $or: [{ email: pendingRegistration.email }, { phone: pendingRegistration.phone }] 
    });

    if (existingUser) {
      // Delete pending registration
      await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại đã được sử dụng'
      });
    }

    // OTP is correct and not expired - CREATE ACTUAL USER NOW
    const user = await User.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      phone: pendingRegistration.phone,
      password: pendingRegistration.password, // Will be hashed by pre-save hook
      address: pendingRegistration.address,
      studentId: pendingRegistration.studentId,
      isVerified: true // Mark as verified immediately
    });

    // Delete pending registration after successful user creation
    await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

    console.log(`✅ User account created successfully after OTP verification: ${user.email}`);

    res.json({
      success: true,
      message: 'Xác minh thành công! Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Handle duplicate key error (in case user was created between check and create)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'email hoặc số điện thoại';
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : field === 'phone' ? 'Số điện thoại' : field} đã được sử dụng`
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi xác minh. Vui lòng thử lại sau.'
    });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }

    // Find pending registration (NOT user - vì chưa tạo user)
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký với email này. Vui lòng đăng ký lại.'
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingRegistration.verificationCode = verificationCode;
    pendingRegistration.verificationCodeExpire = new Date(verificationCodeExpire);
    await pendingRegistration.save();

    // Send verification email with OTP code
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Mã xác minh mới - DNU Marketplace</h2>
        <p>Xin chào <strong>${pendingRegistration.name}</strong>,</p>
        <p>Bạn đã yêu cầu gửi lại mã xác minh. Vui lòng sử dụng mã sau:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `;

    const textMessage = `
      Mã xác minh mới - DNU Marketplace
      
      Xin chào ${pendingRegistration.name},
      
      Bạn đã yêu cầu gửi lại mã xác minh. Vui lòng sử dụng mã sau:
      
      ${verificationCode}
      
      Mã này sẽ hết hạn sau 10 phút.
      
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
    `;

    try {
      // Use email from .env (Gmail) - more reliable
      const senderEmail = process.env.EMAIL_USER;
      const senderPassword = process.env.EMAIL_PASSWORD;

      if (!senderEmail || !senderPassword) {
        return res.status(500).json({
          success: false,
          message: 'Email chưa được cấu hình. Vui lòng liên hệ admin.'
        });
      }

      console.log(`📧 Resending OTP email from: ${senderEmail} to: ${pendingRegistration.email}`);

      await sendEmail({
        email: pendingRegistration.email,
        subject: 'Mã xác minh mới - DNU Marketplace',
        message: textMessage,
        html: htmlMessage,
        fromEmail: senderEmail,
        fromPassword: senderPassword
      });

      res.json({
        success: true,
        message: 'Mã xác minh mới đã được gửi đến email của bạn'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email xác minh. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify email (legacy - for backward compatibility)
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email đã được xác minh thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không đúng'
      });
    }

    console.log(`Login attempt for user: ${user.email}, isActive: ${user.isActive}, isVerified: ${user.isVerified}`);

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không đúng'
      });
    }

    console.log(`Password match successful for user: ${user.email}`);

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Populate followers and following
    await user.populate('followers', 'name avatar');
    await user.populate('following', 'name avatar');

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin || false,
        followers: user.followers || [],
        following: user.following || [],
        rating: user.rating || { average: 0, count: 0 },
        isShipper: user.isShipper || false,
        shipperStatus: user.shipperStatus || 'none'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password - Gửi OTP để xác nhận
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu mới'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với email này'
      });
    }

    // Check if there's an existing pending reset
    const existingReset = await PendingPasswordReset.findOne({ 
      email, 
      type: 'forgot' 
    });

    if (existingReset) {
      await PendingPasswordReset.deleteOne({ _id: existingReset._id });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to PendingPasswordReset
    const pendingReset = await PendingPasswordReset.create({
      userId: user._id,
      email: user.email,
      newPassword, // Will be hashed when resetting
      verificationCode,
      verificationCodeExpire: new Date(verificationCodeExpire),
      type: 'forgot'
    });

    // Send OTP email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Yêu cầu đặt lại mật khẩu - DNU Marketplace</h2>
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác minh sau:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #dc2626; font-size: 14px;"><strong>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn an toàn.</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `;

    const textMessage = `
      Yêu cầu đặt lại mật khẩu - DNU Marketplace
      
      Xin chào ${user.name},
      
      Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác minh sau:
      
      ${verificationCode}
      
      Mã này sẽ hết hạn sau 10 phút.
      
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
    `;

    try {
      const senderEmail = process.env.EMAIL_USER;
      const senderPassword = process.env.EMAIL_PASSWORD;

      if (!senderEmail || !senderPassword) {
        await PendingPasswordReset.deleteOne({ _id: pendingReset._id });
        return res.status(500).json({
          success: false,
          message: 'Email chưa được cấu hình. Vui lòng liên hệ admin.'
        });
      }

      console.log(`📧 Sending password reset OTP from: ${senderEmail} to: ${user.email}`);

      await sendEmail({
        email: user.email,
        subject: 'Mã xác minh đặt lại mật khẩu - DNU Marketplace',
        message: textMessage,
        html: htmlMessage,
        fromEmail: senderEmail,
        fromPassword: senderPassword
      });

      res.json({
        success: true,
        message: 'Mã xác minh đã được gửi đến email của bạn. Vui lòng nhập mã để đặt lại mật khẩu.',
        data: {
          email: user.email,
          expiresIn: '10 phút'
        }
      });
    } catch (error) {
      await PendingPasswordReset.deleteOne({ _id: pendingReset._id });
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP and reset password (for forgot password)
// @route   POST /api/auth/verify-otp-reset-password
// @access  Public
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mã xác minh'
      });
    }

    // Find pending password reset
    const pendingReset = await PendingPasswordReset.findOne({ 
      email, 
      type: 'forgot' 
    });

    if (!pendingReset) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đặt lại mật khẩu. Vui lòng thử lại.'
      });
    }

    // Verify OTP code
    if (pendingReset.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh không đúng'
      });
    }

    // Check if OTP expired
    if (new Date(pendingReset.verificationCodeExpire) < new Date()) {
      await PendingPasswordReset.deleteOne({ _id: pendingReset._id });
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh đã hết hạn. Vui lòng yêu cầu lại.'
      });
    }

    // Find user
    const user = await User.findById(pendingReset.userId);

    if (!user) {
      await PendingPasswordReset.deleteOne({ _id: pendingReset._id });
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // OTP is correct - Reset password
    user.password = pendingReset.newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Delete pending reset
    await PendingPasswordReset.deleteOne({ _id: pendingReset._id });

    console.log(`✅ Password reset successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.'
    });
  } catch (error) {
    console.error('Verify OTP and reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.'
    });
  }
};

// @desc    Request change password - Gửi OTP để xác nhận
// @route   POST /api/auth/request-change-password
// @access  Private
exports.requestChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại'
      });
    }

    // Check if there's an existing pending change
    const existingChange = await PendingPasswordReset.findOne({ 
      userId: user._id, 
      type: 'change' 
    });

    if (existingChange) {
      await PendingPasswordReset.deleteOne({ _id: existingChange._id });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to PendingPasswordReset
    const pendingChange = await PendingPasswordReset.create({
      userId: user._id,
      email: user.email,
      newPassword, // Will be hashed when changing
      verificationCode,
      verificationCodeExpire: new Date(verificationCodeExpire),
      type: 'change'
    });

    // Send OTP email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Yêu cầu đổi mật khẩu - DNU Marketplace</h2>
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Bạn đã yêu cầu đổi mật khẩu. Vui lòng sử dụng mã xác minh sau:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #dc2626; font-size: 14px;"><strong>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn an toàn.</strong></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    `;

    const textMessage = `
      Yêu cầu đổi mật khẩu - DNU Marketplace
      
      Xin chào ${user.name},
      
      Bạn đã yêu cầu đổi mật khẩu. Vui lòng sử dụng mã xác minh sau:
      
      ${verificationCode}
      
      Mã này sẽ hết hạn sau 10 phút.
      
      Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
    `;

    try {
      const senderEmail = process.env.EMAIL_USER;
      const senderPassword = process.env.EMAIL_PASSWORD;

      if (!senderEmail || !senderPassword) {
        await PendingPasswordReset.deleteOne({ _id: pendingChange._id });
        return res.status(500).json({
          success: false,
          message: 'Email chưa được cấu hình. Vui lòng liên hệ admin.'
        });
      }

      console.log(`📧 Sending change password OTP from: ${senderEmail} to: ${user.email}`);

      await sendEmail({
        email: user.email,
        subject: 'Mã xác minh đổi mật khẩu - DNU Marketplace',
        message: textMessage,
        html: htmlMessage,
        fromEmail: senderEmail,
        fromPassword: senderPassword
      });

      res.json({
        success: true,
        message: 'Mã xác minh đã được gửi đến email của bạn. Vui lòng nhập mã để đổi mật khẩu.',
        data: {
          email: user.email,
          expiresIn: '10 phút'
        }
      });
    } catch (error) {
      await PendingPasswordReset.deleteOne({ _id: pendingChange._id });
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP and change password (for logged in users)
// @route   POST /api/auth/verify-otp-change-password
// @access  Private
exports.verifyOTPAndChangePassword = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã xác minh'
      });
    }

    // Find pending password change
    const pendingChange = await PendingPasswordReset.findOne({ 
      userId: req.user.id, 
      type: 'change' 
    });

    if (!pendingChange) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đổi mật khẩu. Vui lòng thử lại.'
      });
    }

    // Verify OTP code
    if (pendingChange.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh không đúng'
      });
    }

    // Check if OTP expired
    if (new Date(pendingChange.verificationCodeExpire) < new Date()) {
      await PendingPasswordReset.deleteOne({ _id: pendingChange._id });
      return res.status(400).json({
        success: false,
        message: 'Mã xác minh đã hết hạn. Vui lòng yêu cầu lại.'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      await PendingPasswordReset.deleteOne({ _id: pendingChange._id });
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // OTP is correct - Change password
    user.password = pendingChange.newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Delete pending change
    await PendingPasswordReset.deleteOne({ _id: pendingChange._id });

    console.log(`✅ Password changed successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    console.error('Verify OTP and change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
};








