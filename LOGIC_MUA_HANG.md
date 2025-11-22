# 📦 Logic Hoạt Động Chức Năng Mua Hàng

## 🎯 Tổng Quan

Hệ thống mua hàng hoạt động dựa trên mô hình **Đề nghị giá (Offer)** → **Đơn hàng (Order)**. Người mua không thể mua trực tiếp mà phải thông qua quá trình thương lượng giá.

---

## 🔄 Luồng Hoạt Động Chính

### **Bước 1: Người mua đề nghị giá (Create Offer)**

```
Người mua xem sản phẩm → Click "Đề nghị giá" → Nhập giá đề nghị → Gửi Offer
```

**Điều kiện:**
- ✅ Sản phẩm phải có `status = 'Available'`
- ✅ Giá đề nghị > 0 và ≤ giá gốc
- ✅ Người mua không phải là chủ sản phẩm
- ✅ Chưa có offer pending nào cho sản phẩm này

**Kết quả:**
- Tạo Offer với `status = 'pending'`
- Gửi thông báo cho người bán
- Sản phẩm vẫn ở trạng thái `Available`

**File liên quan:**
- `backend/controllers/offerController.js` - `createOffer()`
- `frontend/src/components/OfferModal.jsx`

---

### **Bước 2: Người bán phản hồi Offer**

Người bán có 3 lựa chọn:

#### **2.1. Chấp nhận Offer (Accept Offer)**

```
Người bán chấp nhận → Tạo Order tự động → Đánh dấu sản phẩm là "Sold"
```

**Hành động:**
1. Cập nhật Offer: `status = 'accepted'`
2. **Tạo Order mới:**
   - `buyerId`: Người mua
   - `sellerId`: Người bán
   - `productId`: Sản phẩm
   - `offerId`: ID của offer
   - `finalPrice`: Giá đề nghị
   - `status`: `'pending'` (mặc định)
3. Cập nhật Product: `status = 'Sold'`
4. Gửi thông báo cho người mua

**File:** `backend/controllers/offerController.js` - `acceptOffer()`

---

#### **2.2. Từ chối Offer (Reject Offer)**

```
Người bán từ chối → Offer status = 'rejected' → Gửi thông báo cho người mua
```

**Hành động:**
- Cập nhật Offer: `status = 'rejected'`
- Gửi thông báo cho người mua
- Sản phẩm vẫn `Available`

**File:** `backend/controllers/offerController.js` - `rejectOffer()`

---

#### **2.3. Thương lượng lại (Counter Offer)**

```
Người bán đề nghị giá mới → Offer status = 'countered' → Chờ người mua phản hồi
```

**Hành động:**
- Cập nhật Offer:
  - `status = 'countered'`
  - `counterOfferPrice`: Giá mới
  - `sellerMessage`: Lời nhắn (nếu có)
- Gửi thông báo cho người mua

**File:** `backend/controllers/offerController.js` - `counterOffer()`

---

### **Bước 3: Người mua phản hồi Counter Offer**

Nếu người bán đã counter offer, người mua có thể:

#### **3.1. Chấp nhận Counter Offer**

```
Người mua chấp nhận giá mới → Tạo Order → Đánh dấu sản phẩm là "Sold"
```

**Hành động:**
1. Cập nhật Offer: `status = 'accepted'`
2. **Tạo Order mới:**
   - `finalPrice`: `counterOfferPrice` (giá mới)
   - `status`: `'pending'`
3. Cập nhật Product: `status = 'Sold'`
4. Gửi thông báo cho người bán

**File:** `backend/controllers/offerController.js` - `acceptCounterOffer()`

---

#### **3.2. Hủy Offer**

```
Người mua hủy → Offer status = 'cancelled'
```

**File:** `backend/controllers/offerController.js` - `cancelOffer()`

---

## 📋 Quản Lý Đơn Hàng (Order)

### **Cấu trúc Order Model**

```javascript
{
  buyerId: ObjectId,        // Người mua
  sellerId: ObjectId,       // Người bán
  productId: ObjectId,      // Sản phẩm
  offerId: ObjectId,        // Offer liên quan (optional)
  finalPrice: Number,       // Giá cuối cùng
  status: String,           // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: String,            // Ghi chú
  completedAt: Date,        // Thời gian hoàn thành
  cancelledAt: Date,        // Thời gian hủy
  cancelledBy: ObjectId     // Ai hủy
}
```

**File:** `backend/models/Order.js`

---

### **Các Trạng Thái Order**

| Trạng thái | Mô tả | Ai có thể thực hiện |
|------------|-------|---------------------|
| **pending** | Chờ xác nhận | Tự động khi tạo Order |
| **confirmed** | Đã xác nhận | Người bán (chưa có API) |
| **completed** | Hoàn thành | Người mua (xác nhận đã nhận hàng) |
| **cancelled** | Đã hủy | Người mua hoặc người bán |

---

