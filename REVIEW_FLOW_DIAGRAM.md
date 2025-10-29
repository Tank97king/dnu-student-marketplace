# Luồng hoạt động chức năng Đánh giá sản phẩm

## User Journey Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User mua sản  │───▶│   Hoàn thành    │───▶│   Nhận thông    │
│   phẩm thành    │    │   giao dịch     │    │   báo đánh giá  │
│   công          │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Xem đánh giá  │◀───│   Đánh giá      │◀───│   Truy cập trang │
│   của người     │    │   được hiển     │    │   chi tiết sản   │
│   khác          │    │   thị công khai  │    │   phẩm           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technical Flow

```
Frontend (React)          Backend (Node.js)           Database (MongoDB)
     │                           │                           │
     │── POST /api/reviews ─────▶│                           │
     │                           │── Create Review ─────────▶│
     │                           │                           │
     │── Update User Rating ────▶│                           │
     │                           │── Update Stats ──────────▶│
     │                           │                           │
     │◀─── Review Data ──────────│◀─── Review Object ────────│
     │                           │                           │
     │── GET /api/reviews/... ──▶│                           │
     │                           │── Query Reviews ────────▶│
     │                           │                           │
     │◀─── Reviews List ────────│◀─── Reviews Array ────────│
```

## Component Hierarchy

```
ProductDetail.jsx
├── ReviewSection.jsx
│   ├── StarRating.jsx (for display)
│   ├── StarRating.jsx (for input)
│   └── ReviewForm
└── Other components...

Profile.jsx
├── StarRating.jsx (for user rating display)
└── Link to UserReviews.jsx

UserReviews.jsx
├── StarRating.jsx (for stats display)
├── ReviewList
└── Pagination
```

## API Request/Response Examples

### Create Review
```javascript
// Request
POST /api/reviews
{
  "transactionId": "transaction_123",
  "reviewedUserId": "user_id_456",
  "productId": "product_id_789",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!",
  "isSeller": false
}

// Response
{
  "success": true,
  "message": "Đánh giá thành công",
  "data": {
    "_id": "review_id_123",
    "rating": 5,
    "comment": "Sản phẩm rất tốt!",
    "reviewerId": {
      "name": "Nguyễn Văn A",
      "avatar": "avatar_url"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Product Reviews
```javascript
// Request
GET /api/reviews/product/product_id_789?page=1&limit=10

// Response
{
  "success": true,
  "data": [
    {
      "_id": "review_id_123",
      "rating": 5,
      "comment": "Sản phẩm rất tốt!",
      "reviewerId": {
        "name": "Nguyễn Văn A",
        "avatar": "avatar_url"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 25
  }
}
```

### Get User Review Stats
```javascript
// Request
GET /api/reviews/user/user_id_456/stats

// Response
{
  "success": true,
  "data": {
    "averageRating": 4.2,
    "totalReviews": 15,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 5,
      "5": 7
    }
  }
}
```

## Database Indexes

```javascript
// Review collection indexes
db.reviews.createIndex({ "reviewedUserId": 1 })
db.reviews.createIndex({ "transactionId": 1 })
db.reviews.createIndex({ "productId": 1 })
db.reviews.createIndex({ "createdAt": -1 })

// User collection indexes (for rating queries)
db.users.createIndex({ "rating.average": -1 })
db.users.createIndex({ "rating.count": -1 })

// Product collection indexes (for rating queries)
db.products.createIndex({ "averageRating": -1 })
db.products.createIndex({ "totalReviews": -1 })
```

## Error Handling

```
┌─────────────────┐
│   User Action   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │
│   - Rating 1-5  │
│   - User exists │
│   - Not duplicate│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│   Operation     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Success/Error │
│   Response      │
└─────────────────┘
```

## Security Considerations

1. **Authentication**: JWT token required for create/update/delete
2. **Authorization**: Users can only modify their own reviews
3. **Validation**: Server-side validation for all inputs
4. **Rate Limiting**: Prevent spam reviews
5. **Content Moderation**: Filter inappropriate content
6. **Data Sanitization**: Clean user inputs before storage
