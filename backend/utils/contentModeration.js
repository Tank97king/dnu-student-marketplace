const { generateContent } = require('./gemini');

const CATEGORIES = 'Sách, Điện tử, Quần áo, Nội thất, Văn phòng phẩm, Thể thao, Khác';

/**
 * Kiểm duyệt nội dung title + description bằng Gemini.
 * @returns {Promise<{ status: 'safe'|'review'|'reject', reason?: string }>}
 */
async function moderateContent(title, description) {
  const text = [title, description].filter(Boolean).join('\n');
  if (!text.trim()) return { status: 'safe' };

  const prompt = `Bạn là bộ lọc kiểm duyệt nội dung cho sàn mua bán đồ cũ sinh viên.
Đánh giá nội dung sau (tiêu đề và mô tả sản phẩm) xem có vi phạm: spam, lừa đảo, từ ngữ nhạy cảm, quảng cáo trái phép, nội dung không phù hợp.
Trả lời ĐÚNG theo format JSON sau, không thêm gì khác:
{"status":"safe"} hoặc {"status":"review","reason":"lý do ngắn"} hoặc {"status":"reject","reason":"lý do ngắn"}

Nội dung cần kiểm tra:
---
${text.slice(0, 2000)}
---`;

  const response = await generateContent(prompt);
  if (!response) return { status: 'safe' };

  try {
    const jsonStr = response.replace(/```json?\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    const status = ['safe', 'review', 'reject'].includes(parsed.status) ? parsed.status : 'safe';
    return { status, reason: parsed.reason || undefined };
  } catch {
    return { status: 'safe' };
  }
}

module.exports = { moderateContent };
