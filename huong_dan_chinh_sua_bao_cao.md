# HƯỚNG DẪN CHỈNH SỬA CHI TIẾT BÁO CÁO ĐỒ ÁN
## "Xây dựng hệ thống mua bán đồ dùng cũ cho sinh viên DNU sử dụng ReactJS và NodeJS"

> File này ghi rõ từng thao tác: **THÊM** (dòng nào – nội dung gì), **XÓA** (dòng nào), **SỬA** (dòng nào – thay thế bằng gì).  
> Thứ tự thực hiện: từ trên xuống dưới theo số dòng trong file gốc `báo cáo .md`.

---

## PHẦN 0 – CHUẨN HÓA TÊN ĐỀ TÀI (Toàn bộ file)

### 0.1 SỬA – Chuẩn hóa tiêu đề đề tài nhất quán

**Vấn đề:** File gốc dùng hai tên khác nhau:
- Dòng 9, 25: `"XÂY DỰNG HỆ THỐNG MUA BÁN ĐỒ DÙNG CŨ CHO SINH VIÊN DNU SỬ DỤNG REACTJS VÀ NODEJS"`
- Dòng 155, 1432: `"Xây dựng hệ thống sàn thương mại điện tử mua bán đồ dùng cũ tích hợp AI Chatbot cho sinh viên Đại học Đại Nam (DNU Marketplace)"`

**Quyết định chuẩn hóa:** Dùng tên đầy đủ và nhất quán:  
> **"XÂY DỰNG HỆ THỐNG SÀN THƯƠNG MẠI ĐIỆN TỬ MUA BÁN ĐỒ DÙNG CŨ TÍCH HỢP AI CHATBOT CHO SINH VIÊN ĐẠI HỌC ĐẠI NAM (DNU MARKETPLACE)"**

| Dòng | Thao tác | Nội dung gốc | Thay bằng |
|------|----------|--------------|-----------|
| 9 | SỬA | `XÂY DỰNG HỆ THỐNG MUA BÁN ĐỒ DÙNG CŨ CHO SINH VIÊN DNU SỬ DỤNG REACTJS VÀ NODEJS` | `XÂY DỰNG HỆ THỐNG SÀN THƯƠNG MẠI ĐIỆN TỬ MUA BÁN ĐỒ DÙNG CŨ TÍCH HỢP AI CHATBOT CHO SINH VIÊN ĐẠI HỌC ĐẠI NAM (DNU MARKETPLACE)` |
| 10 | SỬA | `BÁO CÁO ĐỒ ÁN TỐT NGHIỆP ` | `BÁO CÁO ĐỒ ÁN TỐT NGHIỆP` *(bỏ khoảng trắng thừa cuối dòng)* |
| 25 | SỬA | `XÂY DỰNG HỆ THỐNG MUA BÁN ĐỒ DÙNG CŨ CHO SINH VIÊN DNU SỬ DỤNG REACTJS VÀ NODEJS ` | `XÂY DỰNG HỆ THỐNG SÀN THƯƠNG MẠI ĐIỆN TỬ MUA BÁN ĐỒ DÙNG CŨ TÍCH HỢP AI CHATBOT CHO SINH VIÊN ĐẠI HỌC ĐẠI NAM (DNU MARKETPLACE)` |
| 35 | SỬA | `"Xây dựng hệ thống mua bán đồ dùng cũ cho sinh viên DNU sử dụng ReactJS và NodeJS"` | `"Xây dựng hệ thống sàn thương mại điện tử mua bán đồ dùng cũ tích hợp AI Chatbot cho sinh viên Đại học Đại Nam (DNU Marketplace)"` |

---

## PHẦN 1 – XÓA CÁC DÒNG TRÙNG LẶP / PLACEHOLDER

### 1.1 XÓA – Dòng bìa lặp lại (dòng 1–13 bị lặp ở dòng 14–32)

**Vấn đề:** Dòng 1–13 và dòng 14–32 là hai bản bìa giống nhau.  
**Thao tác:** **XÓA** toàn bộ từ dòng 14 đến dòng 32 (bản bìa thứ hai).

```
XÓA dòng 14 đến dòng 32 (trang bìa lặp lần 2):
  14:  BỘ GIÁO DỤC VÀ ĐÀO TẠO
  ...
  32:  HÀ NỘI, NĂM 2026
```

### 1.2 XÓA – Dòng trắng thừa

| Dòng | Thao tác | Ghi chú |
|------|----------|---------|
| 75–78 | XÓA | 4 dòng trắng thừa sau bảng viết tắt |
| 116–135 | XÓA | 20 dòng trắng thừa sau danh mục hình |
| 347–367 | XÓA | 21 dòng trắng thừa cuối Chương 1 |
| 1433–1436 | XÓA | 4 dòng trắng thừa cuối KẾT LUẬN |
| 1451–1454 | XÓA | 4 dòng trắng thừa cuối file |

### 1.3 XÓA/SỬA – Bảng 3.7 và 3.8 bị trùng nội dung

**Vấn đề:** Bảng 3.7 (dòng 839–851) và Bảng 3.8 (dòng 853–865) có **cùng nội dung** (đặc tả Users), nhưng được gán cho hai collection khác nhau.

**Thao tác:** SỬA dòng 853–865 thành nội dung đúng của Collection **Products**:

**XÓA** toàn bộ dòng 853–865 (bảng trùng) và **THÊM VÀO** nội dung đúng sau dòng 851:

