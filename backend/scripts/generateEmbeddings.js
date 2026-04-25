/**
 * generateEmbeddings.js
 * Script chạy 1 lần để tạo embedding cho toàn bộ sản phẩm hiện có trong MongoDB.
 * Chạy: cd backend && node scripts/generateEmbeddings.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Product = require('../models/Product');
const { embedAndSaveProduct, countIndexedProducts } = require('../utils/embeddingService');

const BATCH_SIZE = 5;         // Mỗi lần xử lý 5 sản phẩm (tránh spam Gemini API)
const DELAY_MS    = 1200;     // Chờ 1.2s giữa mỗi batch (tránh 429 quota)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await connectDB();

  const total = await Product.countDocuments({ isApproved: true, status: 'Available' });
  console.log(`\n📦 Tổng sản phẩm cần embed: ${total}`);

  const beforeCount = await countIndexedProducts();
  console.log(`📊 Đã có trong vector index: ${beforeCount}\n`);

  const products = await Product.find({ isApproved: true, status: 'Available' })
    .select('_id title description category tags')
    .lean();

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Đang embed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${i + 1}–${Math.min(i + BATCH_SIZE, products.length)}/${products.length})`);

    const results = await Promise.allSettled(
      batch.map(p => embedAndSaveProduct(p))
    );

    results.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value === true) {
        success++;
        console.log(`  ✅ ${batch[idx].title}`);
      } else {
        failed++;
        console.log(`  ❌ ${batch[idx].title}`);
      }
    });

    if (i + BATCH_SIZE < products.length) {
      await sleep(DELAY_MS);
    }
  }

  const afterCount = await countIndexedProducts();

  console.log('\n========== Kết quả ==========');
  console.log(`✅ Thành công : ${success}`);
  console.log(`❌ Thất bại   : ${failed}`);
  console.log(`📊 Vector index: ${afterCount} sản phẩm`);
  console.log('=================================\n');
  console.log('✨ Xong! Bây giờ bạn có thể dùng POST /api/search/semantic');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi script:', err);
  process.exit(1);
});
