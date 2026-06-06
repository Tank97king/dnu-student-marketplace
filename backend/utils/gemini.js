const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

let genAI = null;
let currentModelName = null;
let model = null;

// Thứ tự ưu tiên: Ưu tiên model hoạt động tốt nhất gemini-2.5-flash, tiếp đến các model khác để tránh 404/429
const MODEL_NAMES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-pro'
];

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey.trim());
  }
  if (!model) {
    currentModelName = MODEL_NAMES[0];
    model = genAI.getGenerativeModel({ model: currentModelName });
  }
  return model;
}

/**
 * Gọi Gemini generateContent (one-shot). Tự thử model khác nếu 404.
 * @param {string} prompt
 * @returns {Promise<string|null>} Text response hoặc null nếu lỗi
 */
async function generateContent(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey.trim());

  let lastError = null;
  for (const modelName of MODEL_NAMES) {
    try {
      const m = genAI.getGenerativeModel({ model: modelName });
      const result = await m.generateContent(prompt);
      const response = await result.response;
      if (modelName !== currentModelName) {
        currentModelName = modelName;
        model = m;
        console.log('Gemini using model:', modelName);
      }
      return response.text();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      const is404 = msg.includes('404') || msg.includes('not found');
      const is429 = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
      if (is404 || is429) {
        continue;
      }
      console.error('Gemini generateContent error:', msg);
      return null;
    }
  }
  if (lastError && process.env.NODE_ENV !== 'test') {
    console.warn('Gemini: tất cả model đều lỗi (404/429). Dùng fallback nếu có.');
  }
  return null;
}

// Embedding models hỗ trợ embedContent (lấy từ ListModels)
const EMBEDDING_MODELS = [
  'models/gemini-embedding-001',          // ✅ Stable — 3072 chiều
  'models/gemini-embedding-2-preview',    // Preview backup
  'embedding-001',                        // Legacy fallback
];

/**
 * Tạo embedding vector cho một đoạn text (dùng cho Semantic Search).
 * Tự thử model kế tiếp nếu gặp 404 (model không hỗ trợ).
 * @param {string} text
 * @returns {Promise<number[]|null>} Mảng số float (768 chiều) hoặc null nếu lỗi
 */
async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) return null;
  if (!text || !text.trim()) return null;

  if (!genAI) genAI = new GoogleGenerativeAI(apiKey.trim());

  for (const modelName of EMBEDDING_MODELS) {
    try {
      const embeddingModel = genAI.getGenerativeModel({ model: modelName });
      const result = await embeddingModel.embedContent(text.trim().slice(0, 2000));
      const values = result?.embedding?.values;
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
    } catch (err) {
      const msg = err.message || '';
      const is404 = msg.includes('404') || msg.includes('not found') || msg.includes('not supported');
      const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('Too Many');
      if (is404) {
        // Thử model tiếp theo
        continue;
      }
      if (is429) {
        // Hết quota — không thử tiếp (tránh spam)
        console.warn(`[Embedding] Hết quota (${modelName}). Thử lại sau.`);
        return null;
      }
      console.error(`[Embedding] Lỗi model ${modelName}:`, msg);
      continue;
    }
  }
  console.warn('[Embedding] Tất cả embedding model đều thất bại.');
  return null;
}

module.exports = { getModel, generateContent, generateEmbedding };