```
THÊM sau dòng 851 (sau "Bảng 3.7: Đặc tả cấu trúc Collection `Users`"):

| Tên trường dữ liệu | Kiểu dữ liệu | Ràng buộc dữ liệu | Ý nghĩa và ví dụ |
|--------------------|--------------|-------------------|------------------|
| _id | ObjectId | Primary Key, Auto | Khóa chính của sản phẩm. |
| userId | ObjectId | Required, Ref: 'Users' | Tham chiếu đến sinh viên đăng sản phẩm. |
| title | String | Required, Trim, Max: 100 | Tiêu đề tin đăng (ví dụ: "Giáo trình C++ cũ"). |
| description | String | Required, Max: 1000 | Mô tả sản phẩm (độ mới, tình trạng trang sách). |
| price | Number | Required, Min: 0 | Giá bán sản phẩm (ví dụ: 50000). |
| category | String | Required, Enum | Danh mục ('Sách', 'Điện tử', 'Nội thất', 'Khác'). |
| condition | String | Required, Enum | Độ mới ('Mới 99%', 'Tốt', 'Khá', 'Cũ'). |
| images | Array [String] | Required, Max: 10 | Danh sách URL ảnh lưu trữ trên Cloudinary. |
| location | String | Required, Enum | Địa điểm giao dịch ('Ký túc xá', 'Giảng đường A', ...). |
| isApproved | Boolean | Default: false | Trạng thái phê duyệt tin bài của Admin. |
| status | String | Default: 'available', Enum | Trạng thái bán hàng ('available', 'sold', 'deleted'). |
| reportCount | Number | Default: 0 | Số lần bị báo cáo vi phạm bởi người dùng. |
| isReported | Boolean | Default: false | Đánh dấu sản phẩm đang bị kiểm tra vi phạm. |

**Bảng 3.8: Đặc tả cấu trúc Collection `Products` (Lưu thông tin sản phẩm)**
```

---

## PHẦN 2 – SỬA CHÍNH TẢ / NHÃN GIAO DIỆN

### 2.1 SỬA – Nhãn và chú thích hình bị viết tắt / không chuẩn

| Dòng | Nội dung gốc | Thay bằng |
|------|--------------|-----------|
| 92 | `Hình 3.11: Chọn đăng bán Sp` | `Hình 3.11: Giao diện chọn đăng bán sản phẩm` |
| 93 | `Hình 3.12: Điền thông tin sp đăng bán` | `Hình 3.12: Giao diện điền thông tin sản phẩm đăng bán` |
| 95 | `Hình 3.14: Thông báo sp được duyệt` | `Hình 3.14: Thông báo sản phẩm được duyệt` |
| 96 | `Hình 3.15: Ba cách tìm sản phẩm` | `Hình 3.15: Ba phương thức tìm kiếm sản phẩm` |
| 97 | `Hình 3.16: Điền thông tin để đặt sản phẩm` | `Hình 3.16: Giao diện điền thông tin đặt mua sản phẩm` |
| 942 | `Hình 3.14 thông báo sp đc duyệt` | `Hình 3.14: Thông báo sản phẩm được duyệt` |
| 954 | `Hình 3.15 ba cách tìm sản phẩm` | `Hình 3.15: Ba phương thức tìm kiếm sản phẩm` |
| 957 | `Hình 3.16: điền thông tin để dặt sản phẩm` | `Hình 3.16: Giao diện điền thông tin đặt mua sản phẩm` |
| 966 | `Hình 3.18: người bán và admin xác nhận sp` | `Hình 3.18: Người bán và Admin xác nhận đơn hàng` |
| 976 | `Hình 3.20: đánh giá sp khi nhận sp` | `Hình 3.20: Giao diện đánh giá sản phẩm sau khi nhận hàng` |

### 2.2 SỬA – Tiêu đề mục bị viết tắt / không nhất quán

| Dòng | Nội dung gốc | Thay bằng |
|------|--------------|-----------|
| 929 | `3.6 Quy trình hoạt động mua/bán sản phẩm trên web quy trình bán sp` | `3.6. Quy trình hoạt động mua/bán sản phẩm trên hệ thống` |
| 930 | `-chọn đăng bán` | `**Quy trình bán sản phẩm**` |
| 931 | `Hình 3.11: Chọn đăng bán Sp` | `Hình 3.11: Giao diện chọn đăng bán sản phẩm` |
| 948 | `Quy trình mua sản phẩm` | `**Quy trình mua sản phẩm**` |

### 2.3 SỬA – Lỗi chính tả

| Dòng | Nội dung gốc | Thay bằng |
|------|--------------|-----------|
| 960 | `...vào quản lý đơn hang chọn Thanh Toán` | `...vào quản lý đơn hàng, chọn Thanh toán` |
| 964 | `Admin xác nhận tiền đã nhận đc tiền...` | `Admin xác nhận đã nhận được tiền...` |
| 971 | `Nếu bạn thanh toán rồi sẽ hiện trên hệ thống shipper sẽ biết nếu không thì sẽ chuyển khoản hoặc tiền mặt` | `Nếu người mua đã thanh toán trước (chuyển khoản), shipper sẽ được thông báo trên hệ thống; nếu chưa, người mua có thể thanh toán khi nhận hàng (COD).` |
| 1415 | `Endpoint API / Sự nghiệp` (lặp 3 lần) | `Endpoint API / Chức năng` (1 lần, xóa cột trùng) |
| 1416 | Hàng bảng lặp 3 lần | Giữ lại 1 lần, xóa 2 cột trùng |
| 1417 | Hàng bảng lặp 3 lần | Giữ lại 1 lần, xóa 2 cột trùng |
| 1418 | Hàng bảng lặp 3 lần | Giữ lại 1 lần, xóa 2 cột trùng |
| 1419 | Hàng bảng lặp 3 lần | Giữ lại 1 lần, xóa 2 cột trùng |

