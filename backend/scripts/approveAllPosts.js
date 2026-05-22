const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Post = require('../models/Post');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace';

async function run() {
  console.log(`📡 Đang kết nối tới MongoDB: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!\n');

    const result = await Post.updateMany({ isApproved: false }, { isApproved: true });
    console.log(`✅ Đã phê duyệt thành công ${result.modifiedCount} bài viết trong cơ sở dữ liệu.\n`);
  } catch (err) {
    console.error('❌ Có lỗi xảy ra:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.\n');
  }
}

run().catch(console.error);
