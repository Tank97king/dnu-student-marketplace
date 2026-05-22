/**
 * ============================================================
 *  set-default-avatars.js
 *  Script gán avatar mặc định DNU cho các tài khoản chưa có avatar.
 *  Suy đoán giới tính dựa vào tên đệm/tên cuối trong tiếng Việt.
 *
 *  Chạy: node scripts/set-default-avatars.js
 *        hoặc dùng file set-default-avatars.bat
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// ─── CẤU HÌNH ────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace';

// Đường dẫn avatar – phục vụ từ thư mục public của frontend
const AVATAR_MALE   = '/avatars/default_male.png';
const AVATAR_FEMALE = '/avatars/default_female.png';

// ─── TỪ ĐIỂN GIỚI TÍNH TIẾNG VIỆT ──────────────────────────────────────────
// Tên đệm / tên cuối thường gặp của nữ (chữ thường, không dấu dùng để so sánh)
const FEMALE_NAME_HINTS = new Set([
  // Tên đệm nữ phổ biến
  'thi', 'thi', 'kim', 'ngoc', 'bich', 'thu', 'le', 'hong', 'phuong',
  'lan', 'linh', 'nhu', 'mai', 'nhung', 'ha', 'huong', 'loan',
  'yen', 'thuy', 'van', 'khanh', 'thu', 'xuan', 'hoa', 'oanh',
  // Tên cuối nữ phổ biến
  'anh', 'chi', 'dao', 'diem', 'dung', 'giang', 'hang', 'hanh',
  'hien', 'hoa', 'hong', 'huong', 'khanh', 'lan', 'lanh', 'le',
  'lien', 'linh', 'loan', 'mai', 'minh', 'my', 'na', 'ngoc',
  'nhan', 'nhung', 'nu', 'oanh', 'phuong', 'quyen', 'tham', 'thanh',
  'thao', 'thi', 'thoa', 'thom', 'thu', 'thuan', 'thuy', 'tien',
  'tram', 'trang', 'trinh', 'tuyen', 'uyen', 'van', 'vui', 'yen',
  'vy', 'nhi', 'ngan', 'nga', 'hue', 'hien', 'hao', 'gam',
  'cam', 'bich', 'chau', 'dan', 'dieu', 'doan', 'dung', 'gioi',
  'hoa', 'huyen', 'kieu', 'linh', 'luu', 'ly', 'man', 'minhchau',
  'minhngoc', 'minhthu', 'nhuquynh', 'nuong', 'pham', 'phung', 'quynh',
  'rut', 'suong', 'thi', 'thien', 'trang', 'truc', 'xuan',
]);

/**
 * Chuyển chuỗi tiếng Việt về dạng không dấu, chữ thường.
 * Dùng để so sánh tên với từ điển.
 */
function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Suy đoán giới tính từ họ tên đầy đủ tiếng Việt.
 * Logic: ưu tiên kiểm tra tên đệm "Thị" (nữ) hoặc "Văn"/"Đức"/"Hữu" (nam),
 *        sau đó kiểm tra tên cuối trong từ điển nữ.
 * Trả về: 'female' | 'male'
 */
function guessGender(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'male';

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return 'male';

  // Tên cuối (last name part)
  const lastName = parts[parts.length - 1];
  const lastNameNorm = removeVietnameseTones(lastName);

  // Tên đệm (middle parts, bỏ họ)
  const middleParts = parts.slice(1, -1).map(removeVietnameseTones);

  // ── Dấu hiệu nữ rõ ràng ──
  // "Thị" là tên đệm chỉ nữ gần như chắc chắn
  if (middleParts.includes('thi')) return 'female';

  // ── Dấu hiệu nam rõ ràng ──
  const malePrefixes = ['van', 'duc', 'huu', 'the', 'quoc', 'dinh', 'cong', 'trong', 'xuan', 'gia', 'bao', 'minh', 'hung', 'duy'];
  if (middleParts.some(m => malePrefixes.includes(m))) return 'male';

  // ── Kiểm tra tên cuối trong từ điển nữ ──
  if (FEMALE_NAME_HINTS.has(lastNameNorm)) return 'female';

  // ── Mặc định: nam ──
  return 'male';
}

// ─── HÀM CHÍNH ───────────────────────────────────────────────────────────────

async function setDefaultAvatars() {
  console.log('\n======================================================');
  console.log('  DNU Marketplace – Gán Avatar Mặc Định');
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

  // Tìm tất cả user CHƯA có avatar (avatar rỗng, null, undefined, hoặc placeholder cũ)
  const emptyAvatarCondition = {
    $or: [
      { avatar: { $exists: false } },
      { avatar: null },
      { avatar: '' },
      { avatar: { $regex: /^https?:\/\/(via\.placeholder|ui-avatars\.com|placehold)/ } }
    ]
  };

  const users = await User.find(emptyAvatarCondition).select('_id name avatar');
  const total = users.length;

  if (total === 0) {
    console.log('🎉 Tất cả tài khoản đã có avatar! Không cần cập nhật.\n');
    await mongoose.disconnect();
    return;
  }

  console.log(`🔍 Tìm thấy ${total} tài khoản chưa có avatar. Đang xử lý...\n`);

  let updatedMale   = 0;
  let updatedFemale = 0;
  let errors        = 0;

  for (const user of users) {
    const gender = guessGender(user.name);
    const avatarUrl = gender === 'female' ? AVATAR_FEMALE : AVATAR_MALE;

    try {
      await User.updateOne({ _id: user._id }, { $set: { avatar: avatarUrl } });

      const genderLabel = gender === 'female' ? '👩 Nữ' : '👨 Nam';
      console.log(`  ✔ [${genderLabel}] ${user.name.padEnd(30)} → ${avatarUrl}`);

      if (gender === 'female') updatedFemale++;
      else updatedMale++;
    } catch (err) {
      console.error(`  ✗ Lỗi khi cập nhật user "${user.name}": ${err.message}`);
      errors++;
    }
  }

  // ─── Tổng kết ───
  console.log('\n======================================================');
  console.log('  KẾT QUẢ:');
  console.log(`  ✅ Thành công  : ${updatedMale + updatedFemale} / ${total} tài khoản`);
  console.log(`  👨 Nam         : ${updatedMale} tài khoản  → ${AVATAR_MALE}`);
  console.log(`  👩 Nữ          : ${updatedFemale} tài khoản  → ${AVATAR_FEMALE}`);
  if (errors > 0) console.log(`  ❌ Lỗi         : ${errors} tài khoản`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB.\n');
}

// ─── KHỞI CHẠY ───────────────────────────────────────────────────────────────

setDefaultAvatars().catch(err => {
  console.error('\n❌ Lỗi không mong muốn:', err);
  mongoose.disconnect();
  process.exit(1);
});
