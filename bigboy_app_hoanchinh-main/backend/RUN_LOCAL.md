# 💻 Chạy Mobile App Local trên Máy tính

## Option 1: iOS Simulator (macOS)

### Bước 1: Cài đặt Xcode (nếu chưa có)
```bash
# Tải từ App Store hoặc
xcode-select --install
```

### Bước 2: Chạy Expo với iOS Simulator
```bash
cd frontend  # hoặc frontend-new
npx expo start --ios
```

Hoặc:
```bash
npx expo start
# Sau đó nhấn 'i' để mở iOS Simulator
```

### Bước 3: Cập nhật API URL cho Simulator
Trong file `src/constants/config.js`:
```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000'  // ✅ Dùng localhost cho Simulator
  : 'https://api.bigboy.com';
```

## Option 2: Android Emulator

### Bước 1: Cài đặt Android Studio
- Tải từ: https://developer.android.com/studio
- Cài đặt Android SDK và tạo một emulator

### Bước 2: Chạy Expo với Android Emulator
```bash
cd frontend  # hoặc frontend-new
npx expo start --android
```

Hoặc:
```bash
npx expo start
# Sau đó nhấn 'a' để mở Android Emulator
```

### Bước 3: Cập nhật API URL cho Emulator
Trong file `src/constants/config.js`:
```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000'  // ✅ Dùng 10.0.2.2 cho Android Emulator
  : 'https://api.bigboy.com';
```

## Option 3: Web Browser (Dễ nhất!)

### Chạy trên trình duyệt web
```bash
cd frontend  # hoặc frontend-new
npx expo start --web
```

Hoặc:
```bash
npx expo start
# Sau đó nhấn 'w' để mở web browser
```

### Cập nhật API URL cho Web
Trong file `src/constants/config.js`:
```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000'  // ✅ Dùng localhost cho web
  : 'https://api.bigboy.com';
```

## Quick Start (Khuyến nghị)

### Terminal 1: Backend
```bash
cd backend
./restart_server.sh
```

### Terminal 2: Frontend (Web - Dễ nhất)
```bash
cd frontend  # hoặc frontend-new
npx expo start --web
```

Sau đó:
- Mở browser: http://localhost:19006
- Test đăng ký ngay trên browser

## Cấu hình API URL theo môi trường

Tạo file `src/constants/config.js` với logic tự động:

```javascript
// Detect environment
const getBaseURL = () => {
  if (__DEV__) {
    // Web browser
    if (typeof window !== 'undefined') {
      return 'http://localhost:4000';
    }
    // iOS Simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:4000';
    }
    // Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000';
    }
    // Physical device (fallback)
    return 'http://192.168.100.209:4000';
  }
  return 'https://api.bigboy.com';
};

export const API_BASE_URL = getBaseURL();
export const API_VERSION = '/api/v1';
```

## So sánh các options

| Option | Dễ setup | Tốc độ | Test UI | Test Native |
|--------|----------|--------|---------|-------------|
| Web | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| iOS Simulator | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Android Emulator | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Physical Device | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Khuyến nghị

**Cho test nhanh:** Dùng **Web** (`npx expo start --web`)
- Setup nhanh nhất
- Test API và logic dễ dàng
- Không cần cài thêm gì

**Cho test UI đầy đủ:** Dùng **iOS Simulator** hoặc **Android Emulator**
- Test được native components
- Gần giống thiết bị thật nhất

## Troubleshooting

### Web không chạy được
```bash
# Cài thêm dependencies
npm install react-dom react-native-web
```

### Simulator không mở được
```bash
# Kiểm tra Xcode đã cài
xcode-select -p

# Mở Simulator thủ công
open -a Simulator
```

### Emulator không mở được
```bash
# Kiểm tra Android Studio đã cài
# Và emulator đã được tạo trong Android Studio
```
