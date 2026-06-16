# 🛒 DNU Marketplace — Sàn Giao Dịch Đồ Cũ Sinh Viên Đại Học Đại Nam

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Local-brightgreen?logo=mongodb" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Chatbot-orange?logo=google" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📖 Mô tả dự án

**DNU Marketplace** là nền tảng web thương mại điện tử dành riêng cho cộng đồng sinh viên **Đại học Đại Nam**, cho phép mua bán và trao đổi đồ dùng cũ (sách, đồ điện tử, nội thất, quần áo, v.v.) một cách an toàn, tiện lợi và minh bạch.

Hệ thống kết hợp mô hình **Marketplace truyền thống** với các tính năng **mạng xã hội** (feed, stories, follow), **thanh toán QR Bank**, **Chatbot AI** (Google Gemini), và **hệ thống giao hàng** (Shipper Dashboard) — tạo thành một hệ sinh thái giao dịch hoàn chỉnh trong khuôn viên trường.

---

## 🎓 Tài liệu Đồ án Tốt nghiệp

Dự án có hệ thống tài liệu kèm theo để hỗ trợ báo cáo và bảo vệ đồ án:

| Tài liệu | Mô tả |
|---|---|
| [`DE_CUONG_CHI_TIET.md`](./DE_CUONG_CHI_TIET.md) | Đề cương chi tiết đồ án 5 chương |
| [`KIEN_TRUC_HE_THONG.md`](./KIEN_TRUC_HE_THONG.md) | Kiến trúc hệ thống, sơ đồ Mermaid, 23 Collections MongoDB |
| [`LOGIC_MUA_HANG.md`](./LOGIC_MUA_HANG.md) | Quy trình mua hàng chi tiết từng bước |
| [`GỢI_Ý_CẢI_THIỆN.md`](./GỢI_Ý_CẢI_THIỆN.md) | Các đề xuất cải tiến trong tương lai |

---

## ✨ Tính năng chính

### 👤 Quản lý người dùng
- Đăng ký & đăng nhập bắt buộc bằng email trường (`@dnu.edu.vn`)
- Xác minh email bằng OTP (6 chữ số)
- Khôi phục mật khẩu qua email
- Hồ sơ cá nhân đầy đủ: ảnh đại diện, ảnh bìa, bio, website, biệt danh
- Mã số sinh viên (`studentId`) để tăng độ tin cậy
- Trạng thái online/offline real-time
- Hệ thống đánh giá và xếp hạng người bán

### 📦 Quản lý sản phẩm
- Đăng bài với tối đa **10 hình ảnh** (lưu trên Cloudinary)
- Phân loại theo **7 danh mục**: Sách, Điện tử, Quần áo, Nội thất, Văn phòng phẩm, Thể thao, Khác
- **5 mức tình trạng**: Rất tốt, Tốt, Khá, Đã dùng nhiều, Cần sửa chữa
- Chọn **khu vực giao dịch**: Khuôn viên trường, Ký túc xá, Lân cận
- Gắn thẻ (`tags`) tự do
- Duyệt bài bởi Admin trước khi hiển thị
- So sánh sản phẩm song song
- Xem lịch sử sản phẩm đã xem

### 🔍 Tìm kiếm & Gợi ý
- Tìm kiếm toàn văn (full-text search) theo tiêu đề, mô tả, thẻ
- **Autocomplete** — gợi ý khi gõ
- Lịch sử tìm kiếm cá nhân
- Lọc theo: giá, danh mục, khu vực, tình trạng, trạng thái
- Sắp xếp theo nhiều tiêu chí (mới nhất, giá, lượt xem)
- **Gợi ý sản phẩm** dựa trên hành vi người dùng (AI Recommendation)
- Gợi ý sản phẩm tương tự

### 💬 Tương tác & Mạng xã hội
- **Chat trực tiếp** người mua ↔ người bán (Socket.IO real-time)
- Bình luận công khai trên sản phẩm
- Thêm/xóa sản phẩm yêu thích
- Báo cáo bài đăng vi phạm
- **Follow/Unfollow** người dùng khác
- **Feed** bài đăng từ những người đang theo dõi
- **Posts** — Chia sẻ bài viết, review sản phẩm, gắn hashtag
- **Stories** — Story 24 giờ (tự động hết hạn)
- **Collections** — Tạo bộ sưu tập sản phẩm yêu thích
- **Hashtags** — Tìm kiếm theo hashtag
- **Bookmarks** — Lưu bài đăng/post
- Thông báo real-time cho mọi tương tác

