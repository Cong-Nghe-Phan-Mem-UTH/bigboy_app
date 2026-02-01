"""
Restaurant (Tenant) routes
"""
from flask import Blueprint, request, jsonify, g
from app.infrastructure.databases import get_session
from app.models.tenant_model import TenantModel, TenantStatus
from app.api.decorators import require_auth, require_admin, require_owner

restaurant_bp = Blueprint("restaurant", __name__)


@restaurant_bp.route("", methods=["GET"])
@require_admin
def get_restaurants():
    """Get list of restaurants (Admin only)"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status')
    
    session = get_session()
    try:
        query = session.query(TenantModel)
        
        if status:
            query = query.filter(TenantModel.status == TenantStatus(status))
        
        restaurants = query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            "data": [{
                "id": r.id,
                "name": r.name,
                "slug": r.slug,
                "email": r.email,
                "phone": r.phone,
                "address": r.address,
                "logo": r.logo,
                "description": r.description,
                "status": r.status.value,
                "subscription": r.subscription.value,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None
            } for r in restaurants],
            "message": "Lấy danh sách nhà hàng thành công!"
        }), 200
    finally:
        session.close()


@restaurant_bp.route("/me", methods=["GET"])
@require_auth
def get_my_restaurant():
    """Get current user's restaurant"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User does not belong to a restaurant"}), 404
    
    session = get_session()
    try:
        restaurant = session.query(TenantModel).filter(
            TenantModel.id == g.current_user.tenant_id
        ).first()
        
        if not restaurant:
            return jsonify({"message": "Restaurant not found"}), 404
        
        return jsonify({
            "data": {
                "id": restaurant.id,
                "name": restaurant.name,
                "slug": restaurant.slug,
                "email": restaurant.email,
                "phone": restaurant.phone,
                "address": restaurant.address,
                "logo": restaurant.logo,
                "description": restaurant.description,
                "status": restaurant.status.value,
                "subscription": restaurant.subscription.value
            },
            "message": "Lấy thông tin nhà hàng thành công!"
        }), 200
    finally:
        session.close()


@restaurant_bp.route("/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):
    """Get restaurant by ID"""
    session = get_session()
    try:
        restaurant = session.query(TenantModel).filter(
            TenantModel.id == restaurant_id
        ).first()
        
        if not restaurant:
            return jsonify({"message": "Restaurant not found"}), 404
        
        return jsonify({
            "data": {
                "id": restaurant.id,
                "name": restaurant.name,
                "slug": restaurant.slug,
                "email": restaurant.email,
                "phone": restaurant.phone,
                "address": restaurant.address,
                "logo": restaurant.logo,
                "description": restaurant.description,
                "status": restaurant.status.value,
                "subscription": restaurant.subscription.value
            },
            "message": "Lấy thông tin nhà hàng thành công!"
        }), 200
    finally:
        session.close()


@restaurant_bp.route("/me", methods=["PUT"])
@require_owner
def update_my_restaurant():
    """Update current user's restaurant"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User does not belong to a restaurant"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        restaurant = session.query(TenantModel).filter(
            TenantModel.id == g.current_user.tenant_id
        ).first()
        
        if not restaurant:
            return jsonify({"message": "Restaurant not found"}), 404
        
        # Update fields
        if 'name' in data:
            restaurant.name = data['name']
        if 'phone' in data:
            restaurant.phone = data['phone']
        if 'address' in data:
            restaurant.address = data['address']
        if 'logo' in data:
            restaurant.logo = data['logo']
        if 'description' in data:
            restaurant.description = data['description']
        if 'status' in data:
            restaurant.status = TenantStatus(data['status'])
        
        session.commit()
        session.refresh(restaurant)
        
        return jsonify({
            "data": {
                "id": restaurant.id,
                "name": restaurant.name,
                "slug": restaurant.slug,
                "email": restaurant.email,
                "phone": restaurant.phone,
                "address": restaurant.address,
                "logo": restaurant.logo,
                "description": restaurant.description,
                "status": restaurant.status.value
            },
            "message": "Cập nhật nhà hàng thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()

