# DNU Marketplace - Ứng dụng mua bán đồ dùng cũ cho sinh viên Đại học Đại Nam

## Mô tả dự án

DNU Marketplace là một nền tảng web cho phép sinh viên Đại học Đại Nam mua bán trao đổi đồ dùng cũ (sách, đồ điện tử, nội thất, quần áo, v.v.) một cách an toàn và thuận tiện.

## 🎓 Tài liệu Đồ án Tốt nghiệp

Để hỗ trợ quá trình viết báo cáo và bảo vệ đồ án tốt nghiệp, dự án đã được bổ sung đầy đủ hệ thống tài liệu chi tiết:
- 📝 **[Đề cương chi tiết đồ án (5 Chương)](./DE_CUONG_CHI_TIET.md)**: Hướng dẫn chi tiết bố cục, nội dung cần triển khai cho từng chương mục trong báo cáo đồ án tốt nghiệp.
- 🏛️ **[Tài liệu Kiến trúc hệ thống](./KIEN_TRUC_HE_THONG.md)**: Bản vẽ kiến trúc tổng quan (Mermaid), mô hình cơ sở dữ liệu (22 Collections MongoDB) và các luồng quy trình nghiệp vụ chính (thanh toán QR động, Chatbot AI RAG, WebSockets).

## Tính năng chính

### Quản lý người dùng
- Đăng ký và đăng nhập với email DNU (@dnu.edu.vn)
- Xác minh email
- Quản lý thông tin cá nhân (tên, số điện thoại, địa chỉ, ảnh đại diện)
- Mã số sinh viên để tăng độ tin cậy
- Khôi phục mật khẩu

### Quản lý sản phẩm
- Đăng bài bán đồ dùng cũ
- Upload tối đa 10 hình ảnh
- Phân loại theo danh mục và tình trạng
- Gắn thẻ và chọn khu vực giao dịch
- Chỉnh sửa và xóa bài đăng

### Tìm kiếm và lọc
- Tìm kiếm theo từ khóa
- Lọc theo giá, danh mục, khu vực, tình trạng
- Sắp xếp theo nhiều tiêu chí

### Tương tác
- Bình luận công khai
- Chat trực tiếp giữa người mua và người bán (Socket.IO)
- Lưu bài đăng vào yêu thích
- Báo cáo bài đăng vi phạm

### Giao dịch
- Gửi đề nghị giá
- Mua ngay (Buy Now) với nhiều phương thức nhận hàng
- Tạo đơn hàng với thông tin giao hàng chi tiết
- Đánh dấu đã bán
- Đánh giá sau giao dịch

### Hệ thống thanh toán ⭐ MỚI
- Tạo thanh toán với mã giao dịch duy nhất
- Quét QR code ngân hàng để chuyển khoản
- Upload ảnh biên lai chuyển khoản
- Admin xác nhận/từ chối thanh toán
- Lịch sử thanh toán cho người mua
- Quản lý thanh toán cho admin
- Tự động hủy thanh toán sau 24h nếu không upload biên lai
- Thông báo real-time về trạng thái thanh toán

### Quản lý Bank QR ⭐ MỚI
- Quản lý QR code ngân hàng (chỉ Super Admin)
- Tạo/cập nhật/xóa QR code
- Hiển thị thông tin ngân hàng và QR code cho người mua
- Kích hoạt/vô hiệu hóa QR code

### Quản trị
- Dashboard với thống kê
- Duyệt bài đăng
- Quản lý người dùng
- Xử lý báo cáo
- Quản lý thanh toán
- Quản lý Bank QR (Super Admin)

### Tự động hóa (Cron Jobs) ⭐ MỚI
- Tự động hủy đơn hàng hết hạn (24 giờ)
- Tự động hết hạn đề nghị giá (7 ngày)
- Tự động hủy thanh toán chưa upload biên lai (24 giờ)
- Thông báo tự động khi hết hạn
- Thông báo thông minh dựa trên hành vi người dùng

### Mạng xã hội & Nội dung ⭐ MỚI
- **Feed**: Xem bài đăng từ người dùng khác
- **Posts**: Đăng bài chia sẻ, review sản phẩm
- **Stories**: Chia sẻ khoảnh khắc 24 giờ
- **Collections**: Tạo bộ sưu tập sản phẩm yêu thích
- **Hashtags**: Gắn thẻ và tìm kiếm theo hashtag
- **Follow/Unfollow**: Theo dõi người dùng khác
- **Notifications**: Thông báo real-time về tương tác

### Chatbot AI ⭐ MỚI
- Chatbot hỗ trợ tự động với Google Gemini AI
- Trả lời câu hỏi thường gặp
- Hướng dẫn sử dụng ứng dụng
- Tìm kiếm sản phẩm thông minh
- Kiểm tra trạng thái đơn hàng
- Rate limiting để tránh spam