### 🛍️ Quy trình giao dịch
- **Đề nghị giá (Offer)** — Người mua gửi mức giá đề xuất (tự hết hạn sau 7 ngày)
- **Mua ngay (Buy Now)** — Tạo đơn hàng trực tiếp
- **3 phương thức nhận hàng**: Giao hàng tận nơi, Tự lấy, Gặp mặt
- **2 phương thức thanh toán**: Chuyển khoản ngân hàng, Tiền mặt
- Mã giảm giá (Coupon) — Quản lý bởi Admin
- Đánh giá (Review) sau khi giao dịch hoàn tất
- Yêu cầu hoàn đơn (Return)

### 💳 Hệ thống thanh toán QR
1. Người mua tạo đơn hàng → hệ thống sinh **mã giao dịch duy nhất**
2. Người mua quét **QR code ngân hàng** của hệ thống và chuyển khoản kèm mã giao dịch
3. Người mua **upload ảnh biên lai** trong vòng 24 giờ
4. Admin kiểm tra và **xác nhận/từ chối** thanh toán
5. Đơn hàng được hoàn tất sau khi thanh toán được duyệt
- Tự động hủy thanh toán nếu không upload biên lai sau 24 giờ
- Thông báo real-time về mọi thay đổi trạng thái thanh toán

### 🏦 Quản lý Bank QR (Seller)
- Người bán đăng ký **QR code ngân hàng cá nhân** cho từng sản phẩm
- Admin duyệt QR trước khi kích hoạt
- Hỗ trợ nhiều ngân hàng

### 🚴 Hệ thống Shipper
- Người dùng đăng ký làm shipper (kèm CCCD, loại phương tiện, khu vực)
- Admin duyệt/từ chối/tạm dừng tài khoản shipper
- **Shipper Dashboard**: nhận đơn, xác nhận lấy hàng (kèm ảnh), xác nhận giao hàng (kèm ảnh)
- Quản lý tài khoản ngân hàng nhận thu nhập cho shipper

### 🤖 Chatbot AI (Google Gemini)
- Hỗ trợ người dùng 24/7 với **Google Gemini AI**
- Trả lời câu hỏi thường gặp về ứng dụng
- Hướng dẫn sử dụng các tính năng
- Kiểm tra trạng thái đơn hàng bằng ngôn ngữ tự nhiên
- Tìm kiếm sản phẩm thông minh
- Rate limiting: **tối đa 20 requests/phút**
- Lịch sử chat trong session (có thể xóa)
- Hỗ trợ **RAG** (Retrieval-Augmented Generation) với Vectra vector database

### ⚙️ Tự động hóa (Cron Jobs)
| Tác vụ | Chu kỳ | Mô tả |
|---|---|---|
| Hủy đơn hàng hết hạn | Mỗi giờ | Đơn chờ xác nhận > 24h tự động hủy |
| Hủy đề nghị giá hết hạn | Mỗi giờ | Offer > 7 ngày tự động hết hạn |
| Hủy thanh toán chưa biên lai | Mỗi giờ | Payment > 24h không upload tự hủy |
| Hủy story hết hạn | Mỗi giờ | Story > 24h tự xóa |
| Smart Notifications | Mỗi 6 giờ | Thông báo dựa trên hành vi người dùng |

### 🛡️ Quản trị (Admin Dashboard)
- Thống kê tổng quan: users, sản phẩm, đơn hàng, doanh thu
- Duyệt/từ chối bài đăng sản phẩm
- Quản lý & khóa tài khoản người dùng
- Xử lý báo cáo vi phạm
- Quản lý thanh toán (xác nhận/từ chối)
- Quản lý Bank QR (**chỉ Super Admin**)
- Quản lý mã giảm giá (Coupon)
- Quản lý Shipper (duyệt hồ sơ)
- Thống kê doanh thu chi tiết

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────┐
│               CLIENT BROWSER                │
│  React 18 + Redux Toolkit + TailwindCSS     │
│  Vite + React Router v6 + Socket.IO Client  │
└──────────────────┬──────────────────────────┘
                   │ HTTP REST + WebSocket
