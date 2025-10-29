# DNU Marketplace - Ứng dụng mua bán đồ dùng cũ cho sinh viên Đại học Đà Nẵng

## Mô tả dự án

DNU Marketplace là một nền tảng web cho phép sinh viên Đại học Đà Nẵng mua bán trao đổi đồ dùng cũ (sách, đồ điện tử, nội thất, quần áo, v.v.) một cách an toàn và thuận tiện.

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
- Đánh dấu đã bán
- Đánh giá sau giao dịch

### Quản trị
- Dashboard với thống kê
- Duyệt bài đăng
- Quản lý người dùng
- Xử lý báo cáo

## Công nghệ sử dụng

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO (real-time chat)
- Cloudinary (image storage)
- Nodemailer (email)
- Multer (file upload)
- bcryptjs (password hashing)

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
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
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

### Admin
- `GET /api/admin/stats` - Lấy thống kê
- `GET /api/admin/users` - Lấy danh sách users
- `PUT /api/admin/users/:id` - Cập nhật user
- `GET /api/admin/products/pending` - Sản phẩm chờ duyệt
- `PUT /api/admin/products/:id/approve` - Duyệt sản phẩm

## Tính năng bảo mật

- JWT Authentication
- Password hashing với bcrypt
- Input validation
- Rate limiting
- Helmet.js cho security headers
- CORS protection

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

## Tác giả

Dự án được phát triển cho sinh viên Đại học Đại Nam

## License

MIT