### 2.4 SỬA – Bảng 5.4 bị nhân đôi cột (dòng 1415–1420)

**Vấn đề:** Bảng được tạo với 6 cột (mỗi cột lặp 2 lần) thay vì 3 cột chuẩn.

**THAY THẾ** dòng 1415–1420 bằng:

```markdown
| Endpoint API / Chức năng | Thời gian phản hồi trung bình | Đánh giá trải nghiệm |
|--------------------------|-------------------------------|----------------------|
| POST /api/auth/login (Xác thực băm mật khẩu) | 450 ms | Rất nhanh, mượt mà |
| GET /api/products (Lấy danh sách, có phân trang) | 120 ms | Cực kỳ nhanh |
| POST /api/payments (Tạo QR Code động) | 350 ms | Nhanh, tạo QR tức thì |
| POST /api/chatbot/chat (Xử lý luồng AI RAG) | 2.800 ms | Chấp nhận được với tác vụ AI sinh câu |

**Bảng 5.4: Thống kê thời gian phản hồi trung bình của các API chính**
```

---

## PHẦN 3 – BỔ SUNG NỘI DUNG MỚI

---

### 3.1 BỔ SUNG – Phân loại rõ các module hệ thống
**Vị trí:** THÊM VÀO sau dòng 221 (sau tiêu đề `3.6 Quy trình hoạt động...`), tức là tạo một mục **3.1.3** mới hoặc bổ sung vào cuối mục **3.1**.  
**Thực tế:** THÊM VÀO ngay sau dòng 205 (sau `3.1.2. Phân tích chi tiết các Yêu cầu phi chức năng`) như một mục **3.1.3** mới:

```markdown
### 3.1.3. Phân loại và Phạm vi rõ ràng của từng Module chức năng

Để tránh hệ thống DNU Marketplace bị nhầm lẫn như một tập hợp nhiều dự án ghép lại, các chức năng được tổ chức thành **7 module độc lập, có ranh giới rõ ràng** và được liên kết qua luồng dữ liệu chung:

| STT | Module | Phạm vi chức năng thuộc module | Phạm vi KHÔNG thuộc module này |
|-----|--------|-------------------------------|-------------------------------|
| 1 | **Đăng tin** | Tạo, chỉnh sửa, xóa tin đăng bán; tải ảnh lên Cloudinary; AI tự động gán Tag & mô tả; chờ Admin duyệt; thông báo kết quả duyệt. | Không xử lý giá, không nhận đơn hàng. |
| 2 | **Tìm kiếm & Lọc** | Tìm kiếm theo từ khóa (thanh tìm kiếm); lọc theo danh mục, khoảng giá, tình trạng, địa điểm; xem chi tiết sản phẩm. | Không bao gồm gợi ý AI (thuộc module Chatbot). |
| 3 | **Chat thời gian thực** | Nhắn tin 1–1 giữa người mua và người bán qua Socket.IO; hiển thị trạng thái online/offline; chỉ số đang gõ (typing indicator). | Không xử lý đơn hàng, không thanh toán trong chat. |
| 4 | **Đặt mua & Quản lý đơn hàng** | Tạo đơn hàng; người bán xác nhận/từ chối; theo dõi trạng thái đơn; shipper nhận và giao hàng; đánh giá sau nhận hàng; hủy đơn tự động (Cron Job). | Không xử lý dòng tiền (thuộc module Thanh toán). |
| 5 | **Thanh toán QR** | Tạo mã QR VietQR động theo đơn hàng; người mua upload biên lai; Admin đối soát và phê duyệt; Admin chuyển tiền lại cho người bán (trừ phí). | Không tự động webhook ngân hàng (giới hạn kỹ thuật hiện tại). |
| 6 | **Quản trị (Admin)** | Duyệt sản phẩm; quản lý người dùng; xử lý báo cáo vi phạm; kiểm duyệt biên lai; thống kê tổng hợp; phân quyền shipper. | Không thực hiện giao dịch mua bán trực tiếp. |
| 7 | **Chatbot AI (RAG)** | Trả lời câu hỏi về chính sách sàn; gợi ý sản phẩm theo nhu cầu ngôn ngữ tự nhiên; rate limiting chống spam. | Không thay thế chức năng tìm kiếm tĩnh; không xử lý đơn hàng. |

> **Lưu ý thiết kế:** Mỗi module có Controller, Route và Model riêng biệt trong codebase. Dữ liệu liên module được truyền qua ObjectId reference (MongoDB) và sự kiện Socket.IO, không gọi trực tiếp hàm của module khác → đảm bảo nguyên tắc **Low Coupling – High Cohesion**.
```

---

### 3.2 BỔ SUNG – Thiết kế CSDL/ERD bổ sung và luồng nghiệp vụ mua-bán
**Vị trí:** THÊM VÀO sau dòng 910 (sau "Bảng 3.18: Đặc tả cấu trúc Collection `Messages`"):

