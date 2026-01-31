# PROMPT ĐỂ TẠO REACT NATIVE MOBILE APP

Copy toàn bộ nội dung dưới đây và paste vào tab/chat mới trong Cursor:

---

## YÊU CẦU TẠO REACT NATIVE MOBILE APP

Tôi cần bạn tạo một **React Native Mobile App** cho nền tảng SaaS quản lý nhà hàng thông minh với gọi món qua mã QR (BigBoy).

### Backend API đã có sẵn:
- **API Base URL**: `http://localhost:4000` (hoặc production URL)
- **API Documentation**: Backend Flask đã có đầy đủ endpoints

### Các API Endpoints chính:

#### 1. Customer Authentication (`/api/v1/customer`)
- `POST /register` - Đăng ký khách hàng
- `POST /login` - Đăng nhập khách hàng  
- `GET /me` - Thông tin khách hàng

#### 2. Mobile App - Restaurant Discovery (`/api/v1/mobile`)
- `GET /restaurants` - Danh sách nhà hàng (có search, filter)
- `GET /restaurants/recommended` - Nhà hàng đề xuất (top rated)
- `GET /restaurants/{id}` - Chi tiết nhà hàng
- `GET /restaurants/{id}/directions` - Chỉ đường (Google Maps URL)

#### 3. QR Code (`/api/v1/qr`)
- `POST /scan` - Quét mã QR menu (body: `{ "token": "qr_token" }`)

#### 4. Reviews (`/api/v1`)
- `GET /restaurants/{id}/reviews` - Danh sách đánh giá
- `POST /restaurants/{id}/reviews` - Tạo đánh giá (body: `{ "rating": 1-5, "comment": "...", "dish_ratings": {...} }`)
- `PUT /reviews/{id}` - Sửa đánh giá
- `DELETE /reviews/{id}` - Xóa đánh giá

#### 5. Reservations - Đặt bàn (`/api/v1`)
- `POST /restaurants/{id}/reservations` - Đặt bàn (body: `{ "date": "2024-01-15", "time": "19:00", "guests": 4, "table_number": 1 }`)
- `GET /reservations` - Lịch sử đặt bàn
- `PUT /reservations/{id}` - Cập nhật đặt bàn
- `DELETE /reservations/{id}` - Hủy đặt bàn

#### 6. Customer History (`/api/v1`)
- `GET /history` - Lịch sử món ăn, nhà hàng đã ghé, tổng chi tiêu
- `GET /history/restaurants` - Danh sách nhà hàng đã ghé

#### 7. Membership (`/api/v1/membership`)
- `GET /tiers` - Thông tin các hạng thành viên (Sắt, Bạc, Vàng, Kim cương)
- `GET /my-tier` - Hạng thành viên hiện tại
- `POST /update-tier` - Cập nhật hạng

#### 8. Guest - QR Menu (`/api/v1/guest`)
- `POST /auth/login` - Guest login qua QR token (body: `{ "name": "Guest Name", "table_token": "qr_token" }`)
- `POST /orders` - Đặt món từ guest (body: `{ "orders": [{ "dish_id": 1, "quantity": 2, "notes": "..." }], "table_number": 1 }`)
- `GET /orders` - Lịch sử order của guest

#### 9. Dishes (`/api/v1/dishes`)
- `GET /` - Danh sách món ăn (query: `?page=1&limit=10&category=...&status=...`)
- `GET /{dish_id}` - Chi tiết món ăn

### Authentication:
- Tất cả API cần authentication (trừ public endpoints) đều dùng **JWT Bearer Token**
- Header: `Authorization: Bearer <access_token>`
- Token được trả về từ `/api/v1/customer/login` hoặc `/api/v1/guest/auth/login`

### Yêu cầu chức năng Mobile App:

1. **Authentication Flow:**
   - Màn hình Đăng nhập / Đăng ký
   - Lưu token vào AsyncStorage
   - Auto login nếu có token hợp lệ

2. **Restaurant Discovery:**
   - Màn hình danh sách nhà hàng (có search bar)
   - Màn hình nhà hàng đề xuất
   - Màn hình chi tiết nhà hàng (thông tin, đánh giá, menu)
   - Chỉ đường đến nhà hàng (mở Google Maps)

3. **QR Code Scanner:**
   - Màn hình quét QR code
   - Sau khi quét, hiển thị menu nhà hàng và cho phép đặt món
   - Guest login tự động khi quét QR

4. **Menu & Ordering:**
   - Màn hình menu (danh sách món ăn)
   - Màn hình chi tiết món ăn
   - Thêm vào giỏ hàng
   - Màn hình giỏ hàng
   - Đặt món (có thể thêm ghi chú)
   - Theo dõi trạng thái đơn hàng real-time

5. **Reviews & Ratings:**
   - Xem đánh giá nhà hàng
   - Tạo/sửa/xóa đánh giá
   - Đánh giá món ăn cụ thể

6. **Table Reservations:**
   - Màn hình đặt bàn
   - Chọn ngày, giờ, số người
   - Xem lịch sử đặt bàn
   - Hủy đặt bàn

7. **Customer Profile:**
   - Thông tin cá nhân
   - Lịch sử món ăn đã ăn
   - Danh sách nhà hàng đã ghé
   - Tổng chi tiêu
   - Hạng thành viên (Sắt, Bạc, Vàng, Kim cương)
   - Điểm tích lũy

8. **History:**
   - Lịch sử đơn hàng
   - Lịch sử nhà hàng đã ghé
   - Thống kê (tổng chi tiêu, số món đã ăn, v.v.)

### Yêu cầu kỹ thuật:

- **Framework**: React Native (Expo hoặc bare React Native)
- **Navigation**: React Navigation
- **State Management**: Zustand hoặc Redux Toolkit
- **API Calls**: Axios hoặc fetch
- **Storage**: AsyncStorage cho token và user data
- **UI Library**: React Native Paper, NativeBase, hoặc tự build với StyleSheet
- **QR Scanner**: `expo-camera` hoặc `react-native-qrcode-scanner`
- **Maps**: `react-native-maps` hoặc mở Google Maps URL
- **Icons**: `react-native-vector-icons` hoặc `@expo/vector-icons`

### Giao diện:
- Giao diện hiện đại, clean
- Dark mode support (tùy chọn)
- Responsive cho cả iOS và Android
- Avatar và styling tương tự web BigBoy

### Cấu trúc project mong muốn:

```
mobile-app/
├── src/
│   ├── screens/          # Các màn hình
│   │   ├── auth/
│   │   ├── restaurants/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── reviews/
│   │   ├── reservations/
│   │   ├── profile/
│   │   └── history/
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── utils/           # Utilities
│   └── constants/       # Constants, config
├── App.js / App.tsx
└── package.json
```

### Bắt đầu:
Hãy tạo React Native app với đầy đủ các chức năng trên. Bắt đầu với:
1. Setup project React Native
2. Cấu hình navigation
3. Tạo các màn hình authentication
4. Tích hợp API calls
5. Implement các tính năng theo thứ tự ưu tiên

---

**Lưu ý**: Backend API đã sẵn sàng tại `http://localhost:4000`. Tất cả endpoints đã được implement đầy đủ.

