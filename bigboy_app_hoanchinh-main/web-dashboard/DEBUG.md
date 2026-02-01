# Debug Guide - Web Dashboard

## Trang trắng không hiển thị gì?

### Bước 1: Kiểm tra Browser Console

1. Mở Browser Console:
   - **Chrome/Edge**: F12 hoặc Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
   - **Firefox**: F12 hoặc Cmd+Option+K (Mac) / Ctrl+Shift+K (Windows)

2. Xem tab **Console** - có lỗi màu đỏ không?

### Bước 2: Kiểm tra Network Requests

1. Mở tab **Network** trong DevTools
2. Refresh trang (F5)
3. Xem các request:
   - Request đến `/api/v1/restaurants/my/reservations` có fail không?
   - Status code là gì? (200 = OK, 401 = Unauthorized, 500 = Server Error)

### Bước 3: Kiểm tra Authentication

1. Mở tab **Application** → **Local Storage** → `http://localhost:3000`
2. Kiểm tra có key `restaurant_token` không?
3. Nếu không có → Cần đăng nhập lại

### Bước 4: Kiểm tra Backend

```bash
# Kiểm tra backend có chạy không
curl http://localhost:4000/health

# Hoặc mở browser: http://localhost:4000/health
```

### Bước 5: Kiểm tra API URL

1. Mở file `web-dashboard/src/services/api.js`
2. Kiểm tra `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
   ```
3. Đảm bảo backend đang chạy tại `http://localhost:4000`

## Các lỗi thường gặp

### 1. "Network Error" hoặc "Failed to fetch"
- **Nguyên nhân**: Backend không chạy hoặc CORS issue
- **Giải pháp**: 
  - Chạy backend: `cd backend && ./restart_server.sh`
  - Kiểm tra CORS trong `backend/app/create_app.py`

### 2. "401 Unauthorized"
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Đăng nhập lại

### 3. "Cannot read property 'data' of undefined"
- **Nguyên nhân**: API response không đúng format
- **Giải pháp**: Kiểm tra backend response format

### 4. Trang trắng hoàn toàn
- **Nguyên nhân**: JavaScript error hoặc routing issue
- **Giải pháp**: 
  - Xem Console để tìm lỗi
  - Kiểm tra `main.jsx` có render đúng không
  - Kiểm tra `App.jsx` routing

## Test nhanh

Mở browser console và chạy:

```javascript
// Kiểm tra token
localStorage.getItem('restaurant_token')

// Kiểm tra API
fetch('http://localhost:4000/api/v1/restaurants/my/reservations', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('restaurant_token')
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Reset hoàn toàn

Nếu vẫn không được, thử:

1. Xóa cache và localStorage:
   ```javascript
   // Trong browser console
   localStorage.clear()
   location.reload()
   ```

2. Rebuild project:
   ```bash
   cd web-dashboard
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

3. Kiểm tra lại backend:
   ```bash
   cd backend
   ./restart_server.sh
   ```
