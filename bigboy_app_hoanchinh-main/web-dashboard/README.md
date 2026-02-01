# BigBoy Restaurant Dashboard

Web Dashboard cho nhân viên nhà hàng để quản lý đặt bàn.

## Tính năng

- ✅ Đăng nhập với tài khoản restaurant staff
- ✅ Dashboard với thống kê đặt bàn
- ✅ Xem danh sách đặt bàn
- ✅ Duyệt/Từ chối đặt bàn
- ✅ Lọc đặt bàn theo trạng thái
- ✅ Responsive design

## Cài đặt

```bash
cd web-dashboard
npm install
```

## Chạy Development Server

```bash
npm run dev
```

Dashboard sẽ chạy tại: `http://localhost:3000`

## Cấu hình

Tạo file `.env` (optional):

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Nếu không có file `.env`, mặc định sẽ dùng `http://localhost:4000/api/v1`

## Build Production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`

## Sử dụng

### 1. Đăng nhập

- Sử dụng tài khoản restaurant staff (AccountModel)
- Email và password của nhân viên nhà hàng
- Sau khi đăng nhập, token sẽ được lưu trong localStorage

### 2. Dashboard

- Xem thống kê tổng quan:
  - Tổng số đặt bàn
  - Số đặt bàn chờ duyệt
  - Số đặt bàn đã xác nhận
  - Số đặt bàn hôm nay

### 3. Quản lý đặt bàn

- Xem danh sách tất cả đặt bàn của nhà hàng
- Lọc theo trạng thái: Tất cả, Chờ duyệt, Đã xác nhận, Đã hủy
- Duyệt đặt bàn: Click "Duyệt" để chuyển từ PENDING → CONFIRMED
- Từ chối đặt bàn: Click "Từ chối" và nhập lý do

## API Endpoints sử dụng

- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/restaurants/my/reservations` - Lấy danh sách đặt bàn
- `PUT /api/v1/restaurants/my/reservations/<id>/approve` - Duyệt đặt bàn
- `PUT /api/v1/restaurants/my/reservations/<id>/reject` - Từ chối đặt bàn

## Tạo tài khoản Restaurant Staff

Để test, bạn cần tạo tài khoản restaurant staff trong database:

```python
# Trong Python shell hoặc script
from app.infrastructure.databases import get_session
from app.models.account_model import AccountModel, AccountRole
from app.utils.crypto import hash_password

session = get_session()
try:
    # Tạo tài khoản Manager cho restaurant ID 1
    manager = AccountModel(
        tenant_id=1,  # ID của nhà hàng
        name="Nguyễn Văn A",
        email="manager@restaurant.com",
        password=hash_password("123456"),
        role=AccountRole.MANAGER
    )
    session.add(manager)
    session.commit()
    print("✅ Tạo tài khoản thành công!")
finally:
    session.close()
```

Sau đó đăng nhập với:
- Email: `manager@restaurant.com`
- Password: `123456`

## Tech Stack

- **React 18** - UI Framework
- **React Router** - Routing
- **Axios** - HTTP Client
- **Vite** - Build Tool
- **date-fns** - Date formatting

## Cấu trúc Project

```
web-dashboard/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx
│   ├── pages/          # Pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Reservations.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── reservationService.js
│   ├── utils/          # Utilities
│   │   └── auth.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS, đảm bảo backend đã enable CORS. Kiểm tra `backend/app/create_app.py`:

```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Token không hợp lệ

- Kiểm tra token có được lưu trong localStorage không
- Kiểm tra backend có đang chạy không
- Kiểm tra API URL trong `.env` hoặc `vite.config.js`

### Không thấy đặt bàn

- Đảm bảo tài khoản đăng nhập có `tenant_id` hợp lệ
- Kiểm tra có đặt bàn nào trong database không
- Kiểm tra role của tài khoản (phải là Manager hoặc Owner để duyệt)
