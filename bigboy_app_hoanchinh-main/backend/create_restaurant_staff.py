#!/usr/bin/env python3
"""
Script to create restaurant staff account for testing
Usage: 
  # With venv activated:
  python3 create_restaurant_staff.py
  
  # Or directly:
  venv/bin/python3 create_restaurant_staff.py
"""
import sys
import os

# Add parent directory to path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

# Try to use venv if available
venv_python = os.path.join(script_dir, 'venv', 'bin', 'python3')
if os.path.exists(venv_python):
    # If running without venv, suggest using venv
    if 'venv' not in sys.executable and 'VIRTUAL_ENV' not in os.environ:
        print("⚠️  Warning: Not running in virtual environment!")
        print(f"💡 Suggested: {venv_python} create_restaurant_staff.py")
        print("   Or activate venv first: source venv/bin/activate")
        print()

from app.infrastructure.databases.base import Base
from app.models.account_model import AccountModel, AccountRole
from app.models.tenant_model import TenantModel
from app.utils.crypto import hash_password
from app.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

def init_database():
    """Initialize database connection"""
    database_uri = Config.DATABASE_URI
    
    # Add connection timeout for PostgreSQL
    if 'postgresql' in database_uri.lower() and 'connect_timeout' not in database_uri.lower():
        separator = '&' if '?' in database_uri else '?'
        database_uri = f"{database_uri}{separator}connect_timeout=10"
    
    engine = create_engine(
        database_uri,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20
    )
    
    # Import all models to ensure they are registered
    from app.models import (
        tenant_model,
        branch_model,
        account_model,
        dish_model,
        table_model,
        order_model,
        guest_model,
        discount_model,
        review_model,
        reservation_model,
        refresh_token_model,
        socket_model,
        customer_model,
        customer_history_model
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = scoped_session(
        sessionmaker(autocommit=False, autoflush=False, bind=engine)
    )
    
    return SessionLocal

def create_restaurant_staff():
    """Create a restaurant staff account"""
    # Initialize database
    SessionLocal = init_database()
    session = SessionLocal()
    
    try:
        # Get first restaurant (or create one if none exists)
        restaurant = session.query(TenantModel).first()
        
        if not restaurant:
            print("❌ Không tìm thấy nhà hàng nào trong database!")
            print("💡 Hãy chạy server để tự động seed demo restaurants, hoặc tạo nhà hàng thủ công.")
            return
        
        print(f"✅ Tìm thấy nhà hàng: {restaurant.name} (ID: {restaurant.id})")
        
        # Check if account already exists
        email = "manager@restaurant.com"
        existing = session.query(AccountModel).filter(
            AccountModel.email == email
        ).first()
        
        if existing:
            print(f"⚠️  Tài khoản {email} đã tồn tại!")
            print(f"   ID: {existing.id}, Role: {existing.role.value}, Tenant ID: {existing.tenant_id}")
            return
        
        # Create manager account
        manager = AccountModel(
            tenant_id=restaurant.id,
            name="Nguyễn Văn Manager",
            email=email,
            password=hash_password("123456"),
            role=AccountRole.MANAGER
        )
        
        session.add(manager)
        session.commit()
        
        print("✅ Tạo tài khoản restaurant staff thành công!")
        print(f"   Email: {email}")
        print(f"   Password: 123456")
        print(f"   Role: {manager.role.value}")
        print(f"   Tenant ID: {manager.tenant_id}")
        print(f"\n💡 Bạn có thể đăng nhập vào web dashboard với thông tin trên.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    create_restaurant_staff()
