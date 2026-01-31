# Câu lệnh chạy hệ thống BigBoy - Chi tiết

## 🎯 Chạy cả 3 phần (Backend + Web Dashboard + Mobile App)

### Cách 1: Dùng script tự động (Dễ nhất – **không cần bật Docker thủ công**)

Script sẽ tự chạy **Docker (Postgres + Redis)** rồi mới chạy Backend, Web Dashboard và Mobile App:

```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy
chmod +x start_all.sh
./start_all.sh
```

(Lần đầu cần mở **Docker Desktop** một lần; sau đó script tự `docker compose up -d` mỗi khi chạy.)

### Cách 2: Chạy thủ công từng terminal

#### Terminal 1: Backend
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/backend
./restart_server.sh
```

#### Terminal 2: Web Dashboard
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/web-dashboard
npm run dev
```

#### Terminal 3: Mobile App
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/frontend-new
npm start
```

---

## 📝 Chạy từng phần riêng lẻ

### Chỉ chạy Backend
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/backend
./restart_server.sh
```

### Chỉ chạy Web Dashboard
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/web-dashboard
npm run dev
```

### Chỉ chạy Mobile App
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/frontend-new
npm start
```

---

## 🐳 Docker (Database & Redis – “server”)

**Đúng:** Postgres và Redis trong Docker chính là **server** (database + cache) của app. Mỗi lần muốn chạy app (backend), bạn cần **bật Docker** và cho 2 container **postgres** + **redis** chạy.

- Mở **Docker Desktop** → chạy project **app-bigboy** (hoặc `docker compose up -d` trong thư mục app-bigboy).
- Backend kết nối tới Postgres (port 5433) và Redis (port 6379).

Nếu thấy lỗi **"database bigboy does not exist"**: app thực tế dùng database **bigboy_db**. Lỗi thường do tool (ví dụ Docker Desktop) đang kết nối tới tên **bigboy**. Đã thêm script init để tạo sẵn database **bigboy**. Nếu volume Postgres đã tồn tại từ trước, chạy **một lần**:

```bash
docker exec -it bigboy-postgres psql -U bigboy -d bigboy_db -c "CREATE DATABASE bigboy;"
```

Sau đó tắt/mở lại container postgres nếu cần; lỗi sẽ hết.

---

## 🔧 Setup lần đầu (Chỉ cần chạy 1 lần)

### 1. Setup Backend
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Setup Web Dashboard
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/web-dashboard
npm install
```

### 3. Setup Mobile App
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/frontend-new
npm install
```

### 4. Tạo tài khoản restaurant staff
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/backend
./create_restaurant_staff.sh
```

---

## 🚀 Câu lệnh đầy đủ để chạy (Copy paste)

### Terminal 1 - Backend:
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/backend && ./restart_server.sh
```

### Terminal 2 - Web Dashboard:
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/web-dashboard && npm run dev
```

### Terminal 3 - Mobile App:
```bash
cd /Users/mac/Documents/project_cnpm/app-bigboy/frontend-new && npm start
```

---

## 📍 Đường dẫn đầy đủ

- **Backend**: `/Users/mac/Documents/project_cnpm/app-bigboy/backend`
- **Web Dashboard**: `/Users/mac/Documents/project_cnpm/app-bigboy/web-dashboard`
- **Mobile App**: `/Users/mac/Documents/project_cnpm/app-bigboy/frontend-new`

---

## ✅ Kiểm tra đã chạy thành công

### Backend:
```bash
curl http://localhost:4000/health
# Hoặc mở browser: http://localhost:4000/health
```

### Web Dashboard:
```bash
# Mở browser: http://localhost:3000
```

### Mobile App:
```bash
# Xem Expo DevTools hoặc scan QR code
```

---

## 🛑 Dừng tất cả

Nhấn `Ctrl+C` trong từng terminal, hoặc:

```bash
# Tìm và kill processes
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Web Dashboard
lsof -ti:19000 | xargs kill -9 # Expo
```
