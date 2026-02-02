"""
Admin routes
"""
import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from sqlalchemy import func
from app.infrastructure.databases import get_session
from app.models.tenant_model import TenantModel, TenantStatus, SubscriptionType
from app.models.account_model import AccountModel, AccountRole
from app.models.order_model import OrderModel, OrderStatus
from app.models.dish_model import DishSnapshotModel
from app.api.decorators import require_admin
from app.config import Config

admin_bp = Blueprint("admin", __name__)

# Path for AI recommendation config (file-based, no DB migration)
_AI_CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "data")
_AI_CONFIG_FILE = os.path.join(_AI_CONFIG_DIR, "ai_recommendation_config.json")
_DEFAULT_AI_CONFIG = {
    "enabled": True,
    "min_rating": 0,
    "max_restaurants": 10,
    "sort_by": "rating",  # "rating" | "reviews" | "recent"
}

@admin_bp.route("/restaurants", methods=["GET"])
@require_admin
def admin_get_restaurants():
    """Get all restaurants (Admin only)"""
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
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in restaurants],
            "message": "Lấy danh sách nhà hàng thành công!"
        }), 200
    finally:
        session.close()


@admin_bp.route("/restaurants/<int:restaurant_id>/status", methods=["PUT"])
@require_admin
def update_restaurant_status(restaurant_id):
    """Update restaurant status (Admin only)"""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        restaurant = session.query(TenantModel).filter(
            TenantModel.id == restaurant_id
        ).first()
        
        if not restaurant:
            return jsonify({"message": "Restaurant not found"}), 404
        
        try:
            restaurant.status = TenantStatus(data['status'])
            session.commit()
            session.refresh(restaurant)
            
            return jsonify({
                "data": {
                    "id": restaurant.id,
                    "status": restaurant.status.value
                },
                "message": "Cập nhật trạng thái nhà hàng thành công!"
            }), 200
        except ValueError:
            return jsonify({"message": "Invalid status"}), 400
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@admin_bp.route("/users", methods=["GET"])
@require_admin
def admin_get_users():
    """Get all users (Admin only)"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    role = request.args.get('role')
    
    session = get_session()
    try:
        query = session.query(AccountModel)
        
        if role:
            query = query.filter(AccountModel.role == AccountRole(role))
        
        users = query.offset((page - 1) * limit).limit(limit).all()
        
        return jsonify({
            "data": [{
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "avatar": u.avatar,
                "role": u.role.value,
                "tenant_id": u.tenant_id,
                "created_at": u.created_at.isoformat() if u.created_at else None
            } for u in users],
            "message": "Lấy danh sách người dùng thành công!"
        }), 200
    finally:
        session.close()


@admin_bp.route("/revenue", methods=["GET"])
@require_admin
def admin_get_revenue():
    """Get revenue summary by restaurant (Admin only). PAID orders only."""
    date_from = request.args.get('date_from')  # YYYY-MM-DD
    date_to = request.args.get('date_to')
    
    session = get_session()
    try:
        query = (
            session.query(
                TenantModel.id,
                TenantModel.name,
                TenantModel.slug,
                func.coalesce(
                    func.sum(DishSnapshotModel.price * OrderModel.quantity),
                    0
                ).label("total_revenue"),
                func.count(OrderModel.id).label("order_count"),
            )
            .join(OrderModel, (OrderModel.tenant_id == TenantModel.id) & (OrderModel.status == OrderStatus.PAID))
            .join(DishSnapshotModel, OrderModel.dish_snapshot_id == DishSnapshotModel.id)
        )
        
        if date_from:
            try:
                dt_from = datetime.strptime(date_from, "%Y-%m-%d")
                query = query.filter(func.date(OrderModel.created_at) >= dt_from.date())
            except ValueError:
                pass
        if date_to:
            try:
                dt_to = datetime.strptime(date_to, "%Y-%m-%d")
                query = query.filter(func.date(OrderModel.created_at) <= dt_to.date())
            except ValueError:
                pass
        
        rows = query.group_by(TenantModel.id, TenantModel.name, TenantModel.slug).all()
        
        total_all = sum(r.total_revenue or 0 for r in rows)
        
        return jsonify({
            "data": {
                "by_restaurant": [
                    {
                        "tenant_id": r.id,
                        "name": r.name,
                        "slug": r.slug,
                        "total_revenue": int(r.total_revenue or 0),
                        "order_count": r.order_count or 0,
                    }
                    for r in rows
                ],
                "total_revenue": int(total_all),
                "date_from": date_from,
                "date_to": date_to,
            },
            "message": "Lấy doanh thu thành công!",
        }), 200
    finally:
        session.close()


def _read_ai_config():
    if os.path.isfile(_AI_CONFIG_FILE):
        try:
            with open(_AI_CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {**_DEFAULT_AI_CONFIG, **data}
        except (json.JSONDecodeError, IOError):
            pass
    return _DEFAULT_AI_CONFIG.copy()


def _write_ai_config(data):
    os.makedirs(_AI_CONFIG_DIR, exist_ok=True)
    with open(_AI_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@admin_bp.route("/ai-config", methods=["GET"])
@require_admin
def admin_get_ai_config():
    """Get AI recommendation config (Admin only)"""
    config = _read_ai_config()
    return jsonify({"data": config, "message": "Lấy cấu hình AI thành công!"}), 200


@admin_bp.route("/ai-config", methods=["PUT"])
@require_admin
def admin_update_ai_config():
    """Update AI recommendation config (Admin only)"""
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    current = _read_ai_config()
    allowed = {"enabled", "min_rating", "max_restaurants", "sort_by"}
    for key in allowed:
        if key in data:
            if key == "enabled":
                current[key] = bool(data[key])
            elif key == "min_rating":
                current[key] = max(0, min(5, float(data[key]) if data[key] is not None else 0))
            elif key == "max_restaurants":
                current[key] = max(1, min(100, int(data[key]) if data[key] is not None else 10))
            elif key == "sort_by":
                current[key] = data[key] if data[key] in ("rating", "reviews", "recent") else current[key]
    
    _write_ai_config(current)
    return jsonify({"data": current, "message": "Cập nhật cấu hình AI thành công!"}), 200


@admin_bp.route("/debug/seed-restaurants", methods=["POST", "GET"])
def debug_seed_restaurants():
    """
    DEV ONLY: Force seed demo restaurants.
    This endpoint is automatically disabled in production.
    Works with both POST and GET for convenience.
    """
    if Config.PRODUCTION:
        return jsonify({"message": "Not allowed in production"}), 403

    from app.utils.init_data import init_demo_restaurants
    
    try:
        init_demo_restaurants()
        session = get_session()
        count = session.query(TenantModel).filter(
            TenantModel.status == TenantStatus.ACTIVE
        ).count()
        session.close()
        
        return jsonify({
            "message": "Đã seed restaurants thành công",
            "detail": f"Hiện có {count} nhà hàng ACTIVE trong database"
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            "message": "Seed restaurants thất bại",
            "detail": str(e),
            "traceback": traceback.format_exc() if Config.DEBUG else None
        }), 500

