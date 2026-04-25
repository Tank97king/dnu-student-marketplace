/**
 * indexKnowledge.js
 * Script chạy 1 lần để embed toàn bộ knowledge base (FAQ, guide, policy)
 * vào knowledge vector index.
 *
 * Chạy: cd backend && node scripts/indexKnowledge.js
 * Hoặc: npm run index-knowledge
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { indexKnowledgeBase, loadKnowledgeChunks } = require('../utils/ragService');

async function main() {
  console.log('\n🧠 Bắt đầu index Knowledge Base cho RAG Chatbot...\n');

  const chunks = loadKnowledgeChunks();
  if (chunks.length === 0) {
    console.error('❌ Không có chunk nào! Kiểm tra thư mục backend/data/knowledge/');
    process.exit(1);
  }

  console.log(`📄 Tổng số chunks cần index: ${chunks.length}`);
  console.log('   (Mỗi chunk = 1 đoạn FAQ / hướng dẫn / chính sách)\n');

  const count = await indexKnowledgeBase(true); // force = true để re-index

  console.log('\n========== Kết quả ==========');
  console.log(`✅ Đã index thành công: ${count}/${chunks.length} chunks`);
  console.log('📂 Knowledge index lưu tại: backend/data/knowledge_index/');
  console.log('===============================\n');

  if (count > 0) {
    console.log('✨ Xong! RAG Chatbot đã sẵn sàng trả lời câu hỏi về:');
    console.log('   - FAQ (câu hỏi thường gặp)');
    console.log('   - Hướng dẫn sử dụng app');
    console.log('   - Chính sách và quy định\n');
  } else {
    console.warn('⚠️  Không index được chunk nào. Kiểm tra GEMINI_API_KEY trong .env');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi script:', err);
  process.exit(1);
});
