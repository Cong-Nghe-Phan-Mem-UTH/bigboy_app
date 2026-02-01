# Hướng dẫn kết nối Mobile App với Backend

## Vấn đề hiện tại

Lỗi "The Internet connection appears to be offline" với URL `exp://192.168.100.209:8081` cho thấy:

- Expo development server không chạy hoặc không thể truy cập
- Mobile app không thể kết nối đến Expo dev server

## Giải pháp

### Bước 1: Kiểm tra Expo Development Server

Trong thư mục **frontend/mobile app**, chạy:

```bash
# Nếu dùng Expo CLI
npx expo start

# Hoặc nếu dùng npm
npm start

# Hoặc với tunnel mode (cho thiết bị thật)
npx expo start --tunnel
```

### Bước 2: Cấu hình API URL trong Mobile App

Mobile app cần trỏ đến Flask backend (port 4000), không phải Expo server (port 8081).

**Tìm file config trong mobile app** (thường là):

- `config.js` hoặc `config.ts`
- `.env` file
- `constants.js` hoặc `constants.ts`

**Cập nhật API_BASE_URL:**

#### Option 1: LAN Mode (cùng WiFi)

```javascript
// Nếu mobile app và máy tính cùng WiFi
const API_BASE_URL = "http://192.168.100.209:4000";
// hoặc IP khác của máy tính (xem trong log khi chạy Flask server)
```

#### Option 2: Ngrok (cho thiết bị thật hoặc test từ xa)

```javascript
// Sau khi chạy ngrok
const API_BASE_URL = "https://abc123.ngrok.io";
```

#### Option 3: Localhost (chỉ cho emulator)

```javascript
// iOS Simulator
const API_BASE_URL = "http://localhost:4000";

// Android Emulator
const API_BASE_URL = "http://10.0.2.2:4000";
```

### Bước 3: Kiểm tra Backend đang chạy

```bash
# Trong thư mục backend
./restart_server.sh

# Kiểm tra server đang chạy
curl http://localhost:4000/health
```

### Bước 4: Test kết nối từ Mobile App

Trong mobile app, test endpoint:

```javascript
// Test connection
fetch("http://192.168.100.209:4000/api/v1/test-connection")
  .then((res) => res.json())
  .then((data) => console.log("Connection OK:", data))
  .catch((err) => console.error("Connection failed:", err));
```

## Troubleshooting

### 1. Expo server không chạy

```bash
# Kill process trên port 8081
lsof -ti:8081 | xargs kill -9

# Restart Expo
npx expo start --clear
```

### 2. IP address không đúng

```bash
# Tìm IP của máy tính
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Hoặc xem trong log khi chạy Flask server
# Sẽ hiển thị: 📱 Mobile App URL: http://192.168.x.x:4000
```

### 3. Firewall chặn kết nối

```bash
# macOS - Cho phép incoming connections
# System Preferences > Security & Privacy > Firewall
# Thêm Python và Node vào exceptions
```

### 4. Mobile app và máy tính không cùng mạng

- Đảm bảo cả hai cùng WiFi
- Hoặc dùng ngrok tunnel

## Checklist

- [ ] Flask backend đang chạy trên port 4000
- [ ] Expo dev server đang chạy (nếu cần)
- [ ] API_BASE_URL trong mobile app trỏ đúng đến Flask backend
- [ ] Mobile app và máy tính cùng WiFi (hoặc dùng ngrok)
- [ ] Firewall không chặn port 4000
- [ ] Test endpoint `/api/v1/test-connection` thành công

## Quick Start

```bash
# Terminal 1: Start Flask backend
cd backend
./restart_server.sh

# Terminal 2: Start Expo (nếu cần)
cd mobile-app
npx expo start

# Terminal 3: Get ngrok URL (nếu dùng ngrok)
cd backend
./start_with_ngrok.sh
./get_ngrok_url.sh
```
