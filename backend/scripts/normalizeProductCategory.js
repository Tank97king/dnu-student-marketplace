/**
 * Script chuẩn hóa category sản phẩm: đổi Electronics -> Điện tử, Books -> Sách, ...
 * Chạy: node scripts/normalizeProductCategory.js
 * (từ thư mục backend: node scripts/normalizeProductCategory.js)
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Product = require('../models/Product');

const CATEGORY_EN_TO_VI = {
  Electronics: 'Điện tử',
  Books: 'Sách',
  Furniture: 'Nội thất',
  Clothing: 'Quần áo',
  Stationery: 'Văn phòng phẩm',
  Sports: 'Thể thao',
  Other: 'Khác'
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    console.log('Đã kết nối MongoDB.\n');

    const englishCategories = Object.keys(CATEGORY_EN_TO_VI);
    let totalUpdated = 0;

    for (const en of englishCategories) {
      const result = await Product.updateMany(
        { category: en },
        { $set: { category: CATEGORY_EN_TO_VI[en] } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ${en} -> ${CATEGORY_EN_TO_VI[en]}: đã sửa ${result.modifiedCount} sản phẩm`);
        totalUpdated += result.modifiedCount;
      }
    }

    if (totalUpdated === 0) {
      console.log('Không có sản phẩm nào dùng category tiếng Anh (Electronics, Books, ...).');
    } else {
      console.log(`\nTổng cộng đã chuẩn hóa ${totalUpdated} sản phẩm sang category tiếng Việt.`);
    }
  } catch (err) {
    console.error('Lỗi:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nĐã ngắt kết nối MongoDB.');
    process.exit(0);
  }
}

run();