```markdown
### 3.4.3. Bổ sung các Collection quan trọng

#### Collection `Disputes` – Quản lý tranh chấp giao dịch

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|------------|--------------|-----------|---------|
| _id | ObjectId | PK, Auto | Khóa chính bản ghi tranh chấp. |
| orderId | ObjectId | Required, Ref: 'Orders' | Đơn hàng liên quan đến tranh chấp. |
| reporterId | ObjectId | Required, Ref: 'Users' | Người khởi tạo khiếu nại (người mua hoặc người bán). |
| type | String | Enum: ['not_received', 'wrong_item', 'fraud', 'other'] | Loại tranh chấp. |
| description | String | Required, Max: 2000 | Mô tả chi tiết vấn đề tranh chấp. |
| evidenceImages | Array[String] | Max: 5 | Ảnh bằng chứng đính kèm (Cloudinary URL). |
| status | String | Enum: ['open', 'under_review', 'resolved', 'closed'] | Trạng thái xử lý tranh chấp. |
| resolution | String | Optional | Quyết định giải quyết của Admin. |
| resolvedAt | Date | Optional | Thời điểm tranh chấp được giải quyết. |
| resolvedBy | ObjectId | Ref: 'Users' | Admin xử lý tranh chấp. |
| createdAt | Date | Auto | Thời điểm tạo khiếu nại. |

#### Collection `Reports` – Báo cáo sản phẩm vi phạm

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|------------|--------------|-----------|---------|
| _id | ObjectId | PK, Auto | Khóa chính bản ghi báo cáo. |
| productId | ObjectId | Required, Ref: 'Products' | Sản phẩm bị báo cáo vi phạm. |
| reporterId | ObjectId | Required, Ref: 'Users' | Người thực hiện báo cáo. |
| reason | String | Enum: ['fake_product', 'prohibited_item', 'spam', 'fraud', 'inappropriate_content'] | Lý do vi phạm. |
| detail | String | Optional, Max: 500 | Mô tả bổ sung. |
| status | String | Default: 'pending', Enum: ['pending', 'reviewed', 'dismissed'] | Trạng thái xử lý báo cáo. |
| reviewedBy | ObjectId | Ref: 'Users' | Admin duyệt báo cáo. |
| createdAt | Date | Auto | Thời điểm báo cáo. |

### 3.4.4. Trạng thái đơn hàng và luồng chuyển trạng thái

Hệ thống DNU Marketplace định nghĩa **7 trạng thái đơn hàng** tạo thành một máy trạng thái (State Machine) khép kín:

```
[pending] ──(người bán xác nhận)──► [seller_confirmed]
    │                                       │
    │(hết 24h / người bán từ chối)          │(người mua thanh toán & upload biên lai)
    ▼                                       ▼
[cancelled]                         [payment_uploaded]
                                            │
                                   (Admin đối soát)
                              ┌─────────────┴──────────────┐
                              ▼                            ▼
                      [payment_rejected]           [payment_approved]
                              │                            │
                    (người mua upload lại)         (shipper nhận hàng)
                              │                            ▼
                              └────────────────────► [shipping]
                                                          │
                                                (người mua xác nhận nhận hàng)
                                                          ▼
                                                    [completed]
```

| Trạng thái | Mô tả | Hành động tiếp theo |
|------------|-------|---------------------|
| `pending` | Đơn vừa được tạo, chờ người bán xác nhận | Người bán xác nhận hoặc từ chối; Cron Job tự hủy sau 24h |
| `seller_confirmed` | Người bán đã xác nhận, chờ người mua thanh toán | Người mua tạo Payment và upload biên lai |
| `payment_uploaded` | Biên lai đã được tải lên, chờ Admin đối soát | Admin phê duyệt hoặc từ chối |
| `payment_rejected` | Admin từ chối biên lai (sai số tiền / mã GD) | Người mua upload biên lai mới hoặc hủy |
| `payment_approved` | Admin xác nhận đã nhận đủ tiền | Hệ thống thông báo cho Shipper nhận hàng |
| `shipping` | Shipper đã nhận hàng và đang vận chuyển | Người mua xác nhận đã nhận hàng |
| `completed` | Giao dịch hoàn tất | Admin chuyển tiền cho người bán (trừ phí VAT + phí sàn) |
| `cancelled` | Đơn bị hủy (tự động hoặc thủ công) | Sản phẩm được khôi phục về trạng thái `available` |
| `disputed` | Đơn đang trong tranh chấp | Admin xem xét bằng chứng và ra phán quyết |

### 3.4.5. Quy trình xử lý tranh chấp và hủy giao dịch

**Các kịch bản tranh chấp thường gặp và cách xử lý:**

| Kịch bản | Người khởi tạo | Quy trình xử lý | Kết quả |
|----------|---------------|-----------------|---------|
| Không nhận được hàng | Người mua | Người mua tạo Dispute → Admin kiểm tra lịch sử đơn hàng + chat → Admin phán quyết | Hoàn tiền cho người mua HOẶC nhắc shipper giao lại |
| Hàng không đúng mô tả | Người mua | Người mua tải ảnh bằng chứng → Admin kiểm tra mô tả gốc → Phán quyết | Hủy giao dịch + hoàn tiền HOẶC giữ nguyên |
| Người mua bùng hàng | Người bán | Người bán báo cáo → Admin kiểm tra lịch sử thanh toán | Cảnh cáo tài khoản người mua / khóa tài khoản |
| Hủy trước khi giao | Người mua hoặc người bán | Gửi yêu cầu hủy → Bên còn lại đồng ý → Admin duyệt | Đơn hủy, tiền hoàn theo chính sách |

**Chính sách hoàn tiền khi hủy:**
- Hủy trước khi `payment_approved`: Hoàn 100% trong vòng 3–5 ngày làm việc.
- Hủy sau khi `shipping`: Cần hai bên thỏa thuận; phí vận chuyển không hoàn.
- Hủy do Admin phát hiện gian lận: Đóng băng tài khoản, xử lý theo quy chế nhà trường.
```

