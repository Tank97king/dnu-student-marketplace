# Hướng dẫn chạy DNU Marketplace

## Yêu cầu hệ thống

1. **Node.js** (phiên bản 16 trở lên) - [Download](https://nodejs.org/)
2. **MongoDB** - Có 2 lựa chọn:

   **Lựa chọn 1: MongoDB Local**
   - Download MongoDB Community Server: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Cài đặt và chạy MongoDB service

   **Lựa chọn 2: MongoDB Atlas (Cloud - Miễn phí)**
   - Đăng ký tại: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Tạo cluster miễn phí
   - Lấy connection string

3. **Cloudinary Account** (cho upload ảnh) - [https://cloudinary.com](https://cloudinary.com)
4. **Email Service** (Gmail hoặc SendGrid) cho xác minh email

## Các bước chạy dự án

### Bước 1: Cài đặt MongoDB

**Nếu dùng MongoDB Local:**
```powershell
# Kiểm tra MongoDB đã được cài đặt chưa
mongod --version

# Nếu chưa cài, download và cài đặt MongoDB
# Sau khi cài đặt, khởi động MongoDB service
Start-Service MongoDB
```

**Nếu dùng MongoDB Atlas:**
- Đăng ký tài khoản tại https://www.mongodb.com/atlas
- Tạo cluster miễn phí
- Database Access > Add New Database User
- Network Access > Add IP Address (0.0.0.0/0 để allow from anywhere)
- Lấy connection string: Database > Connect > Connect your application

### Bước 2: Setup Backend

```powershell
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
# Sao chép nội dung từ env.example và chỉnh sửa:

PORT=5000
NODE_ENV=development

# MongoDB - Nếu dùng local:
MONGODB_URI=mongodb://localhost:27017/dnu-marketplace

# MongoDB - Nếu dùng Atlas (thay YOUR_CONNECTION_STRING):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dnu-marketplace

# JWT
JWT_SECRET=dnu-marketplace-secret-key-2024-change-in-production
JWT_EXPIRE=7d

# Cloudinary (Đăng ký tại https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail hoặc SendGrid)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Lưu ý quan trọng:**
- Cloudinary: Có thể để trống nếu chưa cấu hình (sẽ báo lỗi khi upload ảnh)
- Email: Có thể để trống nếu chưa cần tính năng gửi email

### Bước 3: Chạy Backend

```powershell
# Chạy backend (development mode với nodemon)
npm run dev

# Hoặc chạy production mode
npm start
```

Backend sẽ chạy tại: **http://localhost:5000**

### Bước 4: Setup Frontend

Mở terminal mới:

```powershell
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
# Tạo file .env với nội dung:
VITE_API_URL=http://localhost:5000/api
```

### Bước 5: Chạy Frontend

```powershell
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## Kiểm tra ứng dụng

1. Mở trình duyệt: http://localhost:3000
2. Đăng ký tài khoản mới (email phải có đuôi @dnu.edu.vn)
3. Đăng nhập và bắt đầu sử dụng

## Troubleshooting

### Backend không chạy được

**Lỗi: "MongooseError: connect ECONNREFUSED"**
- Nguyên nhân: MongoDB chưa được cài đặt hoặc chưa chạy
- Giải pháp: Cài đặt và khởi động MongoDB service

```powershell
# Kiểm tra MongoDB đang chạy
Get-Service MongoDB

# Nếu chưa chạy, khởi động
Start-Service MongoDB
```

**Lỗi: "Cannot find module"**
- Giải pháp: Chạy `npm install` lại

```powershell
cd backend
npm install
```

### Frontend không kết nối được với Backend

**Kiểm tra:**
1. Backend đang chạy tại http://localhost:5000
2. File `frontend/.env` có nội dung đúng:
```
VITE_API_URL=http://localhost:5000/api
```

### Upload ảnh không hoạt động

**Nguyên nhân:** Chưa cấu hình Cloudinary
- Đăng ký tại https://cloudinary.com
- Vào Dashboard > Settings để lấy credentials
- Cập nhật vào `backend/.env`

## Cấu trúc Database

Dự án sử dụng MongoDB với các collections sau:
- `users` - Thông tin người dùng
- `products` - Sản phẩm
- `messages` - Tin nhắn chat
- `comments` - Bình luận sản phẩm
- `reviews` - Đánh giá sau giao dịch

## API Testing

Bạn có thể test API bằng Postman hoặc curl:

```powershell
# Health check
curl http://localhost:5000/api/health

# Lấy danh sách sản phẩm
curl http://localhost:5000/api/products
```

## Deploy lên Production

### Backend: Deploy lên Railway, Heroku, hoặc AWS
### Frontend: Deploy lên Vercel hoặc Netlify

Chi tiết xem trong README.md

## Cần hỗ trợ?

Nếu gặp vấn đề, hãy kiểm tra:
1. Node.js version >= 16
2. MongoDB đang chạy
3. File .env được cấu hình đúng
4. Port 5000 và 3000 chưa bị sử dụng


