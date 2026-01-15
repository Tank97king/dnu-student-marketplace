const BankQR = require('../models/BankQR');
const { uploadToCloudinary } = require('../utils/uploadImage');

// @desc    Get all bank QR codes
// @route   GET /api/bankqr
// @access  Admin (Super Admin can manage, Admin can view)
exports.getBankQRs = async (req, res) => {
  try {
    const bankQRs = await BankQR.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bankQRs.length,
      data: bankQRs
    });
  } catch (error) {
    console.error('Error getting bank QR codes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bank QR code by ID
// @route   GET /api/bankqr/:id
// @access  Admin
exports.getBankQR = async (req, res) => {
  try {
    const bankQR = await BankQR.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!bankQR) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy QR code ngân hàng'
      });
    }

    res.json({
      success: true,
      data: bankQR
    });
  } catch (error) {
    console.error('Error getting bank QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create bank QR code
// @route   POST /api/bankqr
// @access  Super Admin only
exports.createBankQR = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder } = req.body;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: tên ngân hàng, số tài khoản, tên chủ tài khoản'
      });
    }

    // Check if QR code image is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh QR code'
      });
    }

    // Upload QR code image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/bankqr');

    const bankQR = await BankQR.create({
      bankName,
      accountNumber,
      accountHolder,
      qrCodeImage: uploadResult.secure_url,
      createdBy: req.user.id
    });

    const populatedBankQR = await BankQR.findById(bankQR._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedBankQR,
      message: 'Đã tạo QR code ngân hàng thành công'
    });
  } catch (error) {
    console.error('Error creating bank QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bank QR code
// @route   PUT /api/bankqr/:id
// @access  Super Admin only
exports.updateBankQR = async (req, res) => {
  try {
    const bankQR = await BankQR.findById(req.params.id);

    if (!bankQR) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy QR code ngân hàng'
      });
    }

    const { bankName, accountNumber, accountHolder, isActive } = req.body;

    if (bankName) bankQR.bankName = bankName;
    if (accountNumber) bankQR.accountNumber = accountNumber;
    if (accountHolder) bankQR.accountHolder = accountHolder;
    if (isActive !== undefined) bankQR.isActive = isActive;

    // If new QR code image is uploaded
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'dnu-marketplace/bankqr');
      bankQR.qrCodeImage = uploadResult.secure_url;
    }

    await bankQR.save();

    const populatedBankQR = await BankQR.findById(bankQR._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: populatedBankQR,
      message: 'Đã cập nhật QR code ngân hàng thành công'
    });
  } catch (error) {
    console.error('Error updating bank QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete bank QR code
// @route   DELETE /api/bankqr/:id
// @access  Super Admin only
exports.deleteBankQR = async (req, res) => {
  try {
    const bankQR = await BankQR.findById(req.params.id);

    if (!bankQR) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy QR code ngân hàng'
      });
    }

    await BankQR.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa QR code ngân hàng thành công'
    });
  } catch (error) {
    console.error('Error deleting bank QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