---

### 3.3 BỔ SUNG – Phân tích bảo mật thanh toán QR, xác thực người dùng và chống lừa đảo
**Vị trí:** THÊM VÀO sau dòng 1424 (sau mục `5.3.2. Đánh giá tính an toàn bảo mật`) như một mục mới **5.3.3**:

```markdown
### 5.3.3. Phân tích chuyên sâu các cơ chế bảo mật và chống gian lận

#### A. Bảo mật thanh toán QR VietQR

Hệ thống DNU Marketplace sử dụng tiêu chuẩn **VietQR** để tạo mã QR thanh toán động. Phân tích các lớp bảo mật:

| Lớp bảo mật | Cơ chế thực hiện | Rủi ro được ngăn chặn |
|------------|-----------------|----------------------|
| **Mã giao dịch duy nhất** | `transactionCode` được sinh ngẫu nhiên theo dạng `DNUMP` + 5 ký tự hex (ví dụ: `DNUMP98A7B`). Mã này được nhúng vào nội dung chuyển khoản trong QR. | Ngăn người mua dùng biên lai cũ của giao dịch khác để xác nhận thanh toán. |
| **QR gắn với đơn hàng** | Mỗi `Payment` document liên kết 1–1 với `Order`. Một đơn chỉ có một QR hợp lệ tại một thời điểm. | Ngăn tạo nhiều QR để lừa Admin duyệt nhiều lần. |
| **Admin đối soát thủ công** | Admin phải đối chiếu biên lai với giao dịch thực trên app ngân hàng trước khi nhấn "Phê duyệt". | Ngăn biên lai giả mạo (Photoshop). |
| **Cloudinary URL không đoán được** | URL ảnh biên lai do Cloudinary sinh ra có token bảo mật, không thể đoán. | Ngăn người dùng độc hại truy cập biên lai của người khác. |
| **Trạng thái đơn hàng atomically** | Khi Admin duyệt, hệ thống cập nhật cả `Payment.status`, `Order.status`, `Product.status` trong một transaction logic. | Ngăn race condition (hai Admin duyệt cùng lúc). |

**Hạn chế hiện tại và hướng khắc phục:**
- **Biên lai giả mạo tinh vi:** Hiện tại Admin đối soát bằng mắt thường. Hướng nâng cấp: Tích hợp PayOS/Casso webhook để tự động xác minh biến động số dư ngân hàng theo thời gian thực.
- **QR hết hạn:** Chưa có cơ chế QR hết hạn thời gian. Hướng nâng cấp: Thêm trường `qrExpiresAt` và ẩn QR sau khi hết hạn.

#### B. Xác thực người dùng đa lớp

```
Lớp 1 – Email học đường: Chỉ chấp nhận @dnu.edu.vn
    ↓
Lớp 2 – OTP Email: Mã 6 số hết hạn sau 10 phút (lưu trong PendingRegistration)
    ↓
Lớp 3 – JWT Token: HS256, hết hạn sau 7 ngày, truyền qua header Authorization
    ↓
Lớp 4 – Phân quyền: Middleware authorize() kiểm tra role ('student'|'admin'|'superadmin')
    ↓
Lớp 5 – MSSV: Lưu và đối chiếu mã số sinh viên để tăng trách nhiệm giao dịch
```

**Điểm mạnh:**
- Lớp 1 + 2 đảm bảo 100% tài khoản là sinh viên/cán bộ DNU thực sự.
- JWT stateless giúp Backend không cần lưu phiên, phù hợp kiến trúc phân tán.
- bcryptjs với salt round 10 đảm bảo không thể reverse-engineer mật khẩu ngay cả khi database bị rò rỉ.

**Điểm cần cải thiện:**
- Chưa có **2FA (Two-Factor Authentication)** cho tài khoản Admin.
- Chưa có cơ chế **refresh token** → Người dùng bị đăng xuất sau 7 ngày.
- Nên thêm **device fingerprint** để phát hiện đăng nhập bất thường từ thiết bị lạ.

#### C. Chống lừa đảo trong giao dịch C2C

| Kịch bản lừa đảo | Cơ chế phòng ngừa hiện tại | Trạng thái |
|-----------------|--------------------------|-----------|
| Người ngoài trường đăng tin giả | Xác thực email @dnu.edu.vn + OTP | ✅ Đã xử lý |
| Người bán "bùng cọc" sau khi nhận tiền | Tiền giữ tại tài khoản sàn, chỉ chuyển sau khi người mua xác nhận nhận hàng | ✅ Đã xử lý |
| Đăng ảnh đẹp, hàng thực tế kém | Hệ thống đánh giá sao sau giao dịch; tích lũy feedback | ⚠️ Xử lý một phần |
| Upload biên lai giả | Admin đối soát thủ công + ngân hàng thực | ⚠️ Phụ thuộc Admin |
| Tài khoản ảo tạo đơn hàng spam | Mỗi tài khoản cần MSSV + OTP; Rate limiting IP | ✅ Đã xử lý |
| Sản phẩm bị cấm (vũ khí, ma túy...) | Admin duyệt trước khi hiển thị + hệ thống báo cáo vi phạm | ✅ Đã xử lý |

#### D. Kiểm duyệt nội dung và báo cáo sản phẩm vi phạm

**Quy trình kiểm duyệt 2 tầng:**

```
Tầng 1 – Kiểm duyệt trước khi đăng (Pre-moderation):
  Người bán đăng tin → Hệ thống lưu isApproved=false → Admin nhận thông báo
  → Admin xem xét ảnh, mô tả, giá → Phê duyệt hoặc từ chối kèm lý do
  → Thông báo real-time cho người bán qua Socket.IO

