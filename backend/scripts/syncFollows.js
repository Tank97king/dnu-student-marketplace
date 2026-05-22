/**
 * ============================================================
 *  syncFollows.js
 *  Script đồng bộ dữ liệu follow, sửa lỗi bất đồng bộ giữa
 *  bảng Follow và các mảng followers/following trong bảng User.
 *
 *  Chạy: node scripts/syncFollows.js
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Follow = require('../models/Follow');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace';

async function syncFollows() {
  console.log('\n======================================================');
  console.log('  DNU Marketplace – Đồng Bộ Dữ Liệu Follow');
  console.log('======================================================\n');

  // Kết nối MongoDB
  console.log(`📡 Đang kết nối tới MongoDB: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!\n');
  } catch (err) {
    console.error('❌ Không thể kết nối MongoDB:', err.message);
    process.exit(1);
  }

  // 1. Tạo các bản ghi Follow còn thiếu từ mảng following của User
  console.log('🔄 Bước 1: Quét mảng following của User để tạo các bản ghi Follow còn thiếu...');
  const users = await User.find({});
  let createdFollows = 0;
  let skippedSelfFollows = 0;

  for (const user of users) {
    const followingArray = user.following || [];
    for (const followingId of followingArray) {
      // Bỏ qua nếu follow chính mình
      if (user._id.toString() === followingId.toString()) {
        skippedSelfFollows++;
        continue;
      }

      // Kiểm tra xem đã có bản ghi trong bảng Follow chưa
      const exists = await Follow.findOne({
        followerId: user._id,
        followingId: followingId
      });

      if (!exists) {
        try {
          await Follow.create({
            followerId: user._id,
            followingId: followingId
          });
          createdFollows++;
          console.log(`  ➕ Tạo liên kết: ${user.name} (ID: ${user._id}) -> Follows -> User ID: ${followingId}`);
        } catch (err) {
          // Bỏ qua lỗi duplicate key nếu có trùng lặp đồng thời
          if (err.code !== 11000) {
            console.error(`  ✗ Lỗi khi tạo follow cho ${user.name}:`, err.message);
          }
        }
      }
    }
  }

  console.log(`\n  -> Đã tạo thêm ${createdFollows} bản ghi Follow.`);
  if (skippedSelfFollows > 0) {
    console.log(`  -> Đã bỏ qua ${skippedSelfFollows} liên kết tự follow chính mình.`);
  }

  // 2. Đồng bộ lại đếm số lượng và mảng followers/following của tất cả User dựa trên bảng Follow
  console.log('\n🔄 Bước 2: Đồng bộ đếm số lượng và danh sách mảng trên User dựa trên bảng Follow...');
  let updatedUsers = 0;

  const allUsers = await User.find({});
  for (const user of allUsers) {
    // Tìm các bản ghi Follow mà user này đi follow người khác
    const followingDocs = await Follow.find({ followerId: user._id });
    const followingIds = followingDocs.map(f => f.followingId);

    // Tìm các bản ghi Follow mà người khác follow user này
    const followerDocs = await Follow.find({ followingId: user._id });
    const followerIds = followerDocs.map(f => f.followerId);

    // Cập nhật lại User document
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          following: followingIds,
          followingCount: followingIds.length,
          followers: followerIds,
          followerCount: followerIds.length
        }
      }
    );
    updatedUsers++;
  }

  console.log(`\n  -> Đã đồng bộ và cập nhật lại mảng & bộ đếm cho ${updatedUsers} người dùng.`);

  // 3. Kết thúc
  console.log('\n======================================================');
  console.log('  HOÀN THÀNH ĐỒNG BỘ!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB.\n');
}

syncFollows().catch(err => {
  console.error('\n❌ Lỗi hệ thống trong quá trình đồng bộ:', err);
  mongoose.disconnect();
  process.exit(1);
});
