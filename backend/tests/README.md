# Tests Documentation

## Cài đặt

```bash
npm install --save-dev jest supertest
```

## Chạy tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy tests với coverage
npm test -- --coverage
```

## Cấu trúc Tests

- `auth.test.js` - Tests cho authentication APIs
- `payment.test.js` - Tests cho payment APIs

## Test Environment

Tests sử dụng database test riêng. Đảm bảo có MongoDB test database hoặc set `MONGODB_URI` trong `.env` để trỏ đến test database.

## Viết Tests Mới

```javascript
const request = require('supertest');
const { app } = require('../server');

describe('Feature Name', () => {
  it('should do something', async () => {
    const res = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```
