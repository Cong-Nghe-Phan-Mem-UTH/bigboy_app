# Reservation Workflow - Quy trình đặt bàn

## Tổng quan

Hệ thống đặt bàn hoạt động theo mô hình **2 phía**:

1. **Customer (Mobile App)** - Khách hàng đặt bàn
2. **Restaurant Staff (Web/Admin Panel)** - Nhà hàng duyệt đặt bàn

## Trạng thái đặt bàn (Reservation Status)

- **PENDING** - Đang chờ duyệt (mặc định khi tạo)
- **CONFIRMED** - Đã được duyệt
- **CANCELLED** - Đã hủy
- **COMPLETED** - Đã hoàn thành (sau khi khách đến)

## Workflow

### 1. Customer đặt bàn (Mobile App)

**Endpoint:** `POST /api/v1/restaurants/<restaurant_id>/reservations`

```json
{
  "date": "2026-01-30T00:00:00Z",
  "time": "19:00",
  "guests": 4,
  "table_number": 5,
  "notes": "Bàn gần cửa sổ"
}
```

**Response:**

- Status mặc định: `PENDING`
- Customer nhận được thông báo "Đặt bàn thành công! Đang chờ nhà hàng xác nhận"

### 2. Customer xem trạng thái đặt bàn

**Endpoint:** `GET /api/v1/reservations`

Customer có thể:

- Xem danh sách tất cả đặt bàn của mình
- Xem trạng thái: PENDING, CONFIRMED, CANCELLED
- Hủy đặt bàn nếu chưa được duyệt

### 3. Restaurant Staff xem danh sách đặt bàn

**Endpoint:** `GET /api/v1/restaurants/my/reservations`

**Authentication:** Restaurant staff token (Manager/Owner/Employee)

**Query Parameters:**

- `status` - Lọc theo trạng thái (Pending, Confirmed, Cancelled, Completed)
- `page` - Số trang
- `limit` - Số lượng mỗi trang

**Response:**

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "customer_id": 4,
        "customer_name": "Đại Vũ",
        "table_number": 5,
        "date": "2026-01-30T00:00:00Z",
        "time": "19:00",
        "guests": 4,
        "status": "Pending",
        "notes": "Bàn gần cửa sổ",
        "created_at": "2026-01-29T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 4. Restaurant Staff duyệt đặt bàn

Có 3 cách để duyệt:

#### a) Approve (Duyệt)

**Endpoint:** `PUT /api/v1/restaurants/my/reservations/<id>/approve`

**Authentication:** Manager hoặc Owner

**Response:**

- Status chuyển từ `PENDING` → `CONFIRMED`
- Customer sẽ thấy trạng thái "Đã xác nhận" khi xem lại

#### b) Reject (Từ chối)

**Endpoint:** `PUT /api/v1/restaurants/my/reservations/<id>/reject`

**Body:**

```json
{
  "reason": "Bàn đã được đặt trước"
}
```

**Response:**

- Status chuyển từ `PENDING` → `CANCELLED`
- Lý do từ chối được lưu vào `notes`

#### c) Update Status (Cập nhật trạng thái tổng quát)

**Endpoint:** `PUT /api/v1/restaurants/my/reservations/<id>/status`

**Body:**

```json
{
  "status": "Confirmed", // hoặc "Cancelled", "Completed"
  "notes": "Ghi chú thêm"
}
```

## Liên kết với hệ thống nhà hàng

### Option 1: Web Dashboard (Khuyến nghị)

Tạo một **Web Dashboard** cho restaurant staff:

- Login với tài khoản restaurant (`/auth/login`)
- Xem danh sách đặt bàn real-time
- Duyệt/từ chối với 1 click
- Xem thống kê: số đặt bàn hôm nay, tuần này, tháng này

**Tech stack đề xuất:**

- React/Vue.js frontend
- Sử dụng cùng API backend
- Real-time updates với WebSocket hoặc polling

### Option 2: Tích hợp vào hệ thống POS hiện có

Nếu nhà hàng đã có hệ thống POS:

- Tạo **webhook** để gửi notification khi có đặt bàn mới
- Hoặc tích hợp API vào hệ thống POS của họ
- Sync dữ liệu qua API

**Webhook example:**

```python
# Khi có đặt bàn mới
if reservation.status == ReservationStatus.PENDING:
    send_webhook(restaurant.webhook_url, {
        "event": "new_reservation",
        "reservation_id": reservation.id,
        "customer_name": customer.name,
        "date": reservation.date,
        "time": reservation.time,
        "guests": reservation.guests
    })
```

### Option 3: Email/SMS Notification

Gửi email/SMS cho restaurant khi có đặt bàn mới:

- Email: "Có đặt bàn mới từ [Customer Name]"
- SMS: "Đặt bàn mới: [Date] [Time], [Guests] khách"

## Notification cho Customer

Khi restaurant duyệt/từ chối, có thể gửi notification cho customer:

**Khi APPROVE:**

- Push notification: "Đặt bàn của bạn đã được xác nhận!"
- Email: "Nhà hàng [Name] đã xác nhận đặt bàn của bạn"

**Khi REJECT:**

- Push notification: "Đặt bàn của bạn đã bị từ chối"
- Email: "Nhà hàng [Name] không thể xác nhận đặt bàn. Lý do: [reason]"

## Database Schema

```sql
reservations
├── id
├── tenant_id (FK → tenants.id)
├── customer_id (FK → customers.id)
├── table_number
├── date
├── time
├── guests
├── status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
├── notes
├── created_at
└── updated_at
```

## API Endpoints Summary

### Customer Endpoints

- `POST /restaurants/<id>/reservations` - Tạo đặt bàn
- `GET /reservations` - Xem danh sách đặt bàn của mình
- `PUT /reservations/<id>` - Cập nhật đặt bàn
- `DELETE /reservations/<id>` - Hủy đặt bàn

### Restaurant Staff Endpoints

- `GET /restaurants/my/reservations` - Xem tất cả đặt bàn của nhà hàng
- `PUT /restaurants/my/reservations/<id>/approve` - Duyệt đặt bàn
- `PUT /restaurants/my/reservations/<id>/reject` - Từ chối đặt bàn
- `PUT /restaurants/my/reservations/<id>/status` - Cập nhật trạng thái

## Next Steps

1. ✅ Backend API đã sẵn sàng
2. 🔲 Tạo Web Dashboard cho restaurant staff
3. 🔲 Thêm push notification cho customer
4. 🔲 Thêm email/SMS notification
5. 🔲 Thêm real-time updates (WebSocket)
6. 🔲 Thêm thống kê đặt bàn (dashboard analytics)
