"""
Initialize default data
"""
from app.infrastructure.databases import get_session
from app.models.account_model import AccountModel, AccountRole
from app.models.tenant_model import TenantModel, TenantStatus, SubscriptionType
from app.models.dish_model import DishModel, DishStatus
from app.utils.crypto import hash_password
from app.config import Config

# Ảnh món mẫu - dùng ảnh Unsplash đúng theo từng món


def init_admin_account():
    """Initialize default admin account if not exists"""
    session = get_session()
    try:
        # Check if admin exists
        admin = session.query(AccountModel).filter(
            AccountModel.email == Config.INITIAL_EMAIL_OWNER
        ).first()
        
        if not admin:
            # Bcrypt has a 72-byte limit, truncate if necessary
            password = Config.INITIAL_PASSWORD_OWNER
            if isinstance(password, str):
                password_bytes = password.encode('utf-8')
                if len(password_bytes) > 72:
                    password = password_bytes[:72].decode('utf-8', errors='ignore')
            
            hashed_password = hash_password(password)
            admin = AccountModel(
                name="Admin",
                email=Config.INITIAL_EMAIL_OWNER,
                password=hashed_password,
                role=AccountRole.ADMIN,
                tenant_id=None  # Admin has no tenant
            )
            session.add(admin)
            session.commit()
            print(f"✅ Created default admin account: {Config.INITIAL_EMAIL_OWNER}")
        else:
            print(f"ℹ️  Admin account already exists: {Config.INITIAL_EMAIL_OWNER}")
    except Exception as e:
        print(f"❌ Error initializing admin account: {e}")
        session.rollback()
    finally:
        session.close()