### Tìm kiếm & Gợi ý ⭐ MỚI
- Tìm kiếm nâng cao với autocomplete
- Lưu lịch sử tìm kiếm
- Gợi ý sản phẩm dựa trên hành vi
- So sánh sản phẩm
- Xem sản phẩm đã xem

## Công nghệ sử dụng

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO (real-time chat và notifications)
- Cloudinary (image storage)
- Nodemailer (email)
- Multer (file upload)
- bcryptjs (password hashing)
- Cron Jobs (node-cron) cho tự động hóa
- Google Gemini AI (chatbot)
- express-validator (input validation)
- express-rate-limit (rate limiting)
- Helmet.js (security headers)

### Frontend
- React 18
- Redux Toolkit (state management)
- React Router v6
- Tailwind CSS
- Axios
- Socket.IO Client

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js 16+ và npm
- MongoDB (local hoặc MongoDB Atlas)
- Cloudinary account (cho image upload)
- Email service (Gmail hoặc SendGrid)

### Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dnu-marketplace

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google Gemini AI (Optional - cho chatbot)
GEMINI_API_KEY=your-gemini-api-key-here
```

Chạy backend:
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## Cấu trúc dự án

```
.
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── paymentController.js ⭐ MỚI
│   │   ├── bankQRController.js ⭐ MỚI
│   │   └── ...
│   ├── cron/ ⭐ MỚI
│   │   └── orderExpiration.js
│   ├── middleware/
│   ├── models/
│   │   ├── Payment.js ⭐ MỚI
│   │   ├── BankQR.js ⭐ MỚI
│   │   └── ...
│   ├── routes/
│   │   ├── payment.js ⭐ MỚI
│   │   ├── bankQR.js ⭐ MỚI
│   │   └── ...
│   ├── utils/
│   │   ├── generateTransactionCode.js ⭐ MỚI
│   │   └── ...
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BuyNowModal.jsx ⭐ MỚI
│   │   │   ├── PaymentModal.jsx ⭐ MỚI
│   │   │   ├── Toast.jsx ⭐ MỚI
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── MyPayments.jsx ⭐ MỚI
│   │   │   ├── PaymentManagement.jsx ⭐ MỚI
│   │   │   ├── BankQRManagement.jsx ⭐ MỚI
│   │   │   └── ...
│   │   ├── store/
│   │   └── utils/
│   └── public/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify/:token` - Xác minh email
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/forgotpassword` - Quên mật khẩu
- `PUT /api/auth/resetpassword/:token` - Đặt lại mật khẩu

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (authenticated)
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `PUT /api/products/:id/sold` - Đánh dấu đã bán
- `POST /api/products/:id/report` - Báo cáo sản phẩm

### Users
- `GET /api/users/profile/:id` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `POST /api/users/favorites/:productId` - Thêm yêu thích
- `DELETE /api/users/favorites/:productId` - Xóa yêu thích
- `GET /api/users/favorites` - Lấy danh sách yêu thích

### Messages
- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/conversations` - Lấy danh sách cuộc trò chuyện
- `GET /api/messages/:conversationId` - Lấy tin nhắn trong cuộc trò chuyện

### Orders
- `POST /api/orders` - Tạo đơn hàng (Buy Now)
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/confirm` - Xác nhận đơn hàng (seller)
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng
- `PUT /api/orders/:id/complete` - Hoàn thành đơn hàng

### Payments ⭐ MỚI
- `POST /api/payments` - Tạo thanh toán
- `GET /api/payments/order/:orderId` - Lấy thanh toán theo đơn hàng
- `PUT /api/payments/:id/upload-proof` - Upload ảnh biên lai
- `GET /api/payments/my-payments` - Lịch sử thanh toán của người mua
- `GET /api/payments/pending` - Danh sách thanh toán chờ xác nhận (Admin)
- `GET /api/payments` - Tất cả thanh toán (Admin)
- `PUT /api/payments/:id/confirm` - Xác nhận thanh toán (Admin)
- `PUT /api/payments/:id/reject` - Từ chối thanh toán (Admin)

### Bank QR ⭐ MỚI
- `GET /api/bankqr` - Lấy danh sách QR code (Admin)
- `GET /api/bankqr/:id` - Lấy chi tiết QR code (Admin)
- `POST /api/bankqr` - Tạo QR code (Super Admin)
- `PUT /api/bankqr/:id` - Cập nhật QR code (Super Admin)
- `DELETE /api/bankqr/:id` - Xóa QR code (Super Admin)

