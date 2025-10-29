# 🚀 Hướng dẫn chạy DNU Marketplace nhanh chóng

## Cách 1: Chạy bằng file .bat (Đơn giản nhất!)

### Bước 1: Chạy Frontend (để xem giao diện)

1. Mở File Explorer và vào thư mục dự án:
   `D:\4 Năm ĐH\ĐỒ ÁN`

2. Double-click vào file: **`frontend\run-frontend.bat`**

3. Đợi cài đặt dependencies (lần đầu tiên mất vài phút)

4. Trình duyệt sẽ tự động mở tại: http://localhost:3000

### Bước 2: Chạy Backend (nếu cần test API)

1. Double-click vào file: **`backend\run-backend.bat`**

2. Backend sẽ chạy tại: http://localhost:5000

**Lưu ý:** Backend cần MongoDB đang chạy. Nếu chưa có, dùng MongoDB Atlas (miễn phí).

---

## Cách 2: Chạy bằng Command Line

### Mở PowerShell hoặc Command Prompt

### Chạy Frontend:
```powershell
cd frontend
npm install
npm run dev
```

### Chạy Backend (terminal khác):
```powershell
cd backend
npm install
npm run dev
```

---

## ⚠️ Nếu gặp lỗi:

### Lỗi: "cannot find module"
```powershell
# Xóa node_modules và cài lại
Remove-Item -Recurse -Force node_modules
npm install
```

### Lỗi: "port 3000 already in use"
```powershell
# Đổi port trong vite.config.js
port: 3001
```

### Backend không chạy được:
- Kiểm tra MongoDB: Download tại https://www.mongodb.com/try/download/community
- Hoặc dùng MongoDB Atlas (free): https://www.mongodb.com/atlas

---

## 📌 Quan trọng:

1. **Frontend (.env)**: Đã tự động được tạo với `VITE_API_URL=http://localhost:5000/api`

2. **Backend (.env)**: Cần tạo file `.env` trong thư mục `backend/` (copy từ `env.example`)

3. **MongoDB**: 
   - Local: Cài MongoDB Community Server
  

---

## ✨ Bạn có thể xem giao diện ngay bây giờ!

Chỉ cần chạy frontend trước (không cần backend) để xem giao diện:
- Trang chủ
- Đăng ký/Đăng nhập
- Danh sách sản phẩm
- Chi tiết sản phẩm
- Profile
- Chat (sẽ không có dữ liệu thật)

---

## 🔥 Tips:

- Dùng VS Code với extension "Live Server" để preview nhanh
- Hoặc dùng `npm run dev` để chạy development server
- Mở 2 terminal: 1 cho backend, 1 cho frontend

