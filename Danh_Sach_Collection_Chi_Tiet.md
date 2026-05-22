4.2. Các Collection trong hệ thống

Hệ thống DNU Marketplace được xây dựng dựa trên kiến trúc cơ sở dữ liệu NoSQL (MongoDB) với tổng cộng 22 collections. Các collections được thiết kế theo từng nhóm chức năng nhằm tối ưu khả năng mở rộng, hiệu năng truy vấn và hỗ trợ các tính năng từ thương mại điện tử, mạng xã hội đến trí tuệ nhân tạo.

1. Nhóm Quản lý Người dùng và Xác thực
1.1 Collection: Users

Đây là collection trung tâm, lưu trữ toàn bộ thông tin định danh, hồ sơ cá nhân và hành vi hoạt động của sinh viên trên hệ thống.

Các trường dữ liệu chính:

_id: Định danh duy nhất của người dùng (ObjectId).
name: Họ và tên đầy đủ của sinh viên.
email: Email định danh (bắt buộc sử dụng domain @dnu.edu.vn).
studentId: Mã số sinh viên nhằm tăng độ tin cậy và hạn chế tài khoản giả.
password: Mật khẩu đã được mã hóa bằng bcrypt.
avatar / coverPhoto: URL ảnh đại diện và ảnh bìa lưu trữ trên Cloudinary.
isAdmin / isSuperAdmin: Phân quyền quản trị hệ thống.
isVerified: Trạng thái xác minh email.
followers / following: Danh sách người dùng theo dõi và được theo dõi.
isOnline / lastSeen: Trạng thái hoạt động thời gian thực của người dùng.

Collection này đóng vai trò nền tảng cho toàn bộ các tính năng khác của hệ thống.

1.2 Collection: PendingRegistration & PendingPasswordReset

Hai collection này lưu trữ tạm thời các yêu cầu đăng ký tài khoản mới và khôi phục mật khẩu. Mỗi bản ghi chứa OTP hoặc token xác thực email kèm thời gian hết hạn, giúp tăng cường bảo mật và chống spam.

1.3 Collection: NotificationSettings

Lưu trữ cấu hình thông báo cá nhân hóa của từng người dùng, bao gồm thông báo tin nhắn, thông báo đơn hàng, thông báo hệ thống và thông báo marketing. Collection này giúp người dùng kiểm soát trải nghiệm và hạn chế bị làm phiền.

2. Nhóm Nghiệp vụ Thương mại điện tử
2.1 Collection: Products

Lưu trữ thông tin chi tiết về các sản phẩm được đăng bán trên nền tảng.

Các trường chính:

userId: Người đăng sản phẩm.
title / description: Tiêu đề và mô tả chi tiết.
price: Giá bán đề xuất.
category: Danh mục sản phẩm (Sách, Điện tử, Nội thất…).
condition: Tình trạng sản phẩm (Tốt, Khá, Cũ…).
images: Danh sách URL hình ảnh.
isApproved: Trạng thái phê duyệt của quản trị viên.
status: Tình trạng bán (Available, Sold, Deleted).
reports: Danh sách báo cáo vi phạm từ người dùng khác.
moderationStatus: Trạng thái kiểm duyệt tự động (safe, review, reject).
2.2 Collection: Orders

Quản lý toàn bộ luồng giao dịch giữa người mua và người bán.

buyerId / sellerId: Hai bên giao dịch.
productId: Sản phẩm được mua.
finalPrice: Giá chốt cuối cùng.
status: Trạng thái đơn hàng (pending, confirmed, completed, cancelled).
shippingAddress: Địa chỉ và số điện thoại nhận hàng.
expiresAt: Thời gian hết hạn xác nhận đơn hàng (24 giờ).
2.3 Collection: Payments

Lưu trữ chứng từ thanh toán bằng mã QR.

orderId: Liên kết đơn hàng.
transactionCode: Mã giao dịch duy nhất.
paymentProof: Ảnh biên lai chuyển khoản.
status: Trạng thái duyệt thanh toán (pending, confirmed, rejected).
2.4 Collection: Offers

Quản lý quy trình trả giá tự động.

buyerId / sellerId / productId: Các thực thể liên quan.
offerPrice: Giá đề nghị của người mua.
counterOfferPrice: Giá phản hồi của người bán.
status: pending, accepted, rejected, countered, expired.
3. Nhóm Tương tác và Mạng xã hội
3.1 Collection: Messages

Lưu trữ nội dung trò chuyện thời gian thực.

senderId / receiverId
content
isRead
3.2 Collection: Posts & Stories

Lưu trữ nội dung bảng tin và tin ngắn 24 giờ.

content / images
hashtags
3.3 Collection: Comments & Reviews

Quản lý phản hồi công khai về sản phẩm hoặc người bán sau giao dịch.

3.4 Collection: Follows & Bookmarks

Quản lý quan hệ theo dõi và bài đăng yêu thích.

4. Nhóm Quản trị và Hệ thống
4.1 Collection: BankQR

Lưu trữ thông tin tài khoản ngân hàng để tạo mã QR thanh toán động.

4.2 Collection: SearchHistory & ProductView

Ghi lại hành vi tìm kiếm và xem sản phẩm nhằm phục vụ thuật toán gợi ý sản phẩm thông minh dựa trên AI.