"""
Membership routes - Hạng thành viên và điểm tích lũy
"""
from flask import Blueprint, request, jsonify
from app.infrastructure.databases import get_session
from app.models.customer_model import CustomerModel, MembershipTier
import logging

logger = logging.getLogger(__name__)
membership_bp = Blueprint("membership", __name__)


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


@membership_bp.route("/tiers", methods=["GET"])
def get_membership_tiers():
    """Get membership tiers information"""
    tiers_info = {
        "Iron": {
            "name": "Sắt",
            "min_spending": 0,
            "benefits": ["Tích điểm 1%", "Ưu đãi cơ bản"]
        },
        "Silver": {
            "name": "Bạc",
            "min_spending": 1000000,
            "benefits": ["Tích điểm 2%", "Giảm giá 5%", "Ưu tiên đặt bàn"]
        },
        "Gold": {
            "name": "Vàng",
            "min_spending": 5000000,
            "benefits": ["Tích điểm 3%", "Giảm giá 10%", "Quà tặng sinh nhật", "Ưu tiên cao"]
        },
        "Diamond": {
            "name": "Kim cương",
            "min_spending": 10000000,
            "benefits": ["Tích điểm 5%", "Giảm giá 15%", "Quà tặng đặc biệt", "Ưu tiên tối đa", "Dịch vụ VIP"]
        }
    }
    
    return jsonify({
        "data": tiers_info,
        "message": "Lấy thông tin hạng thành viên thành công!"
    }), 200


@membership_bp.route("/my-tier", methods=["GET"])
def get_my_membership():
    """Get current customer's membership tier"""
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
        
        # Calculate next tier requirements
        next_tier = None
        spending_to_next = 0
        
        if customer.membership_tier == MembershipTier.IRON:
            next_tier = "Silver"
            spending_to_next = max(0, 1000000 - customer.total_spending)
        elif customer.membership_tier == MembershipTier.SILVER:
            next_tier = "Gold"
            spending_to_next = max(0, 5000000 - customer.total_spending)
        elif customer.membership_tier == MembershipTier.GOLD:
            next_tier = "Diamond"
            spending_to_next = max(0, 10000000 - customer.total_spending)
        
        return jsonify({
            "data": {
                "current_tier": customer.membership_tier.value,
                "total_spending": customer.total_spending,
                "points": customer.points,
                "next_tier": next_tier,
                "spending_to_next": spending_to_next
            },
            "message": "Lấy thông tin hạng thành viên thành công!"
        }), 200
    finally:
        session.close()


@membership_bp.route("/update-tier", methods=["POST"])
def update_membership_tier():
    """Update customer's membership tier based on spending"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Authorization required"}), 401
    
    try:
        token = auth_header.split(' ')[1]
        from app.utils.jwt import verify_access_token
        payload = verify_access_token(token)
        
        if not payload or payload.get('role') != 'Customer':
            return jsonify({"message": "Invalid customer token"}), 401
        
        customer_id = payload.get('customer_id')
    except:
        return jsonify({"message": "Invalid token"}), 401
    
    session = get_session()
    try:
        customer = session.query(CustomerModel).filter(
            CustomerModel.id == customer_id
        ).first()
        
        if not customer:
            return jsonify({"message": "Customer not found"}), 404
        
        # Update tier based on spending
        old_tier = customer.membership_tier
        if customer.total_spending >= 10000000:
            customer.membership_tier = MembershipTier.DIAMOND
        elif customer.total_spending >= 5000000:
            customer.membership_tier = MembershipTier.GOLD
        elif customer.total_spending >= 1000000:
            customer.membership_tier = MembershipTier.SILVER
        else:
            customer.membership_tier = MembershipTier.IRON
        
        tier_updated = old_tier != customer.membership_tier
        
        session.commit()
        session.refresh(customer)
        
        return jsonify({
            "data": {
                "membership_tier": customer.membership_tier.value,
                "tier_updated": tier_updated,
                "total_spending": customer.total_spending
            },
            "message": "Cập nhật hạng thành viên thành công!" if tier_updated else "Hạng thành viên không thay đổi"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()