┌──────────────────▼──────────────────────────┐
│           BACKEND (Node.js + Express)        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Routes  │  │ Middlew  │  │  Cron     │  │
│  │ (24 mod) │  │ JWT/CORS │  │  Jobs     │  │
│  └────┬─────┘  └──────────┘  └───────────┘  │
│       │                                     │
│  ┌────▼────────────────────────────────┐    │
│  │      Controllers (26 modules)        │    │
│  └────┬────────────────────────────────┘    │
│       │                                     │
│  ┌────▼──────────┐  ┌────────────────────┐  │
│  │  Mongoose ODM  │  │   External APIs    │  │
│  └────┬──────────┘  │ • Cloudinary       │  │
│       │             │ • Google Gemini AI  │  │
│  ┌────▼──────────┐  │ • Nodemailer       │  │
│  │   MongoDB      │  └────────────────────┘  │
│  │  (23 Models)  │                          │
│  └───────────────┘                          │
└─────────────────────────────────────────────┘
```

---

## 🗄️ Cơ sở dữ liệu — MongoDB Collections (23 models)

| Collection | Mô tả |
|---|---|
| `users` | Người dùng, roles, shipper info |
| `products` | Sản phẩm, tags, reports |
| `orders` | Đơn hàng, shipper, coupon |
| `payments` | Thanh toán, biên lai, trạng thái |
| `offers` | Đề nghị giá |
| `messages` | Tin nhắn chat |
| `notifications` | Thông báo real-time |
| `notificationsettings` | Cài đặt thông báo |
| `reviews` | Đánh giá sau giao dịch |
| `comments` | Bình luận công khai |
| `posts` | Bài đăng mạng xã hội |
| `stories` | Stories 24h |
| `collections` | Bộ sưu tập sản phẩm |
| `hashtags` | Thống kê hashtag |
| `follows` | Quan hệ follow/unfollow |
| `bookmarks` | Bài đã lưu |
| `searchhistories` | Lịch sử tìm kiếm |
| `productviews` | Lịch sử sản phẩm đã xem |
| `coupons` | Mã giảm giá |
| `bankqrs` | QR code ngân hàng hệ thống |
| `sellerbankqrs` | QR code ngân hàng người bán |
| `pendingregistrations` | Đăng ký chờ xác minh OTP |
| `pendingpasswordresets` | Đặt lại mật khẩu chờ OTP |

---

## 🖥️ Giao diện người dùng — Các trang chính

### Trang công khai
| Route | Trang |
|---|---|
| `/` | Trang chủ — Danh sách sản phẩm, Stories, Gợi ý |
| `/products` | Danh sách sản phẩm + bộ lọc nâng cao |
| `/products/:id` | Chi tiết sản phẩm |
| `/category/:name` | Sản phẩm theo danh mục |
| `/user/:userId` | Hồ sơ người dùng khác |
| `/feed` | Feed bài đăng xã hội |
| `/posts/:id` | Chi tiết bài đăng |
| `/explore` | Khám phá / Hashtag |
| `/help` | Trung tâm hỗ trợ |

### Trang yêu cầu đăng nhập
| Route | Trang |
|---|---|
| `/profile` | Hồ sơ cá nhân |
| `/profile/edit` | Chỉnh sửa hồ sơ |
| `/create-product` | Đăng bán sản phẩm |
| `/products/:id/edit` | Chỉnh sửa sản phẩm |
| `/chat` / `/chat/:userId` | Nhắn tin trực tiếp |
| `/orders` | Đơn hàng của tôi |
| `/offers` | Đề nghị giá |
| `/payments` | Lịch sử thanh toán |
| `/favorites` | Sản phẩm yêu thích |
| `/seller-dashboard` | Dashboard người bán |
| `/shipper` | Dashboard shipper |
| `/compare` | So sánh sản phẩm |
| `/my-promotions` | Mã giảm giá của tôi |
| `/notifications/settings` | Cài đặt thông báo |
| `/feedback` | Góp ý |

### Trang Admin
| Route | Trang |
|---|---|
| `/admin` | Dashboard quản trị tổng quan |
| `/admin/payments` | Quản lý thanh toán |
| `/admin/bankqr` | Quản lý Bank QR (Super Admin) |
| `/admin/revenue` | Thống kê doanh thu |

---

## 🔌 API Endpoints

> **Base URL**: `http://localhost:5000/api`  
> Tất cả endpoint yêu cầu đăng nhập cần header: `Authorization: Bearer <jwt_token>`

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/register` | Đăng ký tài khoản | ❌ |
| POST | `/login` | Đăng nhập | ❌ |
| POST | `/verify-otp` | Xác minh OTP email | ❌ |
| POST | `/resend-otp` | Gửi lại OTP | ❌ |
| POST | `/forgotpassword` | Quên mật khẩu | ❌ |
| POST | `/verify-otp-reset` | Xác minh OTP đặt lại mật khẩu | ❌ |
| PUT | `/resetpassword` | Đặt lại mật khẩu | ❌ |
| GET | `/me` | Thông tin user hiện tại | ✅ |
| POST | `/logout` | Đăng xuất | ✅ |

### 👥 Users (`/api/users`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/profile/:id` | Hồ sơ người dùng | ❌ |
| PUT | `/profile` | Cập nhật hồ sơ | ✅ |
| POST | `/favorites/:productId` | Thêm yêu thích | ✅ |
| DELETE | `/favorites/:productId` | Xóa yêu thích | ✅ |
| GET | `/favorites` | Danh sách yêu thích | ✅ |
| POST | `/:userId/follow` | Follow người dùng | ✅ |
| DELETE | `/:userId/follow` | Unfollow | ✅ |
| GET | `/:userId/followers` | Danh sách followers | ❌ |
| GET | `/:userId/following` | Danh sách following | ❌ |

