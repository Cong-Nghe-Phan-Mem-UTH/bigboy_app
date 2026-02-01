# 🚀 Hướng dẫn chạy Backend

## Cách 1: Dùng script (Khuyến nghị)

```bash
# Trong thư mục backend
./restart_server.sh
```

Script này sẽ:
- Tự động kill process cũ trên port 4000
- Start Flask server mới
- Hiển thị IP và URL để mobile app kết nối

## Cách 2: Chạy trực tiếp

```bash
# Trong thư mục backend
python app/main.py
```

Hoặc:

```bash
python -m app.main
```

## Cách 3: Dùng Flask CLI

```bash
# Set environment variables
export FLASK_APP=app/main.py
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Run
flask run --host=0.0.0.0 --port=4000
```

## Kiểm tra server đang chạy

Sau khi chạy, bạn sẽ thấy:

```
============================================================
🚀 Starting Flask app on port 4000
📊 Debug mode: False
🌐 Environment: Development
🔗 Local URL: http://localhost:4000
📱 Mobile App URL: http://192.168.100.209:4000
🔍 Health check: http://192.168.100.209:4000/health
📝 Test endpoint: http://192.168.100.209:4000/test
============================================================
 * Serving Flask app 'app.create_app'
 * Running on http://0.0.0.0:4000
```

## Test server

Mở terminal khác và test:

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test connection endpoint
curl http://localhost:4000/api/v1/test-connection
```

Hoặc dùng script test:

```bash
./test_api.sh
```

## Troubleshooting

### Port 4000 đã được sử dụng

```bash
# Kill process trên port 4000
lsof -ti:4000 | xargs kill -9

# Hoặc dùng port khác
PORT=4001 python app/main.py
```

### Lỗi module không tìm thấy

```bash
# Đảm bảo đang ở thư mục backend
cd backend

# Activate virtual environment (nếu có)
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate  # Windows

# Chạy lại
python app/main.py
```

### Lỗi database connection

Kiểm tra file `.env` hoặc `app/config.py`:
- DATABASE_URI phải đúng
- Database server phải đang chạy

## Quick Start

```bash
# 1. Vào thư mục backend
cd backend

# 2. Activate virtual environment (nếu có)
source venv/bin/activate

# 3. Chạy server
./restart_server.sh

# 4. Kiểm tra log - sẽ thấy IP address
# 5. Cập nhật IP đó vào mobile app config
```

## Lưu ý

- Server chạy trên `0.0.0.0:4000` để có thể truy cập từ mạng local
- IP hiển thị trong log là IP để mobile app kết nối
- Nếu mobile app và máy tính không cùng WiFi, dùng ngrok (xem `start_with_ngrok.sh`)
