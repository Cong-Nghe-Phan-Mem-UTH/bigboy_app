"""
Customer routes - Mobile App
"""
from flask import Blueprint, request, jsonify, g
import logging
from app.infrastructure.databases import get_session
from app.models.customer_model import CustomerModel, MembershipTier
from app.utils.crypto import hash_password, verify_password
from app.utils.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.api.decorators import require_auth
from app.config import Config
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
customer_bp = Blueprint("customer", __name__)

def verify_customer_token():
    """Helper to verify customer token and return customer_id"""
    auth_header = request.headers.get('Authorization')
    logger.info(f"🔐 Auth header received: {auth_header[:50] + '...' if auth_header and len(auth_header) > 50 else auth_header}")
    
    if not auth_header:
        logger.warning("❌ No Authorization header")
        return None, "Authorization required"
    
    try:
        parts = auth_header.split(' ')
        if len(parts) != 2 or parts[0] != 'Bearer':
            logger.warning(f"❌ Invalid Authorization header format: {auth_header[:50]}")
            return None, "Invalid authorization header format"
        
        token = parts[1]
        logger.info(f"🔐 Token extracted, length: {len(token)}")
        
        from app.utils.jwt import verify_access_token
        payload = verify_access_token(token)
        
        logger.info(f"🔐 Token verification result - payload keys: {list(payload.keys()) if payload else 'None'}")
        
        if not payload:
            logger.warning("❌ Token verification failed - payload is None")
            return None, "Invalid token"
        
        role = payload.get('role')
        customer_id = payload.get('customer_id')
        
        logger.info(f"🔐 Token payload - role: {role}, customer_id: {customer_id}, sub: {payload.get('sub')}")
        
        if role != 'Customer':
            logger.warning(f"❌ Invalid role in token: {role}, expected: Customer")
            return None, "Invalid customer token"
        
        if not customer_id:
            logger.warning(f"❌ Missing customer_id in token payload")
            return None, "Invalid customer token"
        
        logger.info(f"✅ Token verified - customer_id: {customer_id}")
        return customer_id, None
    except Exception as e:
        logger.error(f"❌ Token verification exception: {str(e)}", exc_info=True)
        return None, "Invalid token"


@customer_bp.route("/register", methods=["POST"])
def customer_register():
    """Register a new customer"""
    logger.info("🔵 Customer registration request received")
    data = request.get_json()
    logger.info(f"📝 Registration data: {data}")
    
    if not data:
        logger.warning("❌ Registration failed: Invalid request (no data)")
        return jsonify({"message": "Đăng ký thất bại", "detail": "Yêu cầu không hợp lệ"}), 400
    
    session = get_session()
    try:
        # Validate required fields
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        logger.info(f"📋 Validating fields - Name: {bool(name)}, Email: {bool(email)}, Password: {bool(password)}")
        
        if not name or not name.strip():
            logger.warning(f"❌ Registration failed: Missing name")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Vui lòng nhập tên"}), 400
        
        if not email or not email.strip():
            logger.warning(f"❌ Registration failed: Missing email")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Vui lòng nhập email"}), 400
        
        if not password or not password.strip():
            logger.warning(f"❌ Registration failed: Missing password")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Vui lòng nhập mật khẩu"}), 400
        
        # Validate email format
        if '@' not in email or '.' not in email:
            logger.warning(f"❌ Registration failed: Invalid email format - {email}")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Email không hợp lệ"}), 400
        
        # Validate password length
        if len(password) < 6:
            logger.warning(f"❌ Registration failed: Password too short")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Mật khẩu phải có ít nhất 6 ký tự"}), 400
        
        # Check if email already exists
        email_normalized = email.strip().lower()
        logger.info(f"🔍 Checking if email exists: {email_normalized}")
        existing_customer = session.query(CustomerModel).filter(
            CustomerModel.email == email_normalized
        ).first()
        if existing_customer:
            logger.warning(f"❌ Registration failed: Email already exists - {email_normalized}")
            return jsonify({"message": "Đăng ký thất bại", "detail": "Email đã được đăng ký"}), 400
        
        # Create customer
        logger.info(f"✅ Creating new customer: {name} ({email_normalized})")
        logger.info(f"🔐 Password length: {len(password)} characters, {len(password.encode('utf-8'))} bytes")
        try:
            hashed_password = hash_password(password)
            logger.info(f"✅ Password hashed successfully")
        except Exception as hash_error:
            logger.error(f"❌ Password hashing error: {str(hash_error)}")
            return jsonify({"message": "Đăng ký thất bại", "detail": f"Lỗi xử lý mật khẩu: {str(hash_error)}"}), 500
        
        customer = CustomerModel(
            name=name.strip(),
            email=email_normalized,
            password=hashed_password,
            phone=data.get('phone', '').strip() if data.get('phone') else None,
            membership_tier=MembershipTier.IRON
        )
        session.add(customer)
        session.commit()
        session.refresh(customer)
        
        logger.info(f"✅ Registration successful! Customer ID: {customer.id}")
        return jsonify({
            "data": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "membership_tier": customer.membership_tier.value
            },
            "message": "Đăng ký thành công!"
        }), 201
    except ValueError as e:
        session.rollback()
        logger.error(f"❌ Registration error (ValueError): {str(e)}", exc_info=True)
        return jsonify({"message": "Đăng ký thất bại", "detail": str(e)}), 400
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Registration error: {str(e)}", exc_info=True)
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"message": "Đăng ký thất bại", "detail": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."}), 500
    finally:
        session.close()


