# CHI TIẾT CÁC COLLECTIONS TRONG CƠ SỞ DỮ LIỆU (MONGODB)

Hệ thống DNU Marketplace được xây dựng dựa trên kiến trúc cơ sở dữ liệu NoSQL với 22 Collections được thiết kế tối ưu để phục vụ cho các tính năng từ thương mại điện tử đến mạng xã hội và trí tuệ nhân tạo.

## 1. Nhóm Quản lý Người dùng và Xác thực

### 1.1. Collection: Users
Đây là collection quan trọng nhất lưu trữ toàn bộ thông tin định danh và hành vi của sinh viên trên hệ thống.
- **_id:** Định danh duy nhất (ObjectId).
- **name:** Họ và tên đầy đủ của sinh viên.
- **email:** Email định danh (bắt buộc đuôi @dnu.edu.vn).
- **studentId:** Mã số sinh viên để tăng độ tin cậy.
- **password:** Mật khẩu đã được mã hóa bằng bcrypt.
- **avatar/coverPhoto:** Đường dẫn ảnh đại diện và ảnh bìa lưu trên Cloudinary.
- **isAdmin/isSuperAdmin:** Phân quyền quản trị hệ thống.
- **isVerified:** Trạng thái đã xác minh email hay chưa.
- **followers/following:** Mảng chứa các tham chiếu đến người dùng khác.
- **isOnline/lastSeen:** Trạng thái hoạt động thời gian thực.

### 1.2. Collection: PendingRegistration & PendingPasswordReset
Lưu trữ tạm thời các yêu cầu đăng ký và khôi phục mật khẩu đang chờ xác nhận qua mã OTP/Token email.

### 1.3. Collection: NotificationSettings
Lưu trữ cấu hình thông báo cá nhân hóa cho từng người dùng (bật/tắt thông báo chat, thông báo đơn hàng, v.v.).

---

## 2. Nhóm Nghiệp vụ Thương mại điện tử

### 2.1. Collection: Products
Lưu trữ thông tin chi tiết về hàng hóa được rao bán trên sàn.
- **userId:** Tham chiếu đến người đăng tin.
- **title/description:** Tiêu đề và mô tả chi tiết sản phẩm.
- **price:** Giá bán đề xuất.
- **category:** Danh mục (Sách, Điện tử, Nội thất...).
- **condition:** Tình trạng món đồ (Tốt, Khá, Cũ, Cần sửa chữa...).
- **images:** Mảng chứa URL các hình ảnh sản phẩm.
- **isApproved:** Trạng thái phê duyệt của Quản trị viên (Boolean).
- **status:** Tình trạng bán (Available, Sold, Deleted).
- **reports:** Mảng lưu trữ danh sách các báo cáo vi phạm từ người dùng khác.
- **moderationStatus:** Trạng thái kiểm duyệt tự động (safe, review, reject).

### 2.2. Collection: Orders
Quản lý luồng giao dịch giữa người mua và người bán.
- **buyerId/sellerId:** Tham chiếu đến hai bên giao dịch.
- **productId:** Tham chiếu đến sản phẩm được mua.
- **finalPrice:** Giá chốt cuối cùng (có thể khác giá gốc nếu có trả giá).
- **status:** Trạng thái đơn (pending, confirmed, completed, cancelled).
- **shippingAddress:** Thông tin địa chỉ và số điện thoại nhận hàng.
- **expiresAt:** Thời gian hết hạn xác nhận đơn hàng (mặc định sau 24 giờ).

### 2.3. Collection: Payments
Lưu trữ và quản lý chứng từ thanh toán bằng mã QR.
- **orderId:** Tham chiếu đến đơn hàng tương ứng.
- **transactionCode:** Mã giao dịch duy nhất do hệ thống tạo ra để người dùng nhập vào nội dung chuyển khoản.
- **paymentProof:** URL hình ảnh biên lai/ảnh chụp màn hình chuyển khoản thành công.
- **status:** Trạng thái duyệt thanh toán (pending, confirmed, rejected).

### 2.4. Collection: Offers
Quản lý quy trình thỏa thuận giá (mặc cả) tự động.
- **buyerId/sellerId/productId:** Các tham chiếu liên quan.
- **offerPrice:** Giá người mua đề nghị.
- **counterOfferPrice:** Giá người bán đề nghị ngược lại.
- **status:** Trạng thái (pending, accepted, rejected, countered, expired).

---

## 3. Nhóm Tương tác và Mạng xã hội

### 3.1. Collection: Messages
Lưu trữ nội dung trò chuyện thời gian thực.
- **senderId/receiverId:** Người gửi và người nhận.
- **content:** Nội dung tin nhắn văn bản hoặc hình ảnh.
- **isRead:** Trạng thái đã xem tin nhắn.

### 3.2. Collection: Posts & Stories
Lưu trữ nội dung trên bảng tin chung và các tin ngắn biến mất sau 24 giờ.
- **content/images:** Nội dung văn bản và đa phương tiện.
- **hashtags:** Các nhãn phân loại nội dung bài đăng.

### 3.3. Collection: Comments & Reviews
Quản lý các phản hồi công khai của người dùng về sản phẩm hoặc về đối tác sau giao dịch.

### 3.4. Collection: Follows & Bookmarks
Quản lý mối quan hệ kết nối và lưu trữ bài đăng yêu thích của người dùng.

---

## 4. Nhóm Quản trị và Hệ thống

### 4.1. Collection: BankQR
Lưu trữ thông tin tài khoản ngân hàng của hệ thống để tạo mã QR thanh toán động.

### 4.2. Collection: SearchHistory & ProductView
Ghi lại hành vi tìm kiếm và xem hàng để phục vụ cho các thuật toán gợi ý sản phẩm thông minh của AI.
