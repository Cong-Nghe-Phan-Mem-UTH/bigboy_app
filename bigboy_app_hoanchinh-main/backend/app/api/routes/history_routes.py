"""
Customer History routes - Lịch sử món ăn và nhà hàng đã ghé
"""
from flask import Blueprint, request, jsonify
from app.infrastructure.databases import get_session
from app.models.customer_history_model import CustomerHistoryModel
from app.models.customer_model import CustomerModel
from app.models.tenant_model import TenantModel
from app.models.order_model import OrderModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
history_bp = Blueprint("history", __name__)


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



@history_bp.route("/history", methods=["GET"])
def get_customer_history():
    """Get customer history (dishes, restaurants, total spending)"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    session = get_session()
    try:
        # Get customer
        customer = session.query(CustomerModel).filter(
            CustomerModel.id == customer_id
        ).first()
        
        if not customer:
            return jsonify({"message": "Customer not found"}), 404
        
        # Get history
        history = session.query(CustomerHistoryModel).filter(
            CustomerHistoryModel.customer_id == customer_id
        ).order_by(CustomerHistoryModel.visit_date.desc()).offset(
            (page - 1) * limit
        ).limit(limit).all()
        
        # Get unique restaurants visited
        restaurants_visited = session.query(
            CustomerHistoryModel.tenant_id
        ).filter(
            CustomerHistoryModel.customer_id == customer_id
        ).distinct().count()
        
        # Get all dish IDs from history
        all_dish_ids = []
        for h in history:
            if h.dish_ids:
                all_dish_ids.extend(h.dish_ids)
        unique_dish_count = len(set(all_dish_ids))
        
        return jsonify({
            "data": {
                "customer": {
                    "id": customer.id,
                    "name": customer.name,
                    "membership_tier": customer.membership_tier.value,
                    "total_spending": customer.total_spending,
                    "points": customer.points
                },
                "summary": {
                    "total_spending": customer.total_spending,
                    "restaurants_visited": restaurants_visited,
                    "unique_dishes_tried": unique_dish_count,
                    "total_visits": len(history)
                },
                "history": [{
                    "id": h.id,
                    "restaurant_id": h.tenant_id,
                    "restaurant_name": session.query(TenantModel.name).filter(
                        TenantModel.id == h.tenant_id
                    ).scalar(),
                    "dish_ids": h.dish_ids,
                    "total_amount": h.total_amount,
                    "visit_date": h.visit_date.isoformat() if h.visit_date else None,
                    "notes": h.notes
                } for h in history],
                "page": page,
                "limit": limit
            },
            "message": "Lấy lịch sử thành công!"
        }), 200
    finally:
        session.close()


@history_bp.route("/history/restaurants", methods=["GET"])
def get_visited_restaurants():
    """Get list of restaurants customer has visited"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    session = get_session()
    try:
        # Get unique restaurants
        restaurant_ids = session.query(
            CustomerHistoryModel.tenant_id
        ).filter(
            CustomerHistoryModel.customer_id == customer_id
        ).distinct().all()
        
        restaurants = []
        for (restaurant_id,) in restaurant_ids:
            restaurant = session.query(TenantModel).filter(
                TenantModel.id == restaurant_id
            ).first()
            
            if restaurant:
                # Get visit count and total spending at this restaurant
                visits = session.query(CustomerHistoryModel).filter(
                    CustomerHistoryModel.customer_id == customer_id,
                    CustomerHistoryModel.tenant_id == restaurant_id
                ).all()
                
                total_at_restaurant = sum(v.total_amount for v in visits)
                
                restaurants.append({
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "address": restaurant.address,
                    "logo": restaurant.logo,
                    "visit_count": len(visits),
                    "total_spending": total_at_restaurant,
                    "last_visit": max(v.visit_date for v in visits).isoformat() if visits else None
                })
        
        return jsonify({
            "data": restaurants,
            "message": "Lấy danh sách nhà hàng đã ghé thành công!"
        }), 200
    finally:
        session.close()

