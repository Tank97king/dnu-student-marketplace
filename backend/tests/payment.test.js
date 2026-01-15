const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

describe('Payment API Validation Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Kết nối database test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/payments', () => {
    it('should return 400 if orderId is missing', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          amount: 100000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if orderId is invalid', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          orderId: 'invalid-id',
          amount: 100000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if amount is missing', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          orderId: '507f1f77bcf86cd799439011'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if amount is not positive', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          orderId: '507f1f77bcf86cd799439011',
          amount: -100
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/payments/:id/upload-proof', () => {
    it('should return 400 if payment ID is invalid', async () => {
      const res = await request(app)
        .put('/api/payments/invalid-id/upload-proof')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          notes: 'Test notes'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if notes is too long', async () => {
      const longNotes = 'a'.repeat(501);
      const res = await request(app)
        .put('/api/payments/507f1f77bcf86cd799439011/upload-proof')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`)
        .send({
          notes: longNotes
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
