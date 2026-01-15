const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');

describe('Auth API Tests', () => {
  beforeAll(async () => {
    // Kết nối database test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dnu-marketplace-test');
    }
  });

  afterAll(async () => {
    // Dọn dẹp sau khi test
    await User.deleteMany({ email: /test@dnu\.edu\.vn$/ });
    await PendingRegistration.deleteMany({ email: /test@dnu\.edu\.vn$/ });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123456',
          name: 'Test User',
          phone: '0123456789'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if email is not @dnu.edu.vn', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@gmail.com',
          password: '123456',
          name: 'Test User',
          phone: '0123456789'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@dnu.edu.vn',
          password: '12345',
          name: 'Test User',
          phone: '0123456789'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if phone is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@dnu.edu.vn',
          password: '123456',
          name: 'Test User',
          phone: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if name is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@dnu.edu.vn',
          password: '123456',
          name: 'A',
          phone: '0123456789'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '123456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@dnu.edu.vn'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgotpassword', () => {
    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/forgotpassword')
        .send({
          email: 'invalid-email'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