@customer_bp.route("/login", methods=["POST"])
def customer_login():
    """Customer login"""
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    # Normalize email similar to registration (trim + lowercase)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    
    logger.info(f"🔵 Login attempt for email: {email}")
    logger.info(f"📝 Password provided: {'Yes' if password else 'No'}, length: {len(password) if password else 0}")
    
    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.email == email
        ).first()
        
        if not customer:
            logger.warning(f"❌ Login failed: Customer not found for email: {email}")
            return jsonify({"message": "Incorrect email or password"}), 401
        
        logger.info(f"✅ Customer found: ID={customer.id}, Email={customer.email}")
        logger.info(f"🔐 Verifying password...")
        
        password_valid = verify_password(password, customer.password)
        logger.info(f"🔐 Password verification result: {password_valid}")
        
        if not password_valid:
            logger.warning(f"❌ Login failed: Password incorrect for email: {email}")
            return jsonify({"message": "Incorrect email or password"}), 401
        
        # Create tokens
        token_data = {
            "sub": str(customer.id),  # JWT requires 'sub' to be a string
            "role": "Customer",
            "customer_id": customer.id
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"✅ Login successful for customer ID: {customer.id}")
        
        return jsonify({
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "customer": {
                    "id": customer.id,
                    "name": customer.name,
                    "email": customer.email,
                    "membership_tier": customer.membership_tier.value,
                    "total_spending": customer.total_spending,
                    "points": customer.points
                }
            },
            "message": "Đăng nhập thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@customer_bp.route("/debug/delete-by-email", methods=["POST"])
def debug_delete_customer_by_email():
    """
    DEV ONLY: Delete a customer by email.
    Useful when testing registration/login flows.
    This endpoint is automatically disabled in production.
    """
    if Config.PRODUCTION:
        return jsonify({"message": "Not allowed in production"}), 403

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"message": "Invalid request", "detail": "Email is required"}), 400

    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.email == email
        ).first()

        if not customer:
            return jsonify({"message": "Customer not found"}), 404

        session.delete(customer)
        session.commit()

        return jsonify({
            "message": "Xóa khách hàng thành công",
            "detail": f"Customer with email {email} has been deleted"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": "Xóa khách hàng thất bại", "detail": str(e)}), 500
    finally:
        session.close()


@customer_bp.route("/debug/check-customer", methods=["POST"])
def debug_check_customer():
    """
    DEV ONLY: Check if a customer exists and verify password.
    Useful for debugging login issues.
    """
    if Config.PRODUCTION:
        return jsonify({"message": "Not allowed in production"}), 403

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email:
        return jsonify({"message": "Email is required"}), 400

    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.email == email
        ).first()

        if not customer:
            return jsonify({
                "exists": False,
                "message": f"Customer with email {email} not found"
            }), 404

        result = {
            "exists": True,
            "customer_id": customer.id,
            "email": customer.email,
            "name": customer.name,
            "has_password": bool(customer.password),
            "password_length": len(customer.password) if customer.password else 0,
        }

        if password:
            result["password_match"] = verify_password(password, customer.password)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error checking customer", "detail": str(e)}), 500
    finally:
        session.close()


@customer_bp.route("/reset-password", methods=["POST"])
def reset_customer_password():
    """
    Simple password reset for development:
    Accepts email and new_password, updates the customer's password.
    No email verification – DO NOT expose publicly in production.
    """
    if Config.PRODUCTION:
        return jsonify({"message": "Not allowed in production"}), 403

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({
            "message": "Đổi mật khẩu thất bại",
            "detail": "Vui lòng cung cấp email và mật khẩu mới"
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "message": "Đổi mật khẩu thất bại",
            "detail": "Mật khẩu mới phải có ít nhất 6 ký tự"
        }), 400

    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.email == email
        ).first()

        if not customer:
            return jsonify({"message": "Customer not found"}), 404

        customer.password = hash_password(new_password)
        session.commit()

        return jsonify({
            "message": "Đổi mật khẩu thành công",
            "detail": f"Mật khẩu cho {email} đã được cập nhật"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": "Đổi mật khẩu thất bại", "detail": str(e)}), 500
    finally:
        session.close()


@customer_bp.route("/me", methods=["GET"])
def get_customer_info():
    """Get current customer information"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.id == customer_id
        ).first()
        
        if not customer:
            return jsonify({"message": "Customer not found"}), 404
        
        return jsonify({
            "data": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "avatar": customer.avatar,
                "membership_tier": customer.membership_tier.value,
                "total_spending": customer.total_spending,
                "points": customer.points
            },
            "message": "Lấy thông tin khách hàng thành công!"
        }), 200
    finally:
        session.close()

