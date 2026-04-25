const { generateContent } = require('./gemini');

/**
 * Phân tích sentiment của đoạn text (đánh giá) bằng Gemini.
 * @param {string} text - Nội dung đánh giá
 * @returns {Promise<{ sentiment: 'positive'|'neutral'|'negative', score: number }>}
 */
async function analyzeSentiment(text) {
  if (!text || !text.trim()) return { sentiment: 'neutral', score: 3 };

  const prompt = `Phân tích cảm xúc của đánh giá sau (tích cực, trung lập hay tiêu cực).
Trả lời ĐÚNG theo JSON sau, không thêm gì khác:
{"sentiment":"positive"} hoặc {"sentiment":"neutral"} hoặc {"sentiment":"negative"}, và {"score": số từ 1 đến 5}
Ví dụ: {"sentiment":"positive","score":4}

Đánh giá:
---
${text.slice(0, 1000)}
---`;

  const response = await generateContent(prompt);
  if (!response) return { sentiment: 'neutral', score: 3 };

  try {
    const jsonStr = response.replace(/```json?\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    const sentiment = ['positive', 'neutral', 'negative'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral';
    const score = typeof parsed.score === 'number' ? Math.min(5, Math.max(1, parsed.score)) : 3;
    return { sentiment, score };
  } catch {
    return { sentiment: 'neutral', score: 3 };
  }
}

module.exports = { analyzeSentiment };
