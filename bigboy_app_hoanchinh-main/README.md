# BigBoy - SaaS Smart Restaurant Management Platform

Nền tảng SaaS quản lý nhà hàng thông minh với gọi món qua mã QR (S2O - Scan2Order)

## Tổng quan

BigBoy là một nền tảng SaaS Multi-tenant cho phép các nhà hàng quản lý hoạt động của mình thông qua:
- QR code menu cho khách hàng
- Hệ thống quản lý đơn hàng real-time
- Quản lý bàn, món ăn, nhân viên
- Dashboard và báo cáo doanh thu
- Multi-branch support
- Mobile App cho khách hàng

## Cấu trúc Project

```
app-bigboy/
├── backend/          # Backend API (Flask + PostgreSQL)
├── docker-compose.yml
└── README.md
```

## Yêu cầu hệ thống

- Python >= 3.11 (cho backend)
- PostgreSQL >= 14 (hoặc SQLite cho development)
- Redis (cho caching và real-time - tùy chọn)

## Cài đặt

### Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Copy và cấu hình .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database và config của bạn

# Chạy development server
python app/main.py
```

Backend sẽ chạy tại: `http://localhost:4000`

## Tính năng chính

### 1. Multi-tenant Architecture
- Mỗi nhà hàng (tenant) có data riêng biệt
- Hỗ trợ nhiều nhà hàng trên cùng một platform
- Tenant identification qua header `X-Tenant-ID`

### 2. Guest (Khách vãng lai)
- Quét QR code để xem menu
- Đặt món trực tiếp từ web app
- Theo dõi trạng thái đơn hàng real-time
- Yêu cầu thanh toán

### 3. Customer (Khách hàng - Mobile App)
- Đăng ký/Đăng nhập
- Xem danh sách nhà hàng
- Tìm kiếm và xem nhà hàng đề xuất
- Quét mã QR menu
- Đánh giá nhà hàng
- Đặt bàn
- Xem lịch sử món ăn và nhà hàng đã ghé
- Hệ thống hạng thành viên (Sắt, Bạc, Vàng, Kim cương)
- Tích điểm tự động

### 4. Restaurant Management
- Quản lý món ăn (CRUD)
- Quản lý bàn và trạng thái bàn
- Xử lý đơn hàng real-time
- Dashboard và báo cáo doanh thu
- Quản lý nhân viên và phân quyền
- Tạo QR code cho từng bàn
- Quản lý giảm giá

### 5. Admin
- Quản lý tất cả nhà hàng trên platform
- Phê duyệt đăng ký nhà hàng
- Cấu hình hệ thống
- Quản lý người dùng

## Công nghệ sử dụng

### Backend
- **Runtime**: Python 3.11+
- **Framework**: Flask 2.3+
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Cache**: Redis (tùy chọn)
- **Real-time**: Socket.IO (có thể thêm)
- **Authentication**: JWT


## Database Schema

Hệ thống sử dụng SQLAlchemy với các model chính:
- `Tenant` - Nhà hàng (Multi-tenant)
- `Branch` - Chi nhánh
- `Account` - Tài khoản (Admin, Owner, Employee)
- `Customer` - Khách hàng (Mobile App)
- `Dish` - Món ăn
- `Table` - Bàn
- `Order` - Đơn hàng
- `Guest` - Khách hàng (QR users)
- `Review` - Đánh giá
- `Reservation` - Đặt bàn
- `CustomerHistory` - Lịch sử khách hàng
- `Discount` - Giảm giá

## API Endpoints

Xem chi tiết trong:
- [Backend README](./backend/README.md)

## Tài khoản mặc định

Sau khi setup database, tài khoản admin mặc định:
- **Email**: admin@bigboy.com
- **Password**: 123456

## Development

### Backend
```bash
cd backend
python app/main.py        # Development với hot reload
```

## Docker

Sử dụng Docker Compose để chạy PostgreSQL và Redis:

```bash
docker-compose up -d
```

## License

ISC

## Tác giả

Dự án được phát triển dựa trên yêu cầu của đề tài tốt nghiệp.