### Admin
- `GET /api/admin/stats` - Lấy thống kê
- `GET /api/admin/users` - Lấy danh sách users
- `PUT /api/admin/users/:id` - Cập nhật user
- `GET /api/admin/products/pending` - Sản phẩm chờ duyệt
- `PUT /api/admin/products/:id/approve` - Duyệt sản phẩm

### Posts & Feed ⭐ MỚI
- `GET /api/posts` - Lấy danh sách bài đăng (Feed)
- `GET /api/posts/:id` - Lấy chi tiết bài đăng
- `POST /api/posts` - Tạo bài đăng mới
- `PUT /api/posts/:id` - Cập nhật bài đăng
- `DELETE /api/posts/:id` - Xóa bài đăng
- `GET /api/posts/user/:userId` - Lấy bài đăng của user
- `GET /api/posts/hashtag/:hashtag` - Lấy bài đăng theo hashtag

### Stories ⭐ MỚI
- `GET /api/stories` - Lấy danh sách stories
- `GET /api/stories/user/:userId` - Lấy stories của user
- `POST /api/stories` - Tạo story mới
- `DELETE /api/stories/:id` - Xóa story

### Collections ⭐ MỚI
- `GET /api/collections` - Lấy danh sách collections
- `GET /api/collections/:id` - Lấy chi tiết collection
- `POST /api/collections` - Tạo collection mới
- `PUT /api/collections/:id` - Cập nhật collection
- `DELETE /api/collections/:id` - Xóa collection
- `POST /api/collections/:id/products/:productId` - Thêm sản phẩm vào collection

### Hashtags ⭐ MỚI
- `GET /api/hashtags` - Lấy danh sách hashtags phổ biến
- `GET /api/hashtags/:hashtag` - Lấy thông tin hashtag

### Search ⭐ MỚI
- `GET /api/search` - Tìm kiếm tổng hợp (products, posts, users)
- `GET /api/search/autocomplete` - Tìm kiếm gợi ý
- `GET /api/search/history` - Lịch sử tìm kiếm

### Product Recommendations ⭐ MỚI
- `GET /api/recommendations` - Gợi ý sản phẩm cho user
- `GET /api/recommendations/similar/:productId` - Sản phẩm tương tự

### Chatbot ⭐ MỚI
- `POST /api/chatbot/chat` - Chat với AI
- `POST /api/chatbot/clear-history` - Xóa lịch sử chat

### Follow & Social ⭐ MỚI
- `POST /api/users/:userId/follow` - Theo dõi user
- `DELETE /api/users/:userId/follow` - Bỏ theo dõi
- `GET /api/users/:userId/followers` - Lấy danh sách người theo dõi
- `GET /api/users/:userId/following` - Lấy danh sách đang theo dõi

## Tính năng bảo mật

- JWT Authentication
- Password hashing với bcrypt
- Input validation
- Rate limiting
- Helmet.js cho security headers
- CORS protection
- Phân quyền Admin và Super Admin
- Mã giao dịch duy nhất cho mỗi thanh toán
- Xác minh thanh toán bởi admin trước khi xác nhận đơn hàng

## Triển khai

### Backend
- Deploy lên Heroku, Railway, hoặc AWS
- Setup MongoDB Atlas
- Setup Cloudinary
- Configure environment variables

### Frontend
- Build: `npm run build`
- Deploy lên Vercel hoặc Netlify
- Configure VITE_API_URL

## Quy trình thanh toán ⭐ MỚI

1. **Người mua tạo đơn hàng**: Chọn "Mua ngay" và điền thông tin giao hàng
2. **Người bán xác nhận**: Xác nhận đơn hàng trong vòng 24 giờ
3. **Người mua thanh toán**:
   - Click "Thanh toán" để tạo mã giao dịch
   - Quét QR code ngân hàng
   - Chuyển khoản với nội dung là mã giao dịch
   - Upload ảnh biên lai trong vòng 24 giờ
4. **Admin xác nhận**: Admin kiểm tra và xác nhận/từ chối thanh toán
5. **Hoàn tất**: Đơn hàng được xác nhận sau khi thanh toán được duyệt

## Tính năng tự động hóa ⭐ MỚI

Hệ thống tự động chạy các tác vụ định kỳ:

- **Hết hạn đơn hàng**: Đơn hàng chờ xác nhận quá 24 giờ sẽ tự động hủy
- **Hết hạn đề nghị giá**: Đề nghị giá quá 7 ngày sẽ tự động hết hạn
- **Hết hạn thanh toán**: Thanh toán chưa upload biên lai sau 24 giờ sẽ tự động hủy

Tất cả các sự kiện hết hạn đều gửi thông báo real-time cho người dùng liên quan.

## Lưu ý quan trọng

