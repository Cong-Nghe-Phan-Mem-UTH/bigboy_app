# PROMPT NGẮN GỌN - COPY VÀO CHAT MỚI

---

Tạo React Native Mobile App cho nền tảng quản lý nhà hàng BigBoy.

**Backend API**: `http://localhost:4000/api/v1`

**Các tính năng cần có:**
1. Đăng nhập/Đăng ký khách hàng
2. Xem danh sách nhà hàng (search, filter, recommended)
3. Quét QR code để xem menu và đặt món
4. Đánh giá nhà hàng (xem, tạo, sửa, xóa)
5. Đặt bàn
6. Lịch sử món ăn, nhà hàng đã ghé, tổng chi tiêu
7. Hạng thành viên (Sắt, Bạc, Vàng, Kim cương) và tích điểm
8. Profile khách hàng

**Tech Stack:**
- React Native (Expo)
- React Navigation
- Zustand hoặc Redux
- Axios
- AsyncStorage
- QR Scanner library
- React Native Maps

**API Endpoints chính:**
- `/api/v1/customer/login`, `/register`, `/me`
- `/api/v1/mobile/restaurants`, `/restaurants/recommended`
- `/api/v1/qr/scan`
- `/api/v1/restaurants/{id}/reviews` (GET, POST)
- `/api/v1/restaurants/{id}/reservations` (POST)
- `/api/v1/history`, `/history/restaurants`
- `/api/v1/membership/tiers`, `/my-tier`

Tất cả API cần JWT token trong header: `Authorization: Bearer <token>`

Hãy tạo app với giao diện đẹp, hiện đại, tương tự web BigBoy.

---

