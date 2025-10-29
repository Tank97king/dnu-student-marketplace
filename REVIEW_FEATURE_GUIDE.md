# Hướng dẫn sử dụng chức năng Đánh giá sản phẩm

## Tổng quan
Chức năng đánh giá sản phẩm cho phép người dùng đánh giá và nhận xét về sản phẩm sau khi mua bán, giúp tăng độ tin cậy và minh bạch trong giao dịch.

## Tính năng chính

### 1. Đánh giá sản phẩm
- **Rating**: Đánh giá từ 1-5 sao
- **Comment**: Nhận xét chi tiết về sản phẩm
- **Seller flag**: Đánh dấu nếu người đánh giá là người bán

### 2. Hiển thị thống kê
- **Average rating**: Điểm đánh giá trung bình
- **Total reviews**: Tổng số đánh giá
- **Rating distribution**: Phân bố đánh giá theo từng mức sao

### 3. Quản lý đánh giá
- Xem tất cả đánh giá của một sản phẩm
- Xem đánh giá của một người dùng
- Chỉnh sửa/xóa đánh giá của chính mình

## API Endpoints

### Backend Routes
```
POST /api/reviews - Tạo đánh giá mới
GET /api/reviews/product/:productId - Lấy đánh giá của sản phẩm
GET /api/reviews/user/:userId - Lấy đánh giá của người dùng
GET /api/reviews/user/:userId/stats - Lấy thống kê đánh giá
PUT /api/reviews/:reviewId - Cập nhật đánh giá
DELETE /api/reviews/:reviewId - Xóa đánh giá
```

### Frontend Components
- `ReviewSection.jsx` - Component chính để hiển thị và tạo đánh giá
- `StarRating.jsx` - Component hiển thị rating bằng sao
- `UserReviews.jsx` - Trang xem tất cả đánh giá của user

## Cách sử dụng

### 1. Đánh giá sản phẩm
1. Vào trang chi tiết sản phẩm
2. Cuộn xuống phần "Đánh giá sản phẩm"
3. Nhấn "Viết đánh giá"
4. Chọn số sao (1-5)
5. Nhập nhận xét (tùy chọn)
6. Đánh dấu "Tôi là người bán sản phẩm này" nếu cần
7. Nhấn "Gửi đánh giá"

### 2. Xem đánh giá
- **Trong trang sản phẩm**: Cuộn xuống phần đánh giá
- **Trong profile**: Nhấn "Xem tất cả đánh giá"
- **Trang riêng**: Truy cập `/user/:userId/reviews`

### 3. Quản lý đánh giá
- Chỉ có thể chỉnh sửa/xóa đánh giá của chính mình
- Đánh giá được hiển thị theo thời gian mới nhất

## Database Schema

### Review Model
```javascript
{
  transactionId: String,      // ID giao dịch
  reviewerId: ObjectId,      // ID người đánh giá
  reviewedUserId: ObjectId,  // ID người được đánh giá
  productId: ObjectId,       // ID sản phẩm
  rating: Number,            // Điểm đánh giá (1-5)
  comment: String,           // Nhận xét
  isSeller: Boolean,         // Có phải người bán không
  createdAt: Date,          // Thời gian tạo
  updatedAt: Date           // Thời gian cập nhật
}
```

### User Model (đã cập nhật)
```javascript
{
  // ... existing fields
  rating: {
    average: Number,         // Điểm trung bình
    count: Number           // Số lượng đánh giá
  }
}
```

### Product Model (đã cập nhật)
```javascript
{
  // ... existing fields
  averageRating: Number,    // Điểm đánh giá trung bình
  totalReviews: Number      // Tổng số đánh giá
}
```

## Lưu ý quan trọng

1. **Authentication**: Cần đăng nhập để tạo đánh giá
2. **Authorization**: Chỉ có thể chỉnh sửa đánh giá của chính mình
3. **Validation**: Rating phải từ 1-5, comment có thể để trống
4. **Transaction**: Hiện tại sử dụng transactionId tạm thời, cần tích hợp với hệ thống giao dịch thực tế
5. **Real-time**: Đánh giá được cập nhật real-time khi có thay đổi

## Tính năng mở rộng có thể thêm

1. **Reply to reviews**: Cho phép người bán trả lời đánh giá
2. **Review moderation**: Admin có thể kiểm duyệt đánh giá
3. **Review helpfulness**: Đánh giá độ hữu ích của đánh giá
4. **Photo reviews**: Đính kèm hình ảnh trong đánh giá
5. **Review templates**: Mẫu đánh giá có sẵn
6. **Review analytics**: Thống kê chi tiết cho admin

## Troubleshooting

### Lỗi thường gặp
1. **"Bạn đã đánh giá giao dịch này rồi"**: Mỗi transaction chỉ được đánh giá một lần
2. **"Không thể gửi đánh giá"**: Kiểm tra kết nối mạng và đăng nhập
3. **Rating không hiển thị**: Kiểm tra dữ liệu trong database

### Debug
- Kiểm tra console log trong browser
- Kiểm tra network tab trong DevTools
- Kiểm tra database có dữ liệu đánh giá không
- Kiểm tra API endpoints có hoạt động không