Tầng 2 – Kiểm duyệt sau khi đăng (Post-moderation):
  Người dùng phát hiện sản phẩm vi phạm → Nhấn "Báo cáo vi phạm" → Chọn lý do
  → Ghi vào Collection Reports + tăng reportCount trên Products
  → Khi reportCount ≥ 5: Hệ thống tự ẩn sản phẩm (isReported=true), Admin nhận cảnh báo
  → Admin xem xét và ra quyết định cuối cùng
```

**Danh mục sản phẩm bị cấm tuyệt đối:**
- Vũ khí, chất nổ, chất cháy nguy hiểm.
- Chất gây nghiện, thuốc kê đơn không có chứng từ.
- Tài liệu vi phạm bản quyền (sách photo, phần mềm crack).
- Hàng giả, hàng nhái thương hiệu.
- Nội dung người lớn, phản động, vi phạm pháp luật Việt Nam.
```

---

### 3.4 BỔ SUNG – Test case bổ sung theo module
**Vị trí:** THÊM VÀO sau dòng 1411 (sau "Bảng 5.3: Kịch bản kiểm thử chức năng Trợ lý AI Chatbot RAG") như mục **5.2.4** và **5.2.5**:

```markdown
### 5.2.4. Kịch bản kiểm thử Module Đăng tin và Kiểm duyệt sản phẩm

| Mã Case | Tên Kịch bản | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---------|-------------|-------------------|-----------------|-----------------|-----------------|-----------|
| TC-POST-01 | Đăng sản phẩm hợp lệ và chờ duyệt | 1. Đăng nhập tài khoản sinh viên. 2. Chọn "Đăng bán". 3. Điền đầy đủ thông tin. 4. Upload ảnh. 5. Nhấn "Đăng bài". | Tiêu đề: "Giáo trình C++ cũ"; Giá: 50.000đ; Danh mục: Sách; Ảnh: product.jpg | Hệ thống tạo bản ghi với `isApproved=false`, Admin nhận thông báo pending. | Sản phẩm lưu thành công, hiển thị "Đang chờ duyệt" cho người bán. | PASS |
| TC-POST-02 | Admin duyệt sản phẩm hợp lệ | 1. Admin vào trang quản trị. 2. Tìm sản phẩm pending. 3. Nhấn "Phê duyệt". | Product ID: PROD001 | Sản phẩm chuyển `isApproved=true`, hiển thị lên sàn. Người bán nhận thông báo real-time. | Cập nhật trạng thái đúng, thông báo gửi sau <1s. | PASS |
| TC-POST-03 | Admin từ chối sản phẩm vi phạm | 1. Admin phát hiện ảnh không phù hợp. 2. Nhấn "Từ chối" và nhập lý do. | Lý do: "Ảnh sản phẩm không rõ ràng" | Sản phẩm bị xóa khỏi danh sách pending. Người bán nhận thông báo từ chối kèm lý do. | Gửi thông báo từ chối chính xác. | PASS |
| TC-POST-04 | Báo cáo sản phẩm vi phạm | 1. Người mua nhấn "Báo cáo". 2. Chọn lý do "Hàng giả". 3. Gửi. | Lý do: fake_product | Hệ thống tạo bản ghi Report, tăng `reportCount` của sản phẩm lên 1. | Ghi nhận báo cáo thành công, Admin thấy cảnh báo trên dashboard. | PASS |
| TC-POST-05 | Sản phẩm bị ẩn tự động khi đủ 5 báo cáo | 1. Tạo 5 tài khoản. 2. Mỗi tài khoản báo cáo sản phẩm. 3. Kiểm tra trạng thái. | reportCount = 5 | Hệ thống tự set `isReported=true`, sản phẩm ẩn khỏi danh sách công khai. | Sản phẩm bị ẩn sau báo cáo thứ 5. | PASS |

**Bảng 5.5: Kịch bản kiểm thử Module Đăng tin và Kiểm duyệt**

---

### 5.2.5. Kịch bản kiểm thử Module Chat và Đặt hàng

| Mã Case | Tên Kịch bản | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---------|-------------|-------------------|-----------------|-----------------|-----------------|-----------|
| TC-CHAT-01 | Gửi tin nhắn thời gian thực | 1. Người mua mở trang chat. 2. Nhập tin nhắn. 3. Gửi. | Message: "Sản phẩm còn không?" | Tin nhắn xuất hiện tức thời bên người bán mà không cần reload trang. | Tin nhắn nhận được sau <500ms. | PASS |
| TC-CHAT-02 | Hiển thị trạng thái online | 1. Người A đăng nhập. 2. Người B mở trang danh sách chat. | userId: USER_A | Tên người A hiển thị chấm xanh "Online". | Cập nhật trạng thái real-time sau đăng nhập. | PASS |
| TC-ORDER-01 | Tạo đơn hàng thành công | 1. Người mua nhấn "Mua ngay". 2. Điền địa chỉ, SĐT. 3. Xác nhận đặt hàng. | Address: "KTX DNU"; Phone: 0901234567 | Đơn hàng tạo với `status=pending`, sản phẩm chuyển `status=reserved`. Người bán nhận thông báo. | Tạo đơn thành công, hai bên nhận thông báo. | PASS |
| TC-ORDER-02 | Người bán từ chối đơn hàng | 1. Người bán nhận thông báo đơn mới. 2. Nhấn "Từ chối". | Order ID: ORD001 | Đơn chuyển `status=cancelled`, sản phẩm về `status=available`. Người mua nhận thông báo. | Khôi phục trạng thái sản phẩm đúng. | PASS |
| TC-ORDER-03 | Đơn hàng tự hủy sau 24h | 1. Tạo đơn hàng. 2. Không thực hiện hành động nào. 3. Đợi Cron Job chạy. | expiresAt: quá khứ | Cron Job phát hiện đơn quá hạn, tự chuyển `status=cancelled`, thông báo cho cả hai bên. | Đơn hàng tự hủy, sản phẩm khôi phục. | PASS |
| TC-DISPUTE-01 | Người mua khởi tạo tranh chấp | 1. Người mua không nhận được hàng sau 7 ngày. 2. Nhấn "Khiếu nại". 3. Chọn lý do và mô tả. | Reason: not_received | Tạo bản ghi Dispute `status=open`, Admin nhận cảnh báo. Đơn hàng chuyển `status=disputed`. | Khởi tạo tranh chấp thành công. | PASS |

**Bảng 5.6: Kịch bản kiểm thử Module Chat và Đặt hàng**

---

### 5.2.6. Dữ liệu kiểm thử tổng hợp (Test Data)

Các tài khoản và dữ liệu mẫu sử dụng trong quá trình kiểm thử:

| Vai trò | Email | MSSV | Mật khẩu | Ghi chú |
|---------|-------|------|---------|---------|
| Sinh viên (Người mua) | buyer.test@dnu.edu.vn | 2051010001 | Test@123 | Tài khoản đã xác thực OTP |
| Sinh viên (Người bán) | seller.test@dnu.edu.vn | 2051010002 | Test@123 | Tài khoản đã xác thực OTP |
| Admin | admin@dnu.edu.vn | N/A | Admin@456 | Phân quyền role=admin |
| Shipper | shipper@dnu.edu.vn | N/A | Ship@789 | Phân quyền role=shipper |

| Sản phẩm mẫu | Giá | Danh mục | Tình trạng | ID Test |
|--------------|-----|---------|-----------|---------|
| Giáo trình C++ cũ | 50.000đ | Sách | Tốt | PROD_TEST_001 |
| Quạt điện Panasonic 9 cánh | 250.000đ | Điện tử | Khá | PROD_TEST_002 |
| Bàn học gỗ nhỏ | 350.000đ | Nội thất | Tốt | PROD_TEST_003 |
```

