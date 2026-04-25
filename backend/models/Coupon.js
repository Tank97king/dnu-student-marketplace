const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Vui lòng nhập mã giảm giá'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Mã giảm giá phải có ít nhất 3 ký tự'],
    maxlength: [20, 'Mã giảm giá không được vượt quá 20 ký tự']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Vui lòng chọn loại giảm giá'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Vui lòng nhập giá trị giảm giá'],
    min: [0, 'Giá trị giảm giá phải lớn hơn 0']
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Giá trị giảm tối đa phải lớn hơn 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày hết hạn'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Ngày hết hạn phải sau ngày hiện tại'
    }
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: [1, 'Giới hạn sử dụng phải lớn hơn 0']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicableCategories: [{
    type: String,
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Sports', 'Other']
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual to check if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.expiryDate > now && 
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(amount) {
  if (!this.isValid) {
    return 0;
  }

  if (amount < this.minPurchase) {
    return 0;
  }

  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
    if (discount > amount) {
      discount = amount;
    }
  }

  return Math.round(discount);
};

// Method to validate coupon
couponSchema.methods.validateCoupon = function(userId, amount, category) {
  const errors = [];

  if (!this.isActive) {
    errors.push('Mã giảm giá đã bị vô hiệu hóa');
  }

  if (this.expiryDate <= new Date()) {
    errors.push('Mã giảm giá đã hết hạn');
  }

  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    errors.push('Mã giảm giá đã hết lượt sử dụng');
  }

  if (amount < this.minPurchase) {
    errors.push(`Đơn hàng phải có giá trị tối thiểu ${this.minPurchase.toLocaleString('vi-VN')} VNĐ`);
  }

  if (this.applicableCategories && this.applicableCategories.length > 0) {
    if (!category || !this.applicableCategories.includes(category)) {
      errors.push('Mã giảm giá không áp dụng cho danh mục này');
    }
  }

  if (this.applicableUsers && this.applicableUsers.length > 0) {
    if (!userId || !this.applicableUsers.some(id => id.toString() === userId.toString())) {
      errors.push('Bạn không có quyền sử dụng mã giảm giá này');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = mongoose.model('Coupon', couponSchema);