def init_demo_restaurants():
    """
    Initialize some demo restaurants so the mobile app
    has data to display and can create reservations.
    Ensures at least 4 demo restaurants exist.
    """
    session = get_session()
    try:
        demo_restaurants = [
            {
                "name": "BigBoy Central",
                "slug": "bigboy-central",
                "email": "central@bigboy.local",
                "phone": "0901 111 111",
                "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
                "description": "Nhà hàng BigBoy trung tâm, chuyên món Âu - Á.",
            },
            {
                "name": "BigBoy Riverside",
                "slug": "bigboy-riverside",
                "email": "riverside@bigboy.local",
                "phone": "0902 222 222",
                "address": "45 Bến Bạch Đằng, Quận 1, TP.HCM",
                "description": "View sông lãng mạn, phù hợp hẹn hò và gia đình.",
            },
            {
                "name": "BigBoy Hà Nội",
                "slug": "bigboy-ha-noi",
                "email": "hanoi@bigboy.local",
                "phone": "0903 333 333",
                "address": "120 Yên Lãng, Hà Nội",
                "description": "Không gian ấm cúng, phục vụ món Việt hiện đại.",
            },
            {
                "name": "BigBoy Đà Nẵng",
                "slug": "bigboy-da-nang",
                "email": "danang@bigboy.local",
                "phone": "0904 444 444",
                "address": "10 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
                "description": "Nhà hàng ven biển, hải sản tươi sống mỗi ngày.",
            },
        ]

        created_count = 0
        for r in demo_restaurants:
            # Check if restaurant with this email already exists
            existing = session.query(TenantModel).filter(
                TenantModel.email == r["email"]
            ).first()
            
            if not existing:
                restaurant = TenantModel(
                    name=r["name"],
                    slug=r["slug"],
                    email=r["email"],
                    phone=r["phone"],
                    address=r["address"],
                    description=r["description"],
                    status=TenantStatus.ACTIVE,
                    subscription=SubscriptionType.FREE,
                )
                session.add(restaurant)
                created_count += 1

        # Cập nhật địa chỉ BigBoy Hà Nội nếu đã tồn tại (đổi sang 120 Yên Lãng)
        hanoi = session.query(TenantModel).filter(
            TenantModel.email == "hanoi@bigboy.local"
        ).first()
        hanoi_updated = False
        if hanoi and hanoi.address != "120 Yên Lãng, Hà Nội":
            hanoi.address = "120 Yên Lãng, Hà Nội"
            hanoi_updated = True

        if created_count > 0 or hanoi_updated:
            session.commit()
            if created_count > 0:
                print(f"✅ Seeded {created_count} demo restaurants for mobile app.")
            if hanoi_updated:
                print(f"✅ Updated BigBoy Hà Nội address to 120 Yên Lãng, Hà Nội.")
        else:
            print(f"ℹ️  All demo restaurants already exist.")
    except Exception as e:
        print(f"❌ Error initializing demo restaurants: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()


def init_demo_dishes():
    """
    Thêm món mẫu cho 4 nhà hàng demo để test xem menu.
    Mỗi nhà hàng có vài món: món chính, món phụ, đồ uống.
    """
    session = get_session()
    try:
        # Lấy 4 nhà hàng demo (theo email)
        tenant_emails = [
            "central@bigboy.local",
            "riverside@bigboy.local",
            "hanoi@bigboy.local",
            "danang@bigboy.local",
        ]
        tenants = (
            session.query(TenantModel)
            .filter(TenantModel.email.in_(tenant_emails))
            .all()
        )
        if not tenants:
            print("ℹ️  No demo restaurants found. Run init_demo_restaurants first.")
            return

        # Món mẫu: tên, giá, mô tả, category, image (ảnh đúng theo tên món - Unsplash)
        DISH_IMAGE_BY_NAME = {
            "Bò bít tết": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
            "Bún chả Hà Nội": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
            "Phở bò đặc biệt": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
            "Gỏi cuốn tôm thịt": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
            "Cơm chiên dương châu": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
            "Salad gà nướng": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
            "Coca-Cola": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
            "Bia Tiger": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400",
            "Nước cam ép": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
            "Trà đá": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
            "Bánh mì pate": "https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400",
            "Kem dâu": "https://images.unsplash.com/photo-1560008581-98ca33652814?w=400",
        }
        demo_dishes_template = [
            {"name": "Bò bít tết", "price": 189000, "description": "Bò Úc cao cấp, sốt tiêu đen.", "category": "Món chính", "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"},
            {"name": "Bún chả Hà Nội", "price": 45000, "description": "Chả nướng, bún tươi, nước chấm.", "category": "Món Việt", "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400"},
            {"name": "Phở bò đặc biệt", "price": 55000, "description": "Nước dùng xương hầm, bò tái, bánh phở tươi.", "category": "Món Việt", "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400"},
            {"name": "Gỏi cuốn tôm thịt", "price": 35000, "description": "Tôm, thịt, bún, rau sống, nước chấm.", "category": "Khai vị", "image": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400"},
            {"name": "Cơm chiên dương châu", "price": 42000, "description": "Cơm chiên với tôm, trứng, thịt nguội.", "category": "Món chính", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
            {"name": "Salad gà nướng", "price": 65000, "description": "Gà nướng mật ong, rau tươi, sốt chanh.", "category": "Khai vị", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400"},
            {"name": "Coca-Cola", "price": 15000, "description": "Nước ngọt có ga 330ml.", "category": "Đồ uống", "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400"},
            {"name": "Bia Tiger", "price": 18000, "description": "Bia Tiger 330ml.", "category": "Đồ uống", "image": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400"},
            {"name": "Nước cam ép", "price": 35000, "description": "Cam tươi ép 300ml.", "category": "Đồ uống", "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400"},
            {"name": "Trà đá", "price": 10000, "description": "Trà đá vắt chanh.", "category": "Đồ uống", "image": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400"},
            {"name": "Bánh mì pate", "price": 25000, "description": "Bánh mì giòn, pate, thịt nguội.", "category": "Món nhanh", "image": "https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400"},
            {"name": "Kem dâu", "price": 35000, "description": "Kem dâu tươi 2 viên.", "category": "Tráng miệng", "image": "https://images.unsplash.com/photo-1560008581-98ca33652814?w=400"},
        ]

        created_count = 0
        for tenant in tenants:
            existing = session.query(DishModel).filter(DishModel.tenant_id == tenant.id).first()
            if existing:
                continue
            for d in demo_dishes_template:
                dish = DishModel(
                    tenant_id=tenant.id,
                    name=d["name"],
                    price=d["price"],
                    description=d["description"],
                    image=d.get("image", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"),
                    category=d["category"],
                    status=DishStatus.AVAILABLE,
                )
                session.add(dish)
                created_count += 1

        # Cập nhật ảnh cho món đã tồn tại (đúng theo tên món)
        all_dishes = session.query(DishModel).filter(DishModel.tenant_id.in_([t.id for t in tenants])).all()
        updated_image_count = 0
        for dish in all_dishes:
            if dish.name in DISH_IMAGE_BY_NAME and dish.image != DISH_IMAGE_BY_NAME[dish.name]:
                dish.image = DISH_IMAGE_BY_NAME[dish.name]
                updated_image_count += 1

        if created_count > 0 or updated_image_count > 0:
            session.commit()
            if created_count > 0:
                print(f"✅ Seeded {created_count} demo dishes for {len(tenants)} restaurants.")
            if updated_image_count > 0:
                print(f"✅ Updated images for {updated_image_count} dishes (ảnh đúng theo tên món).")
        else:
            print("ℹ️  Demo dishes already exist for all demo restaurants.")
    except Exception as e:
        print(f"❌ Error initializing demo dishes: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()


def init_riverside_dishes():
    """
    Replace BigBoy Riverside menu with new dishes (names match provided images)
    for testing AI recommendation by dish.
    """
    session = get_session()
    try:
        riverside = session.query(TenantModel).filter(
            TenantModel.email == "riverside@bigboy.local"
        ).first()
        if not riverside:
            print("ℹ️  BigBoy Riverside not found. Run init_demo_restaurants first.")
            return

        # Delete existing dishes for Riverside
        deleted = session.query(DishModel).filter(DishModel.tenant_id == riverside.id).delete()
        if deleted:
            session.commit()

        # New menu for Riverside (names match images for AI recommendation)
        RIVERSIDE_DISHES = [
            {
                "name": "Pizza Hải Sản",
                "price": 129000,
                "description": "Pizza tôm, mực, ớt chuông, phô mai kéo sợi.",
                "category": "Món chính",
                "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
            },
            {
                "name": "Cá Hồi Sốt Chanh Dây",
                "price": 189000,
                "description": "Cá hồi áp chảo, sốt chanh dây, măng tây, khoai tây nghiền.",
                "category": "Món chính",
                "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
            },
            {
                "name": "Rượu Vang Đỏ",
                "price": 120000,
                "description": "Rượu vang đỏ San Marzano Negro Amaro, ly 150ml.",
                "category": "Đồ uống",
                "image": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400",
            },
            {
                "name": "Khoai Tây Đút Lò Hasselback",
                "price": 65000,
                "description": "Khoai tây Hasselback phô mai, thịt xông khói, kem chua.",
                "category": "Món phụ",
                "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
            },
            {
                "name": "Mì Ý Sốt Cà",
                "price": 79000,
                "description": "Spaghetti sốt cà chua, phô mai Parmesan, rau thơm.",
                "category": "Món chính",
                "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
            },
            {
                "name": "Khoai Tây Nghiền",
                "price": 35000,
                "description": "Khoai tây nghiền bơ, rau thơm, tiêu đen.",
                "category": "Món phụ",
                "image": "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400",
            },
            {
                "name": "Bò Hầm Rau Củ",
                "price": 139000,
                "description": "Bò hầm mềm, khoai tây, cà rốt, nấm, nước sốt đậm đà.",
                "category": "Món chính",
                "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
            },
            {
                "name": "Salad Caesar",
                "price": 69000,
                "description": "Rau xanh, bánh mì nướng giòn, phô mai Parmesan, sốt Caesar.",
                "category": "Khai vị",
                "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
            },
            {
                "name": "Hamburger",
                "price": 89000,
                "description": "Hamburger hai tầng thịt bò, phô mai, rau, cà chua, sốt đặc biệt.",
                "category": "Món nhanh",
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
            },
        ]

        for d in RIVERSIDE_DISHES:
            dish = DishModel(
                tenant_id=riverside.id,
                name=d["name"],
                price=d["price"],
                description=d["description"],
                image=d["image"],
                category=d["category"],
                status=DishStatus.AVAILABLE,
            )
            session.add(dish)

        session.commit()
        print(f"✅ BigBoy Riverside menu updated: {len(RIVERSIDE_DISHES)} món (Pizza Hải Sản, Cá Hồi Chanh Dây, Rượu Vang Đỏ, ...).")
    except Exception as e:
        print(f"❌ Error updating Riverside dishes: {e}")
        import traceback
        traceback.print_exc()
        session.rollback()
    finally:
        session.close()

