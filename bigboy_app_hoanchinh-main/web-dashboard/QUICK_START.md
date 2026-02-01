# Quick Start - Restaurant Dashboard

## Bước 1: Cài đặt dependencies

```bash
cd web-dashboard
npm install
```

## Bước 2: Tạo tài khoản restaurant staff

**Cách dễ nhất - Dùng script shell:**
```bash
cd backend
./create_restaurant_staff.sh
```

**Hoặc chạy Python trực tiếp:**
```bash
cd backend
source venv/bin/activate  # Nếu chưa activate
python3 create_restaurant_staff.py
```

**Hoặc chạy với venv Python:**
```bash
cd backend
venv/bin/python3 create_restaurant_staff.py
```

**Lưu ý:** 
- Script cần chạy trong virtual environment để có đầy đủ dependencies
- Nếu chưa có venv, chạy: `python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`

Hoặc tạo thủ công trong Python:

```python
from app.infrastructure.databases import get_session
from app.models.account_model import AccountModel, AccountRole
from app.utils.crypto import hash_password

session = get_session()
manager = AccountModel(
    tenant_id=1,  # ID của nhà hàng
    name="Manager Test",
    email="manager@restaurant.com",
    password=hash_password("123456"),
    role=AccountRole.MANAGER
)
session.add(manager)
session.commit()
```

## Bước 3: Chạy Backend

```bash
cd backend
./restart_server.sh
```

Backend sẽ chạy tại: `http://localhost:4000`

## Bước 4: Chạy Web Dashboard

```bash
cd web-dashboard
npm run dev
```

Dashboard sẽ mở tại: `http://localhost:3000`

## Bước 5: Đăng nhập

- Email: `manager@restaurant.com`
- Password: `123456`

## Troubleshooting

### Lỗi "Cannot find module"

```bash
cd web-dashboard
rm -rf node_modules package-lock.json
npm install
```

### Lỗi CORS

Đảm bảo backend đã enable CORS. Kiểm tra `backend/app/create_app.py`:

```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Không thấy đặt bàn

1. Đảm bảo đã có đặt bàn trong database (từ mobile app)
2. Kiểm tra `tenant_id` của tài khoản đăng nhập khớp với `tenant_id` của đặt bàn
3. Kiểm tra role của tài khoản (phải là Manager hoặc Owner để duyệt)