### **Luồng Cập Nhật Trạng Thái Order**

```
pending → confirmed → completed
   ↓
cancelled (có thể hủy bất cứ lúc nào trước completed)
```

**Quy tắc:**
- ✅ `completed` chỉ có thể từ `confirmed`
- ✅ `cancelled` không thể nếu đã `completed`
- ✅ Khi hủy, sản phẩm được đánh dấu lại `Available`

**File:** `backend/controllers/orderController.js` - `updateOrderStatus()`

---

## 🎨 Giao Diện Người Dùng

### **Trang Chi Tiết Sản Phẩm**

**Người mua thấy:**
- Nút "💰 Đề nghị giá" (nếu sản phẩm `Available`)
- Nút "Liên hệ người bán"
- Nút "Yêu thích"
- Nút "So sánh"

**File:** `frontend/src/pages/ProductDetail.jsx`

---

### **Trang Quản Lý Đơn Hàng**

**Tabs:**
- **Tất cả**: Tất cả đơn hàng (mua + bán)
- **Đơn mua**: Chỉ đơn hàng người dùng là buyer
- **Đơn bán**: Chuyển đến Seller Dashboard

**Hành động theo trạng thái:**

**pending:**
- Người mua: Có thể hủy đơn hàng

**confirmed:**
- Người mua: Có thể xác nhận đã nhận hàng → `completed`

**completed:**
- Hiển thị link "Đánh giá sản phẩm"

**File:** `frontend/src/pages/Orders.jsx`

---

## 🔔 Thông Báo (Notifications)

Hệ thống tự động gửi thông báo cho:

1. **Người bán:**
   - Khi có offer mới
   - Khi người mua chấp nhận counter offer

2. **Người mua:**
   - Khi offer được chấp nhận → Order được tạo
   - Khi offer bị từ chối
   - Khi có counter offer

**File:** `backend/utils/notifications.js`

---

## 📊 API Endpoints

### **Offer APIs**

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/offers` | Tạo offer mới |
| GET | `/api/offers?type=sent/received/all` | Lấy danh sách offers |
| PUT | `/api/offers/:id/accept` | Chấp nhận offer (seller) |
| PUT | `/api/offers/:id/reject` | Từ chối offer (seller) |
| PUT | `/api/offers/:id/counter` | Thương lượng lại (seller) |
| PUT | `/api/offers/:id/accept-counter` | Chấp nhận counter offer (buyer) |
| PUT | `/api/offers/:id/cancel` | Hủy offer (buyer) |

**File:** `backend/routes/offer.js`

---

### **Order APIs**

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders?type=buying/selling/all&status=...` | Lấy danh sách orders |
| GET | `/api/orders/:id` | Lấy chi tiết order |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái order |

**File:** `backend/routes/order.js`

---

## 🔍 Điểm Quan Trọng

### **1. Order được tạo tự động**
- Order KHÔNG được tạo thủ công
- Chỉ được tạo khi:
  - Seller accept offer
  - Buyer accept counter offer

### **2. Sản phẩm được đánh dấu "Sold"**
- Khi Order được tạo → Product `status = 'Sold'`
- Khi Order bị hủy → Product `status = 'Available'` (trở lại)

### **3. Không có thanh toán trực tuyến**
- Hệ thống chỉ quản lý đơn hàng, không xử lý thanh toán
- Người mua và người bán tự giao dịch ngoài hệ thống

### **4. Quyền truy cập**
- Chỉ buyer và seller của order mới có thể xem/cập nhật order đó
- Kiểm tra quyền trong middleware `protect`

---

## 🚀 Cải Tiến Có Thể Thêm

1. **Tạo Order trực tiếp** (không qua Offer)
   - Cho phép mua ngay với giá gốc
   - Tạo API `POST /api/orders` mới

2. **Trạng thái "confirmed"**
   - Hiện tại chưa có API để seller confirm order
   - Có thể thêm: `PUT /api/orders/:id/confirm`

3. **Thanh toán tích hợp**
   - Tích hợp ví điện tử, chuyển khoản
   - Quản lý trạng thái thanh toán

4. **Đánh giá sau mua hàng**
   - Tự động mở form đánh giá khi order `completed`
   - Link trong Orders.jsx đã có sẵn

---

## 📝 Tóm Tắt Luồng

```
1. Buyer xem sản phẩm → Tạo Offer
2. Seller nhận Offer → Chọn: Accept / Reject / Counter
3. Nếu Accept hoặc Buyer accept Counter:
   → Tạo Order (status: pending)
   → Product status: Sold
4. Buyer/Seller cập nhật Order status:
   pending → confirmed → completed
   hoặc cancelled (bất cứ lúc nào)
5. Khi completed → Buyer có thể đánh giá
```

---

**Tài liệu này giải thích toàn bộ logic mua hàng trong hệ thống của bạn. Nếu cần làm rõ phần nào, hãy hỏi thêm!** 🎉

