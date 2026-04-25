# Cấu trúc dự án DNU Marketplace

Tài liệu mô tả bố cục thư mục và vai trò chính của **DNU Marketplace** (web mua bán đồ dùng cho sinh viên). Các thư mục phụ thuộc (`node_modules`) được bỏ qua; thư mục `backend/uploads/` chứa file upload runtime (ảnh sản phẩm, file chat, …) — không liệt kê từng file.

---

## Tổng quan kiến trúc

| Thành phần | Vai trò |
|------------|---------|
| **frontend/** | Giao diện React (Vite), Redux Toolkit, Tailwind CSS |
| **backend/** | API Node.js (Express), MongoDB (Mongoose), Socket.IO, cron |
| **Gốc repo** | Script `.bat`, `package.json` gốc (ví dụ `node-cron`), tài liệu hướng dẫn |

---

## Công nghệ chính

- **Frontend:** React 18, React Router, Redux Toolkit, Axios, Socket.IO client, Tailwind CSS, Vite  
- **Backend:** Express, Mongoose, JWT, Socket.IO, Multer/Cloudinary (upload), Nodemailer, Google Generative AI (Gemini), Jest (test)

---

## Cây thư mục (rút gọn)

```
.
├── .vscode/                    # Cấu hình VS Code/Cursor (launch, settings)
├── backend/
│   ├── config/
│   │   └── db.js               # Kết nối MongoDB
│   ├── controllers/            # Xử lý logic theo từng miền (REST + một số handler Socket)
│   ├── cron/                   # Tác vụ định kỳ (hết hạn đơn, thông báo thông minh, …)
│   ├── middleware/
│   │   ├── validators/         # express-validator cho auth, order, payment, product
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/                 # Schema Mongoose (User, Product, Order, Post, …)
│   ├── routes/                 # Định tuyến Express, gắn controller
│   ├── scripts/                # Script một lần (vd: normalizeProductCategory.js)
│   ├── tests/                  # Jest (auth, payment, …)
│   ├── uploads/                # File tĩnh upload local (products/, messages/, …)
│   ├── utils/                  # Gemini, email, upload, moderation, sentiment, …
│   ├── server.js               # Khởi động HTTP + Socket.IO
│   ├── createAdmin.js          # Tiện ích tạo admin
│   ├── createMultipleUsers.js
│   ├── jest.config.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/                 # Tài nguyên tĩnh (banner, …)
│   ├── src/
│   │   ├── components/         # Layout, modal, chatbot, route bảo vệ, …
│   │   ├── pages/              # Màn hình theo route (Home, Products, Admin, Chat, …)
│   │   ├── store/
│   │   │   ├── slices/         # Redux slices (auth, product, post, …)
│   │   │   └── store.js
│   │   ├── utils/
│   │   │   └── api.js          # Gọi API / cấu hình axios
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── env.example
│   └── package.json
├── CREATE_USERS.bat
├── LIST_MODELS.bat
├── NORMALIZE_PRODUCT_CATEGORY.bat
├── QUICK_FIX_PORT_5000.bat
├── START_BOTH.bat
├── HUONG_DAN_RAG_VA_TRAIN_AI.md
├── HUONG_DAN_TEST_AI.md
├── LOGIC_MUA_HANG.md
├── LICENSE
├── package.json                # Gốc (ví dụ phụ thuộc node-cron)
├── README.md
└── CAU_TRUC_PROJECT.md         # File này
```

---

## Backend — chi tiết theo thư mục

| Thư mục / file | Nội dung |
|----------------|----------|
| **config/** | Cấu hình DB |
| **controllers/** | Logic nghiệp vụ: admin, auth, sản phẩm, đơn hàng, thanh toán, chat, bài viết, story, review, tìm kiếm, gợi ý, chatbot AI, … |
| **cron/** | Job nền: hết hạn đơn/offer, thông báo |
| **middleware/** | Xác thực JWT, giới hạn request, xử lý lỗi, validate body/query |
| **models/** | Entity MongoDB (User, Product, Order, Payment, Post, Message, Coupon, …) |
| **routes/** | Ánh xạ URL → controller (vd: `product.js`, `order.js`, `chatbot.js`, `search.js`) |
| **scripts/** | Script bảo trì/dữ liệu |
| **tests/** | Kiểm thử tự động |
| **uploads/** | Lưu file upload khi không dùng hoàn toàn cloud (cấu trúc con: products, messages, …) |
| **utils/** | Hàm dùng chung: token, email, upload, AI (Gemini), kiểm duyệt nội dung, phân tích cảm xúc, … |
| **server.js** | Entry point: Express, middleware, mount routes, Socket.IO |

**Lưu ý:** API follow/unfollow và danh sách followers/following nằm trong `routes/user.js` (dùng `followController`).

---

## Frontend — chi tiết theo thư mục

| Thư mục | Nội dung |
|---------|----------|
| **components/** | Khối UI tái sử dụng: Layout, Chatbot, modal mua hàng/thanh toán, bảo vệ route (admin/protected), đánh giá sao, gợi ý sản phẩm, … |
| **pages/** | Trang ứng với từng URL: đăng nhập/đăng ký, danh sách/chi tiết sản phẩm, giỏ/đơn, chat, feed, seller/admin dashboard, cài đặt thông báo, … |
| **store/slices/** | Trạng thái Redux theo miền (auth, product, post, collection, follow, story, user, …) |
| **utils/api.js** | Base URL, interceptor token, các hàm gọi API |

---

## File & script ở thư mục gốc

- **README.md** — Mô tả dự án, tính năng, hướng chạy  
- **START_BOTH.bat** — Gợi ý chạy cả frontend và backend (Windows)  
- **CREATE_USERS.bat / LIST_MODELS.bat / …** — Tiện ích phát triển hoặc vận hành  
- **HUONG_DAN_*.md, LOGIC_MUA_HANG.md** — Tài liệu bổ sung theo chủ đề  

---

*Cập nhật: có thể chỉnh file này khi thêm module hoặc đổi cấu trúc thư mục.*
