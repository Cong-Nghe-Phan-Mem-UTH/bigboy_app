"""
Guest routes - QR Menu
"""
from flask import Blueprint, request, jsonify
from app.infrastructure.databases import get_session
from app.models.guest_model import GuestModel
from app.models.table_model import TableModel
from app.models.order_model import OrderModel, OrderStatus
from app.models.dish_model import DishModel, DishSnapshotModel
from app.utils.jwt import create_access_token, create_refresh_token
from app.config import Config
from datetime import datetime, timedelta

guest_bp = Blueprint("guest", __name__)


@guest_bp.route("/auth/login", methods=["POST"])
def guest_login():
    """Guest login via QR code token"""
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        # Find table by token
        table = session.query(TableModel).filter(
            TableModel.token == data.get('table_token')
        ).first()
        
        if not table:
            return jsonify({"message": "Invalid QR code"}), 404
        
        # Create or get guest
        guest = session.query(GuestModel).filter(
            GuestModel.table_number == table.number,
            GuestModel.tenant_id == table.tenant_id
        ).first()
        
        if not guest:
            guest = GuestModel(
                name=data.get('name', 'Guest'),
                tenant_id=table.tenant_id,
                table_number=table.number
            )
            session.add(guest)
            session.flush()
        
        # Create tokens
        token_data = {
            "sub": str(guest.id),  # JWT requires 'sub' to be a string
            "role": "Guest",
            "tenant_id": guest.tenant_id
        }
        access_token = create_access_token(token_data, is_guest=True)
        refresh_token = create_refresh_token(token_data, is_guest=True)
        
        # Save refresh token
        guest.refresh_token = refresh_token
        guest.refresh_token_expires_at = datetime.utcnow() + timedelta(
            seconds=Config.GUEST_REFRESH_TOKEN_EXPIRES_IN
        )
        
        session.commit()
        session.refresh(guest)
        
        return jsonify({
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "guest_id": guest.id,
                "table_number": guest.table_number
            },
            "message": "Đăng nhập thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@guest_bp.route("/orders", methods=["POST"])
def create_guest_orders():
    """Create orders from guest"""
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    # Get guest_id from token (should be in Authorization header)
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Authorization required"}), 401
    
    try:
        token = auth_header.split(' ')[1]
        from app.utils.jwt import verify_access_token
        payload = verify_access_token(token)
        
        if not payload or payload.get('role') != 'Guest':
            return jsonify({"message": "Invalid guest token"}), 401
        
        guest_id = payload.get('sub')
        tenant_id = payload.get('tenant_id')
    except:
        return jsonify({"message": "Invalid token"}), 401
    
    session = get_session()
    try:
        orders = []
        table_number = data.get('table_number')
        
        for order_data in data.get('orders', []):
            # Get dish
            dish = session.query(DishModel).filter(
                DishModel.id == order_data.get('dish_id'),
                DishModel.tenant_id == tenant_id
            ).first()
            
            if not dish:
                return jsonify({"message": f"Dish {order_data.get('dish_id')} not found"}), 404
            
            # Create dish snapshot
            dish_snapshot = DishSnapshotModel(
                dish_id=dish.id,
                name=dish.name,
                price=dish.price,
                description=dish.description,
                image=dish.image,
                category=dish.category,
                status=dish.status.value
            )
            session.add(dish_snapshot)
            session.flush()
            
            # Create order
            order = OrderModel(
                tenant_id=tenant_id,
                guest_id=guest_id,
                table_number=table_number,
                dish_snapshot_id=dish_snapshot.id,
                quantity=order_data.get('quantity', 1),
                notes=order_data.get('notes'),
                status=OrderStatus.PENDING
            )
            session.add(order)
            orders.append(order)
        
        session.commit()
        
        return jsonify({
            "data": [{
                "id": o.id,
                "dish_snapshot_id": o.dish_snapshot_id,
                "quantity": o.quantity,
                "notes": o.notes,
                "status": o.status.value
            } for o in orders],
            "message": f"Đặt món thành công {len(orders)} món!"
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@guest_bp.route("/orders", methods=["GET"])
def get_guest_orders():
    """Get guest orders"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"message": "Authorization required"}), 401
    
    try:
        token = auth_header.split(' ')[1]
        from app.utils.jwt import verify_access_token
        payload = verify_access_token(token)
        
        if not payload or payload.get('role') != 'Guest':
            return jsonify({"message": "Invalid guest token"}), 401
        
        guest_id = payload.get('sub')
    except:
        return jsonify({"message": "Invalid token"}), 401
    
    session = get_session()
    try:
        orders = session.query(OrderModel).filter(
            OrderModel.guest_id == guest_id
        ).order_by(OrderModel.created_at.desc()).all()
        
        return jsonify({
            "data": {
                "items": [{
                    "id": o.id,
                    "table_number": o.table_number,
                    "dish_snapshot_id": o.dish_snapshot_id,
                    "quantity": o.quantity,
                    "notes": o.notes,
                    "status": o.status.value,
                    "created_at": o.created_at.isoformat() if o.created_at else None
                } for o in orders],
                "total": len(orders)
            },
            "message": "Lấy lịch sử đặt món thành công!"
        }), 200
    finally:
        session.close()