### 📦 Products (`/api/products`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Danh sách sản phẩm (filter, sort, paginate) | ❌ |
| GET | `/:id` | Chi tiết sản phẩm | ❌ |
| POST | `/` | Tạo sản phẩm | ✅ |
| PUT | `/:id` | Cập nhật sản phẩm | ✅ |
| DELETE | `/:id` | Xóa sản phẩm | ✅ |
| PUT | `/:id/sold` | Đánh dấu đã bán | ✅ |
| POST | `/:id/report` | Báo cáo vi phạm | ✅ |
| POST | `/:id/like` | Like sản phẩm | ✅ |
| GET | `/:id/view` | Ghi nhận lượt xem | ❌ |

### 💬 Messages (`/api/messages`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/` | Gửi tin nhắn | ✅ |
| GET | `/conversations` | Danh sách hội thoại | ✅ |
| GET | `/:conversationId` | Tin nhắn trong hội thoại | ✅ |

### 🛍️ Orders (`/api/orders`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/` | Tạo đơn hàng | ✅ |
| GET | `/` | Danh sách đơn hàng | ✅ |
| GET | `/:id` | Chi tiết đơn hàng | ✅ |
| PUT | `/:id/confirm` | Người bán xác nhận | ✅ |
| PUT | `/:id/cancel` | Hủy đơn | ✅ |
| PUT | `/:id/complete` | Hoàn thành đơn | ✅ |
| POST | `/:id/return` | Yêu cầu hoàn đơn | ✅ |
| PUT | `/:id/return/approve` | Admin duyệt hoàn đơn | ✅ Admin |
| PUT | `/:id/return/reject` | Admin từ chối hoàn đơn | ✅ Admin |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/` | Tạo thanh toán | ✅ |
| GET | `/order/:orderId` | Thanh toán theo đơn hàng | ✅ |
| PUT | `/:id/upload-proof` | Upload ảnh biên lai | ✅ |
| GET | `/my-payments` | Lịch sử thanh toán cá nhân | ✅ |
| GET | `/pending` | Thanh toán chờ xác nhận | ✅ Admin |
| GET | `/` | Tất cả thanh toán | ✅ Admin |
| PUT | `/:id/confirm` | Xác nhận thanh toán | ✅ Admin |
| PUT | `/:id/reject` | Từ chối thanh toán | ✅ Admin |

### 🏦 Bank QR (`/api/bankqr`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Danh sách QR code | ✅ Admin |
| GET | `/active` | QR code đang kích hoạt | ❌ |
| GET | `/:id` | Chi tiết QR code | ✅ Admin |
| POST | `/` | Tạo QR code | ✅ Super Admin |
| PUT | `/:id` | Cập nhật QR code | ✅ Super Admin |
| DELETE | `/:id` | Xóa QR code | ✅ Super Admin |

### 🚴 Shipper (`/api/shipper`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/apply` | Đăng ký làm shipper | ✅ |
| GET | `/dashboard` | Dashboard shipper | ✅ Shipper |
| GET | `/orders` | Đơn hàng của shipper | ✅ Shipper |
| PUT | `/orders/:id/accept` | Nhận đơn | ✅ Shipper |
| PUT | `/orders/:id/pickup` | Xác nhận lấy hàng | ✅ Shipper |
| PUT | `/orders/:id/deliver` | Xác nhận giao hàng | ✅ Shipper |

