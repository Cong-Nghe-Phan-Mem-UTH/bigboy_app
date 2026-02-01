# 🔧 Quick Fix cho lỗi Network Error

## Vấn đề
Mobile app không thể kết nối đến backend, lỗi: `ERR_NETWORK` khi gọi `/customer/register`

## Giải pháp nhanh (3 bước)

### Bước 1: Đảm bảo Flask backend đang chạy

```bash
cd backend
./restart_server.sh
```

Bạn sẽ thấy output như:
```
============================================================
🚀 Starting Flask app on port 4000
📱 Mobile App URL: http://192.168.100.209:4000
============================================================
```

**Lưu ý IP address hiển thị** (ví dụ: `192.168.100.209`)

### Bước 2: Test API từ terminal

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test connection endpoint
curl http://localhost:4000/api/v1/test-connection

# Hoặc dùng script test
./test_api.sh
```

Nếu các lệnh trên thành công → Backend đang chạy OK ✅

### Bước 3: Cập nhật API URL trong Mobile App

**Tìm file config trong mobile app:**
- `api.js` hoặc `api.ts`
- `config.js` hoặc `constants.js`
- `.env` file

**Cập nhật base URL:**

```javascript
// ❌ SAI - Relative URL
const API_BASE_URL = '/customer/register';

// ✅ ĐÚNG - Full URL với IP của máy tính
const API_BASE_URL = 'http://192.168.100.209:4000/api/v1';
// Hoặc IP khác hiển thị trong log khi chạy Flask server
```

**Ví dụ trong `api.js`:**
```javascript
// Trước (SAI)
axios.post('/customer/register', data)

// Sau (ĐÚNG)
const API_BASE_URL = 'http://192.168.100.209:4000/api/v1';
axios.post(`${API_BASE_URL}/customer/register`, data)
```

## Kiểm tra nhanh

### 1. Backend có chạy không?
```bash
curl http://localhost:4000/health
# Phải trả về: {"status": "ok", ...}
```

### 2. Mobile app có thể kết nối không?
- Mở mobile app
- Thử gọi test endpoint: `http://192.168.100.209:4000/api/v1/test-connection`
- Nếu thành công → API URL đúng ✅
- Nếu lỗi → Kiểm tra lại IP và port

### 3. Cùng mạng WiFi?
- Mobile app và máy tính phải cùng WiFi
- Hoặc dùng ngrok (xem bên dưới)

## Nếu vẫn lỗi: Dùng Ngrok

```bash
# Terminal 1: Start Flask
./restart_server.sh

# Terminal 2: Start ngrok
ngrok http 4000

# Terminal 3: Lấy ngrok URL
./get_ngrok_url.sh
# Sẽ hiển thị: https://abc123.ngrok.io

# Trong mobile app, dùng ngrok URL:
const API_BASE_URL = 'https://abc123.ngrok.io/api/v1';
```

## Checklist

- [ ] Flask backend chạy trên port 4000
- [ ] Test `curl http://localhost:4000/health` thành công
- [ ] API_BASE_URL trong mobile app là full URL (không phải relative)
- [ ] IP address trong API_BASE_URL đúng với IP hiển thị trong Flask log
- [ ] Mobile app và máy tính cùng WiFi (hoặc dùng ngrok)
- [ ] Endpoint đúng: `/api/v1/customer/register` (không phải `/customer/register`)

## Endpoint đúng

```
POST http://<IP>:4000/api/v1/customer/register
Content-Type: application/json

{
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "123456",
  "phone": "0123456789"
}
```

## Debug tips

1. **Xem logs trong Flask terminal** khi mobile app gọi API
2. **Kiểm tra network tab** trong mobile app debugger
3. **Test bằng Postman/curl** trước khi test từ mobile app
4. **Đảm bảo không có firewall** chặn port 4000