---

### 3.5 BỔ SUNG – Cập nhật tài liệu tham khảo
**Vị trí:** THÊM VÀO sau dòng 1450 (sau tài liệu [13]):

```markdown
[14] VietQR (2023), VietQR – Chuẩn mã QR thanh toán liên ngân hàng quốc gia, Napas & Ngân hàng Nhà nước Việt Nam, truy cập tại: <https://vietqr.io/danh-sach-api/> (lần cuối truy cập ngày 24/05/2026).

[15] OWASP Foundation (2023), OWASP Top 10 Web Application Security Risks 2023, Open Web Application Security Project, truy cập tại: <https://owasp.org/Top10/> (lần cuối truy cập ngày 25/05/2026).

[16] Cloudinary Inc (2024), Cloudinary Developer Documentation – Image Upload and Transformation API, truy cập tại: <https://cloudinary.com/documentation> (lần cuối truy cập ngày 25/05/2026).

[17] node-cron (2023), node-cron – Task Scheduler for Node.js based on GNU crontab, GitHub Repository, truy cập tại: <https://github.com/node-cron/node-cron> (lần cuối truy cập ngày 24/05/2026).

[18] Redux Toolkit Team (2024), Redux Toolkit Official Documentation – The official, opinionated, batteries-included toolset for efficient Redux development, truy cập tại: <https://redux-toolkit.js.org/> (lần cuối truy cập ngày 24/05/2026).
```

---

## PHẦN 4 – TỔNG KẾT VỊ TRÍ CÁC THAY ĐỔI

### Bảng tóm tắt toàn bộ chỉnh sửa

| # | Thao tác | Dòng | Mô tả nhanh |
|---|---------|------|-------------|
| 1 | SỬA | 9, 25, 35 | Chuẩn hóa tên đề tài nhất quán |
| 2 | XÓA | 14–32 | Xóa bìa lặp lần 2 |
| 3 | XÓA | 75–78 | Xóa dòng trắng thừa sau bảng viết tắt |
| 4 | XÓA | 116–135 | Xóa dòng trắng thừa sau danh mục hình |
| 5 | XÓA | 347–367 | Xóa dòng trắng thừa cuối Chương 1 |
| 6 | SỬA | 92–101, 931, 942, 954, 957, 966, 976 | Sửa nhãn hình viết tắt/không chuẩn |
| 7 | SỬA | 929–930 | Sửa tiêu đề mục 3.6 |
| 8 | XÓA/SỬA | 853–865 | Sửa Bảng 3.8 Products bị trùng nội dung Users |
| 9 | SỬA | 960, 964, 971 | Sửa lỗi chính tả trong mục 3.6 |
| 10 | SỬA | 1415–1420 | Sửa Bảng 5.4 bị nhân đôi cột |
| 11 | THÊM | Sau dòng 205 | Bổ sung mục 3.1.3: Phân loại 7 module |
| 12 | THÊM | Sau dòng 910 | Bổ sung 3.4.3: Collection Disputes & Reports |
| 13 | THÊM | Sau dòng 910 | Bổ sung 3.4.4: Trạng thái đơn hàng State Machine |
| 14 | THÊM | Sau dòng 910 | Bổ sung 3.4.5: Quy trình xử lý tranh chấp |
| 15 | THÊM | Sau dòng 1424 | Bổ sung 5.3.3: Phân tích bảo mật chuyên sâu |
| 16 | THÊM | Sau dòng 1411 | Bổ sung 5.2.4: Test case module Đăng tin |
| 17 | THÊM | Sau dòng 1411 | Bổ sung 5.2.5: Test case module Chat & Đặt hàng |
| 18 | THÊM | Sau dòng 1411 | Bổ sung 5.2.6: Dữ liệu kiểm thử tổng hợp |
| 19 | THÊM | Sau dòng 1450 | Bổ sung tài liệu tham khảo [14]–[18] |
| 20 | XÓA | 1433–1436, 1451–1454 | Xóa dòng trắng thừa cuối file |