- Mã giao dịch phải được nhập chính xác vào nội dung chuyển khoản
- Người mua có 24 giờ để upload ảnh biên lai sau khi tạo thanh toán
- Chỉ Super Admin mới có thể quản lý Bank QR
- Đơn hàng sẽ tự động hủy nếu không được xác nhận trong 24 giờ
- Stories sẽ tự động hết hạn sau 24 giờ
- Chatbot có rate limiting: tối đa 20 requests/phút

## Scripts tiện ích

Dự án có các file batch script để hỗ trợ phát triển:

- `START_BOTH.bat` - Khởi động cả backend và frontend cùng lúc
- `QUICK_FIX_PORT_5000.bat` - Giải phóng port 5000 nếu bị chiếm
- `SET_SUPER_ADMIN.bat` - Tạo Super Admin
- `INSTALL_CHATBOT.bat` - Cài đặt dependencies cho chatbot
- `LIST_MODELS.bat` - Liệt kê các models trong database
- `PUSH_TO_GITHUB.bat` - Hướng dẫn push code lên GitHub

## Testing

### Chạy tests (nếu có)

```bash
cd backend
npm test
```

### Test API với Postman/Thunder Client

1. Import collection từ file `backend/postman_collection.json` (nếu có)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: JWT token sau khi login

## Troubleshooting

### Lỗi Port đã được sử dụng

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc chạy QUICK_FIX_PORT_5000.bat
```

### Lỗi MongoDB connection

- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra `MONGODB_URI` trong `.env`
- Thử kết nối với MongoDB Compass

### Lỗi Cloudinary upload

- Kiểm tra credentials trong `.env`
- Đảm bảo file ảnh không quá 5MB
- Kiểm tra định dạng file (chỉ hỗ trợ: jpg, jpeg, png, gif, webp)

### Lỗi Email không gửi được

- Kiểm tra `EMAIL_USER` và `EMAIL_PASSWORD`
- Với Gmail, cần tạo App Password (không dùng mật khẩu thường)
- Kiểm tra firewall/antivirus có chặn không

### Chatbot không hoạt động

- Kiểm tra `GEMINI_API_KEY` trong `.env`
- Đảm bảo đã cài `@google/generative-ai`
- Kiểm tra rate limiting (tối đa 20 requests/phút)

## Performance Tips

1. **Database Indexing**: Đã có indexes cho các trường thường query
2. **Pagination**: Tất cả API list đều hỗ trợ pagination
3. **Image Optimization**: Ảnh được upload lên Cloudinary và tự động optimize
4. **Caching**: Có thể thêm caching cho products và posts (xem `GỢI_Ý_CẢI_THIỆN.md`)

## Security Best Practices

1. ✅ **JWT Tokens**: Lưu trong localStorage, có expiration
2. ✅ **Password Hashing**: Sử dụng bcrypt với salt rounds
3. ✅ **Input Validation**: Sử dụng express-validator
4. ✅ **Rate Limiting**: Áp dụng cho chatbot và các API quan trọng
5. ✅ **CORS**: Chỉ cho phép frontend URL
6. ✅ **Helmet**: Security headers tự động
7. ✅ **Environment Variables**: Không commit `.env` file

## Development Workflow

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd "4 Năm ĐH/ĐỒ ÁN"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Tạo file .env và điền thông tin
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Tạo file .env và điền VITE_API_URL
   npm run dev
   ```

4. **Tạo Super Admin** (lần đầu)
   ```bash
   # Chạy SET_SUPER_ADMIN.bat hoặc
   node backend/createAdmin.js
   ```

## Roadmap & Cải thiện

Xem file `GỢI_Ý_CẢI_THIỆN.md` để biết các gợi ý cải thiện:
- Unit tests
- API documentation (Swagger)
- Logging chuyên nghiệp (Winston)
- Caching (Redis/Node-cache)
- Error handling tập trung
- Và nhiều hơn nữa...

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Tác giả

Dự án được phát triển cho sinh viên Đại học Đại Nam

## License

MIT

---

**📚 Tài liệu tham khảo:**
- [DE_CUONG_CHI_TIET.md](./DE_CUONG_CHI_TIET.md) - Đề cương chi tiết đồ án tốt nghiệp 5 chương
- [KIEN_TRUC_HE_THONG.md](./KIEN_TRUC_HE_THONG.md) - Tài liệu phân tích kiến trúc hệ thống và quy trình RAG
- [LOGIC_MUA_HANG.md](./LOGIC_MUA_HANG.md) - Logic chi tiết về quy trình mua hàng
- [GỢI_Ý_CẢI_THIỆN.md](./GỢI_Ý_CẢI_THIỆN.md) - Gợi ý cải thiện dự án
- [HUONG_DAN_PUSH_GITHUB.md](./HUONG_DAN_PUSH_GITHUB.md) - Hướng dẫn push code lên GitHub

