/**
 * Script chuẩn hóa condition sản phẩm: đổi New/Like New/Excellent/... -> tình trạng tiếng Việt.
 * Chạy: node scripts/normalizeProductCondition.js
 * (từ thư mục backend: node scripts/normalizeProductCondition.js)
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');

const CONDITION_EN_TO_VI = {
  New: 'Rất tốt',
  'Like New': 'Rất tốt',
  Excellent: 'Rất tốt',
  Good: 'Tốt',
  Fair: 'Khá',
  Used: 'Đã dùng nhiều',
  NeedsRepair: 'Cần sửa chữa'
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace');
    console.log('Đã kết nối MongoDB.\n');

    const englishConditions = Object.keys(CONDITION_EN_TO_VI);
    let totalUpdated = 0;

    for (const en of englishConditions) {
      const result = await Product.updateMany(
        { condition: en },
        { $set: { condition: CONDITION_EN_TO_VI[en] } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ${en} -> ${CONDITION_EN_TO_VI[en]}: đã sửa ${result.modifiedCount} sản phẩm`);
        totalUpdated += result.modifiedCount;
      }
    }

    if (totalUpdated === 0) {
      console.log('Không có sản phẩm nào dùng condition tiếng Anh (New, Like New, ...).');
    } else {
      console.log(`\nTổng cộng đã chuẩn hóa ${totalUpdated} sản phẩm sang tình trạng tiếng Việt.`);
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

