# 🔄 Hướng dẫn Restart App

## Vấn đề
Bạn đang ở thư mục `backend` nhưng cần chạy Expo từ thư mục `frontend`.

## Giải pháp

### Cách 1: Chạy từ đúng thư mục

**Cho frontend:**
```bash
cd ../frontend
npx expo start --clear
```

**Cho frontend-new:**
```bash
cd ../frontend-new
npx expo start --clear
```

### Cách 2: Dùng script (đã tạo sẵn)

**Cho frontend:**
```bash
cd ../frontend
./restart_app.sh
```

**Cho frontend-new:**
```bash
cd ../frontend-new
./restart_app.sh
```

## Checklist trước khi restart

1. ✅ **Backend đang chạy:**
   ```bash
   cd backend
   ./restart_server.sh
   ```

2. ✅ **Kiểm tra IP trong config.js:**
   - File: `frontend/src/constants/config.js` hoặc `frontend-new/src/constants/config.js`
   - IP phải đúng với IP hiển thị trong Flask log

3. ✅ **Restart mobile app:**
   ```bash
   cd frontend  # hoặc frontend-new
   npx expo start --clear
   ```

## Sau khi restart

1. Kiểm tra log khi app start:
   - Sẽ thấy: `[API Config] Base URL: http://192.168.100.209:4000/api/v1`

2. Test đăng ký lại

3. Nếu vẫn lỗi, xem log:
   - `[API Error]` sẽ hiển thị full URL đang gọi
   - Kiểm tra xem URL có đúng không