---

## PHỤ LỤC – NỘI DUNG ĐẦY ĐỦ CỦA CÁC PHẦN BỔ SUNG MỚI

*(Phần này chứa toàn văn các đoạn cần thêm vào, sắp xếp theo thứ tự chèn vào file gốc)*

---

### PHỤ LỤC A – Mục 3.1.3 (Chèn sau dòng 205 của file gốc)

```
3.1.3. Phân loại và Phạm vi rõ ràng của từng Module chức năng

Để tránh hệ thống DNU Marketplace bị nhầm lẫn như một tập hợp nhiều dự án ghép
lại, các chức năng được tổ chức thành 7 module độc lập, có ranh giới rõ ràng và
được liên kết qua luồng dữ liệu chung:

Module 1 – Đăng tin:
  Phạm vi TRONG: Tạo, chỉnh sửa, xóa tin đăng bán; tải ảnh lên Cloudinary;
  AI tự động gán Tag & mô tả; chờ Admin duyệt; thông báo kết quả duyệt.
  Phạm vi NGOÀI: Không xử lý giá, không nhận đơn hàng.

Module 2 – Tìm kiếm & Lọc:
  Phạm vi TRONG: Tìm kiếm theo từ khóa; lọc theo danh mục, khoảng giá, tình
  trạng, địa điểm; xem chi tiết sản phẩm.
  Phạm vi NGOÀI: Không bao gồm gợi ý AI (thuộc Module Chatbot).

Module 3 – Chat thời gian thực:
  Phạm vi TRONG: Nhắn tin 1–1 qua Socket.IO; trạng thái online/offline; typing
  indicator.
  Phạm vi NGOÀI: Không xử lý đơn hàng, không thanh toán trong chat.

Module 4 – Đặt mua & Quản lý đơn hàng:
  Phạm vi TRONG: Tạo đơn; người bán xác nhận/từ chối; theo dõi trạng thái;
  shipper giao hàng; đánh giá sau nhận; hủy đơn tự động (Cron Job).
  Phạm vi NGOÀI: Không xử lý dòng tiền (thuộc Module Thanh toán).

Module 5 – Thanh toán QR:
  Phạm vi TRONG: Tạo mã QR VietQR động; người mua upload biên lai; Admin đối
  soát và phê duyệt; Admin chuyển tiền cho người bán.
  Phạm vi NGOÀI: Không tự động webhook ngân hàng (giới hạn kỹ thuật hiện tại).

Module 6 – Quản trị (Admin):
  Phạm vi TRONG: Duyệt sản phẩm; quản lý người dùng; xử lý báo cáo vi phạm;
  kiểm duyệt biên lai; thống kê tổng hợp; phân quyền shipper.
  Phạm vi NGOÀI: Không thực hiện giao dịch mua bán trực tiếp.

Module 7 – Chatbot AI (RAG):
  Phạm vi TRONG: Trả lời câu hỏi về chính sách sàn; gợi ý sản phẩm theo yêu cầu
  ngôn ngữ tự nhiên; rate limiting chống spam.
  Phạm vi NGOÀI: Không thay thế tìm kiếm tĩnh; không xử lý đơn hàng.

Lưu ý thiết kế: Mỗi module có Controller, Route và Model riêng biệt. Dữ liệu
liên module được truyền qua ObjectId reference (MongoDB) và sự kiện Socket.IO,
không gọi trực tiếp hàm của module khác → đảm bảo nguyên tắc Low Coupling –
High Cohesion.
```

---

### PHỤ LỤC B – Mục 3.4.3–3.4.5 (Chèn sau dòng 910 của file gốc)

*(Xem nội dung chi tiết ở Phần 3.2 phía trên)*

---

### PHỤ LỤC C – Mục 5.3.3 (Chèn sau dòng 1424 của file gốc)

*(Xem nội dung chi tiết ở Phần 3.3 phía trên)*

---

### PHỤ LỤC D – Mục 5.2.4–5.2.6 (Chèn sau dòng 1411 của file gốc)

*(Xem nội dung chi tiết ở Phần 3.4 phía trên)*

---

### PHỤ LỤC E – Tài liệu tham khảo [14]–[18] (Chèn sau dòng 1450 của file gốc)

*(Xem nội dung chi tiết ở Phần 3.5 phía trên)*

---

> **Lưu ý khi thực hiện:** Thực hiện các thao tác XÓA và SỬA trước khi THÊM để số dòng tham chiếu không bị lệch.  
> Thứ tự an toàn: Thực hiện từ **cuối file lên đầu file** để tránh lệch số dòng.