### 📝 Posts & Feed (`/api/posts`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Feed bài đăng | ❌ |
| GET | `/:id` | Chi tiết bài đăng | ❌ |
| POST | `/` | Tạo bài đăng | ✅ |
| PUT | `/:id` | Cập nhật bài đăng | ✅ |
| DELETE | `/:id` | Xóa bài đăng | ✅ |
| GET | `/user/:userId` | Bài đăng của user | ❌ |
| GET | `/hashtag/:hashtag` | Bài đăng theo hashtag | ❌ |
| POST | `/:id/like` | Like bài đăng | ✅ |

### 📸 Stories (`/api/stories`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Danh sách stories | ✅ |
| GET | `/user/:userId` | Stories của user | ❌ |
| POST | `/` | Tạo story | ✅ |
| DELETE | `/:id` | Xóa story | ✅ |

### 📂 Collections (`/api/collections`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Danh sách collections | ✅ |
| GET | `/:id` | Chi tiết collection | ✅ |
| POST | `/` | Tạo collection | ✅ |
| PUT | `/:id` | Cập nhật collection | ✅ |
| DELETE | `/:id` | Xóa collection | ✅ |
| POST | `/:id/products/:productId` | Thêm sản phẩm | ✅ |
| DELETE | `/:id/products/:productId` | Xóa sản phẩm | ✅ |

### 🔖 Hashtags (`/api/hashtags`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Hashtag phổ biến | ❌ |
| GET | `/:hashtag` | Thông tin hashtag | ❌ |

### 🔍 Search (`/api/search`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Tìm kiếm tổng hợp (products, posts, users) | ❌ |
| GET | `/autocomplete` | Gợi ý tìm kiếm | ❌ |
| GET | `/history` | Lịch sử tìm kiếm | ✅ |
| DELETE | `/history` | Xóa lịch sử | ✅ |

### 💡 Gợi ý sản phẩm (`/api`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/recommendations` | Gợi ý cho người dùng | ✅ |
| GET | `/recommendations/similar/:productId` | Sản phẩm tương tự | ❌ |

### 🤖 Chatbot (`/api/chatbot`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/chat` | Chat với Gemini AI | ✅ |
| POST | `/clear-history` | Xóa lịch sử chat | ✅ |

### 🎟️ Coupons (`/api/coupons`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/` | Coupon của người dùng | ✅ |
| POST | `/validate` | Kiểm tra coupon | ✅ |
| POST | `/apply` | Áp dụng coupon | ✅ |
| POST | `/` | Tạo coupon | ✅ Admin |
| PUT | `/:id` | Cập nhật coupon | ✅ Admin |
| DELETE | `/:id` | Xóa coupon | ✅ Admin |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/user/:userId` | Đánh giá của user | ❌ |
| POST | `/` | Tạo đánh giá | ✅ |
| PUT | `/:id` | Cập nhật đánh giá | ✅ |
| DELETE | `/:id` | Xóa đánh giá | ✅ |

### 📊 Admin (`/api/admin`)
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/stats` | Thống kê tổng quan | ✅ Admin |
| GET | `/users` | Danh sách users | ✅ Admin |
| PUT | `/users/:id` | Cập nhật / khóa user | ✅ Admin |
| GET | `/products/pending` | Sản phẩm chờ duyệt | ✅ Admin |
| PUT | `/products/:id/approve` | Duyệt sản phẩm | ✅ Admin |
| PUT | `/products/:id/reject` | Từ chối sản phẩm | ✅ Admin |
| GET | `/reports` | Danh sách báo cáo | ✅ Admin |

---

