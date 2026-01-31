# Hướng dẫn chạy toàn bộ hệ thống

## Tổng quan

Hệ thống BigBoy có **3 phần chính**:

1. **Backend API** (Flask) - **CHUNG** cho cả web và mobile
2. **Web Dashboard** (React) - Cho restaurant staff
3. **Mobile App** (React Native) - Cho khách hàng

## ⚠️ QUAN TRỌNG: Backend là CHUNG

**Backend Flask chỉ cần chạy 1 lần**, cả web dashboard và mobile app đều dùng chung backend đó.

```
┌─────────────────┐
│  Backend Flask  │ ← CHUNG cho cả 2
│  (Port 4000)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│  Web   │ │  Mobile  │
│Dashboard│ │   App    │
│(Port   │ │  (Expo)  │
│ 3000)  │ │          │
└────────┘ └──────────┘
```

## Cách chạy từng phần

### 1. Backend API (CHUNG)

**Chỉ cần chạy 1 lần**, cả web và mobile đều dùng:

```bash
cd backend
./restart_server.sh
```

Backend sẽ chạy tại: `http://localhost:4000`

**Kiểm tra backend đã chạy:**
```bash
curl http://localhost:4000/health
# Hoặc mở browser: http://localhost:4000/health
```

### 2. Web Dashboard (Restaurant Staff)

**Chạy riêng**, connect đến backend ở port 4000:

```bash
cd web-dashboard
npm install  # Chỉ cần chạy 1 lần
npm run dev
```

Web dashboard sẽ chạy tại: `http://localhost:3000`

**Đăng nhập:**
- Email: `manager@restaurant.com`
- Password: `123456`

*(Cần tạo tài khoản trước: `cd backend && ./create_restaurant_staff.sh`)*

### 3. Mobile App (Khách hàng)

**Chạy riêng**, connect đến backend ở port 4000:

```bash
cd frontend-new
npm install  # Chỉ cần chạy 1 lần
npm start
# Hoặc
npm run web    # Chạy trên web browser
npm run ios    # Chạy trên iOS simulator
npm run android # Chạy trên Android emulator
```

Mobile app sẽ chạy trên Expo (port 19000, 19001, 19002...)

## Thứ tự chạy đúng

### Lần đầu tiên (Setup):

1. **Chạy Backend:**
   ```bash
   cd backend
   ./restart_server.sh
   ```

2. **Tạo tài khoản restaurant staff:**
   ```bash
   cd backend
   ./create_restaurant_staff.sh
   ```

3. **Chạy Web Dashboard** (terminal mới):
   ```bash
   cd web-dashboard
   npm install
   npm run dev
   ```

4. **Chạy Mobile App** (terminal mới):
   ```bash
   cd frontend-new
   npm install
   npm start
   ```

### Các lần sau (Chỉ cần chạy những gì cần):

**Nếu chỉ test Web Dashboard:**
```bash
# Terminal 1: Backend
cd backend && ./restart_server.sh

# Terminal 2: Web Dashboard
cd web-dashboard && npm run dev
```

**Nếu chỉ test Mobile App:**
```bash
# Terminal 1: Backend
cd backend && ./restart_server.sh

# Terminal 2: Mobile App
cd frontend-new && npm start
```

**Nếu test cả 2:**
```bash
# Terminal 1: Backend (CHUNG)
cd backend && ./restart_server.sh

# Terminal 2: Web Dashboard
cd web-dashboard && npm run dev

# Terminal 3: Mobile App
cd frontend-new && npm start
```

## Cấu hình API URL

### Web Dashboard

File: `web-dashboard/src/services/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
```

Có thể tạo file `.env`:
```env
VITE_API_URL=http://localhost:4000/api/v1
```

### Mobile App

File: `frontend-new/src/constants/config.js`

```javascript
const API_BASE_URL = 'http://localhost:4000/api/v1'
// Hoặc dùng ngrok URL nếu test trên điện thoại thật
```

## Ports sử dụng

- **Backend**: `4000` (CHUNG)
- **Web Dashboard**: `3000`
- **Mobile App (Expo)**: `19000`, `19001`, `19002`...

## Troubleshooting

### Backend không chạy
```bash
cd backend
./restart_server.sh
# Kiểm tra log xem có lỗi gì không
```

### Web Dashboard không connect được backend
1. Kiểm tra backend có chạy không: `curl http://localhost:4000/health`
2. Kiểm tra API URL trong `web-dashboard/src/services/api.js`
3. Kiểm tra CORS trong backend (đã enable sẵn)

### Mobile App không connect được backend
1. Nếu test trên điện thoại thật: Cần dùng ngrok hoặc IP local network
2. Kiểm tra API URL trong `frontend-new/src/constants/config.js`
3. Đảm bảo backend đang chạy

### Cả 2 không hoạt động
- **Đảm bảo backend đang chạy** - Đây là phần quan trọng nhất!
- Backend phải chạy trước khi chạy web hoặc mobile

## Tóm tắt

✅ **Backend = CHUNG** - Chỉ cần chạy 1 lần  
✅ **Web Dashboard** - Chạy riêng, connect đến backend  
✅ **Mobile App** - Chạy riêng, connect đến backend  

**Quy tắc vàng:** Luôn chạy Backend trước! 🚀