## ⚙️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 4.18 | Web framework |
| MongoDB | - | Cơ sở dữ liệu |
| Mongoose | 8.x | ODM |
| Socket.IO | 4.5 | Real-time (chat, notifications) |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 2.4 | Hash mật khẩu |
| Cloudinary | 1.41 | Lưu trữ ảnh |
| Nodemailer | 6.9 | Gửi email OTP |
| Multer | 1.4 | Upload file |
| node-cron | 3.x | Cron jobs tự động |
| @google/generative-ai | 0.24 | Chatbot Gemini AI |
| Vectra | 0.14 | Vector DB cho RAG |
| express-validator | 7.x | Validation input |
| express-rate-limit | 7.x | Rate limiting |
| Helmet.js | 7.x | Security headers |
| Morgan | 1.10 | HTTP request logger |
| dotenv | 16.x | Environment variables |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.x | Build tool |
| React Router | v6 | Routing |
| Redux Toolkit | 2.x | State management |
| React-Redux | 9.x | Redux bindings |
| Axios | 1.6 | HTTP client |
| Socket.IO Client | 4.5 | Real-time client |
| Tailwind CSS | 3.4 | CSS framework |
| @headlessui/react | 1.7 | UI components |
| @heroicons/react | 2.1 | Icons |

---

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- **Node.js** v18 trở lên ([tải tại đây](https://nodejs.org/))
- **npm** v9+ (đi kèm Node.js)
- **MongoDB** — Local hoặc [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Cloudinary** account — [cloudinary.com](https://cloudinary.com/) (miễn phí)
- **Gmail** hoặc SMTP server để gửi email OTP
- *(Tùy chọn)* **Google Gemini API Key** — [aistudio.google.com](https://aistudio.google.com/) (cho chatbot)

---

### 🔧 Bước 1 — Clone dự án

```bash
git clone <repository-url>
cd "4 Năm ĐH/ĐỒ ÁN"
```

---

### 🔧 Bước 2 — Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
# ===== Server =====
PORT=5000
NODE_ENV=development

# ===== MongoDB =====
MONGODB_URI=mongodb://localhost:27017/dnu-marketplace
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dnu-marketplace

# ===== JWT =====
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# ===== Cloudinary (lưu trữ ảnh) =====
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ===== Email (Gửi OTP) =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
# Với Gmail: tạo App Password tại https://myaccount.google.com/apppasswords
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=DNU Marketplace <your-email@gmail.com>

# ===== Frontend =====
FRONTEND_URL=http://localhost:3000

# ===== Google Gemini AI (Tùy chọn - cho chatbot) =====
GEMINI_API_KEY=your-gemini-api-key-here

# ===== Debug (Tùy chọn) =====
# DEBUG_SOCKET=1
```

Khởi động backend:
```bash
npm run dev
```
> Backend chạy tại `http://localhost:5000`

---

### 🔧 Bước 3 — Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Khởi động frontend:
```bash
npm run dev
```
> Frontend chạy tại `http://localhost:3000`

---

### 🔧 Bước 4 — Tạo tài khoản Admin (lần đầu)

```bash
# Tạo Super Admin:
node backend/createAdmin.js

# Hoặc tạo nhiều user mẫu:
node backend/createMultipleUsers.js

# Hoặc chạy file batch:
CREATE_USERS.bat
```

---

### ⚡ Khởi động nhanh (Windows)

Chạy cả backend và frontend cùng lúc:
```batch
START_BOTH.bat
```

---

## 📁 Cấu trúc thư mục chi tiết

```
ĐỒ ÁN/
├── backend/
│   ├── config/                  # Kết nối Cloudinary, DB config
│   ├── controllers/             # Logic xử lý (26 controllers)
│   │   ├── authController.js        # Đăng ký, đăng nhập, OTP
│   │   ├── productController.js     # CRUD sản phẩm
│   │   ├── orderController.js       # Đơn hàng
│   │   ├── paymentController.js     # Thanh toán QR
│   │   ├── bankQRController.js      # Bank QR admin
│   │   ├── sellerBankQRController.js # Bank QR người bán
│   │   ├── shipperController.js     # Hệ thống shipper
│   │   ├── chatbotController.js     # Gemini AI Chatbot
│   │   ├── postController.js        # Mạng xã hội - Posts
│   │   ├── storyController.js       # Stories 24h
│   │   ├── searchController.js      # Tìm kiếm nâng cao
│   │   ├── offerController.js       # Đề nghị giá
│   │   ├── reviewController.js      # Đánh giá
│   │   ├── couponController.js      # Mã giảm giá
│   │   ├── adminController.js       # Quản trị
│   │   └── ...
│   ├── cron/                    # Tác vụ tự động
│   │   ├── orderExpiration.js       # Hủy đơn/thanh toán hết hạn
│   │   └── smartNotifications.js    # Thông báo thông minh
│   ├── middleware/              # Middleware xác thực, lỗi
│   │   ├── auth.js                  # JWT verify, role check
│   │   └── errorHandler.js          # Xử lý lỗi toàn cục
│   ├── models/                  # MongoDB schemas (23 models)
│   │   ├── User.js                  # User schema + bcrypt hook
│   │   ├── Product.js               # Sản phẩm + text index
│   │   ├── Order.js                 # Đơn hàng + virtual payment
│   │   ├── Payment.js               # Thanh toán
│   │   ├── Offer.js                 # Đề nghị giá
│   │   ├── Post.js                  # Bài đăng xã hội
│   │   ├── Story.js                 # Story 24h
│   │   ├── Coupon.js                # Mã giảm giá
│   │   ├── SellerBankQR.js          # QR ngân hàng người bán
│   │   └── ...
│   ├── routes/                  # Định nghĩa routes (24 files)
│   ├── scripts/                 # Scripts tiện ích
│   │   ├── normalizeProductCategory.js
│   │   ├── normalizeProductCondition.js
│   │   └── indexKnowledge.js        # Index dữ liệu cho RAG chatbot
│   ├── tests/                   # Jest unit tests
│   ├── uploads/                 # File upload tạm thời
│   ├── utils/                   # Helper functions
│   │   └── generateTransactionCode.js # Sinh mã giao dịch
│   ├── server.js                # Entry point, Socket.IO init
│   └── package.json
│
├── frontend/
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable components (25 files)
│       │   ├── Layout.jsx           # Navigation, Sidebar, Chatbot
│       │   ├── PaymentModal.jsx     # Flow thanh toán QR
│       │   ├── BuyNowModal.jsx      # Modal mua hàng
│       │   ├── Chatbot.jsx          # Giao diện chatbot AI
│       │   ├── NotificationBadge.jsx # Thông báo real-time
│       │   ├── ReviewSection.jsx    # Đánh giá sản phẩm
│       │   ├── SearchAutocomplete.jsx # Tìm kiếm gợi ý
│       │   ├── StoriesBar.jsx       # Thanh stories trang chủ
│       │   ├── ProtectedRoute.jsx   # Route yêu cầu đăng nhập
│       │   ├── AdminRoute.jsx       # Route yêu cầu Admin
│       │   └── ...
│       ├── context/             # React Context (Socket, Theme)
│       ├── pages/               # Trang ứng dụng (35 pages)
│       │   ├── Home.jsx             # Trang chủ
│       │   ├── AdminDashboard.jsx   # Bảng điều khiển Admin
│       │   ├── SellerDashboard.jsx  # Dashboard người bán
│       │   ├── ShipperDashboard.jsx # Dashboard shipper
│       │   ├── PaymentManagement.jsx # Quản lý thanh toán
│       │   ├── BankQRManagement.jsx # Quản lý Bank QR
│       │   ├── RevenueStats.jsx     # Thống kê doanh thu
│       │   ├── CompareProducts.jsx  # So sánh sản phẩm
│       │   ├── Feed.jsx             # Mạng xã hội feed
│       │   └── ...
│       ├── store/               # Redux store & slices
│       └── utils/               # API calls, helpers
│
├── START_BOTH.bat               # Khởi động nhanh cả 2 server
├── QUICK_FIX_PORT_5000.bat      # Giải phóng port 5000
├── CREATE_USERS.bat             # Tạo user mẫu
└── README.md
```

---

## 🔐 Bảo mật

| Biện pháp | Chi tiết |
|---|---|
| JWT Authentication | Token hết hạn sau 7 ngày, lưu trong localStorage |
| Password Hashing | bcrypt với 10 salt rounds |
| Email Validation | Bắt buộc domain `@dnu.edu.vn` |
| Input Validation | express-validator cho tất cả routes |
| Rate Limiting | Chatbot: 20 req/phút; API chung: có giới hạn |
| Security Headers | Helmet.js tự động thêm HSTS, CSP, X-Frame-Options... |
| CORS | Chỉ cho phép origin từ `FRONTEND_URL` |
| Phân quyền | 4 cấp: User → Admin → Super Admin → Shipper |
| Mã giao dịch | Duy nhất (UUID), bắt buộc nhập trong nội dung chuyển khoản |
| Admin xác minh | Thanh toán cần admin duyệt thủ công trước khi xác nhận đơn |

---

## 🧪 Testing

```bash
cd backend

# Chạy tất cả tests với coverage report:
npm test

# Chạy tests theo dõi thay đổi:
npm run test:watch

# Test API thủ công:
node test_api.js

# Kiểm tra database:
node inspect_db.js
node inspect_orders.js
node inspect_products.js
```

---

## 🌐 Triển khai (Deployment)

### Backend
1. Deploy lên **Railway**, **Render**, hoặc **Heroku**
2. Cấu hình tất cả biến môi trường từ file `.env`
3. Đảm bảo MongoDB Atlas đã được cấu hình whitelist IP
4. Cập nhật `FRONTEND_URL` theo domain production

### Frontend
```bash
cd frontend
npm run build   # Tạo thư mục dist/
```
Deploy thư mục `dist/` lên **Vercel** hoặc **Netlify**  
Cập nhật biến môi trường: `VITE_API_URL=https://your-backend.railway.app/api`

---

## 🔧 Troubleshooting

### ❌ Lỗi "Port 5000 already in use"
```batch
# Windows — chạy file batch:
QUICK_FIX_PORT_5000.bat

# Hoặc thủ công:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ❌ Lỗi kết nối MongoDB
- Kiểm tra MongoDB service đã chạy chưa: `mongod --version`
- Xác minh `MONGODB_URI` trong `.env` đúng cú pháp
- Với Atlas: đảm bảo IP đã được whitelist trong Network Access

### ❌ Ảnh không upload được
- Kiểm tra `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- File ảnh không vượt quá **5MB**
- Định dạng hỗ trợ: `jpg`, `jpeg`, `png`, `gif`, `webp`

### ❌ Không nhận được email OTP
- Với Gmail: tạo **App Password** riêng tại [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (bật 2FA trước)
- Điền App Password (không phải mật khẩu Gmail) vào `EMAIL_PASSWORD`
- Kiểm tra firewall/antivirus có chặn port 587 không

### ❌ Chatbot không trả lời
- Kiểm tra `GEMINI_API_KEY` trong `.env`
- Xác minh API key còn hạn mức tại [aistudio.google.com](https://aistudio.google.com)
- Chatbot giới hạn **20 requests/phút** — đợi 1 phút rồi thử lại

### ❌ Socket.IO không kết nối
- Đảm bảo `FRONTEND_URL` trong backend `.env` khớp chính xác với URL frontend
- Kiểm tra không có proxy/firewall chặn WebSocket

---

## 📈 Scripts tiện ích

```bash
# Chuẩn hóa danh mục sản phẩm (dữ liệu cũ):
npm run normalize-category

# Chuẩn hóa tình trạng sản phẩm:
npm run normalize-condition

# Index dữ liệu cho RAG Chatbot:
npm run index-knowledge

# Xem thông tin shipper:
node backend/inspect_shiper1.js

# Tạo dữ liệu shipper mẫu:
node backend/seed-shippers.js
```

---

## 🔄 Quy trình phát triển (Development Workflow)

```bash
# 1. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 2. Phát triển và commit
git add .
git commit -m "feat: thêm tính năng X"

# 3. Push lên GitHub
git push origin feature/ten-tinh-nang

# 4. Tạo Pull Request để review
```

> **Quy ước commit**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

---

## 🗺️ Roadmap

- [ ] Swagger / OpenAPI documentation
- [ ] Redis caching cho products và sessions
- [ ] Push notifications (Web Push API)
- [ ] Tích hợp cổng thanh toán trực tuyến (VNPay / Momo)
- [ ] Mobile app (React Native)
- [ ] Logging chuyên nghiệp (Winston + ELK Stack)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Docker containerization

---

## 👨‍💻 Tác giả

Dự án được phát triển như đồ án tốt nghiệp cho sinh viên **Đại học Đại Nam**.

---

## 📄 License

Dự án được cấp phép theo **MIT License** — xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

---

<p align="center">
  Made with ❤️ for DNU Students
</p>
