"""
Reservation routes - Table booking
"""
from flask import Blueprint, request, jsonify, g
from app.infrastructure.databases import get_session
from app.models.reservation_model import ReservationModel, ReservationStatus
from app.models.tenant_model import TenantModel
from app.models.table_model import TableModel
from app.models.customer_model import CustomerModel
from app.api.decorators import require_auth, require_manager
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
reservation_bp = Blueprint("reservation", __name__)


def _safe_isoformat(value):
    """Serialize datetime/date to ISO string; return None for missing or invalid."""
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


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


@reservation_bp.route("/restaurants/<int:restaurant_id>/reservations", methods=["POST"])
def create_reservation(restaurant_id):
    """Create a table reservation"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        # Check if restaurant exists
        restaurant = session.query(TenantModel).filter(
            TenantModel.id == restaurant_id
        ).first()
        
        if not restaurant:
            return jsonify({"message": "Restaurant not found"}), 404
        
        # Parse date and time
        date_str = data.get('date')
        time_str = data.get('time')
        
        try:
            reservation_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            return jsonify({"message": "Invalid date format"}), 400
        
        # Create reservation
        reservation = ReservationModel(
            tenant_id=restaurant_id,
            customer_id=customer_id,
            table_number=data.get('table_number'),
            date=reservation_date,
            time=time_str,
            guests=data.get('guests', 1),
            notes=data.get('notes'),
            status=ReservationStatus.PENDING
        )
        session.add(reservation)
        session.commit()
        session.refresh(reservation)
        
        return jsonify({
            "data": {
                "id": reservation.id,
                "restaurant_id": reservation.tenant_id,
                "table_number": reservation.table_number,
                "date": reservation.date.isoformat() if reservation.date else None,
                "time": reservation.time,
                "guests": reservation.guests,
                "status": reservation.status.value
            },
            "message": "Đặt bàn thành công!"
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@reservation_bp.route("/reservations", methods=["GET"])
def get_customer_reservations():
    """Get customer's reservations"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    session = get_session()
    try:
        reservations = session.query(ReservationModel).filter(
            ReservationModel.customer_id == customer_id
        ).order_by(ReservationModel.date.desc()).all()
        
        return jsonify({
            "data": {
                "items": [{
                    "id": r.id,
                    "restaurant_id": r.tenant_id,
                    "restaurant_name": session.query(TenantModel.name).filter(
                        TenantModel.id == r.tenant_id
                    ).scalar(),
                    "table_number": r.table_number,
                    "date": r.date.isoformat() if r.date else None,
                    "time": r.time,
                    "guests": r.guests,
                    "status": r.status.value,
                    "notes": r.notes
                } for r in reservations],
                "total": len(reservations)
            },
            "message": "Lấy danh sách đặt bàn thành công!"
        }), 200
    finally:
        session.close()


@reservation_bp.route("/reservations/<int:reservation_id>", methods=["PUT"])
def update_reservation(reservation_id):
    """Update a reservation"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        reservation = session.query(ReservationModel).filter(
            ReservationModel.id == reservation_id,
            ReservationModel.customer_id == customer_id
        ).first()
        
        if not reservation:
            return jsonify({"message": "Reservation not found"}), 404
        
        # Update fields
        if 'date' in data:
            reservation.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        if 'time' in data:
            reservation.time = data['time']
        if 'guests' in data:
            reservation.guests = data['guests']
        if 'notes' in data:
            reservation.notes = data['notes']
        if 'status' in data:
            reservation.status = ReservationStatus(data['status'])
        
        session.commit()
        session.refresh(reservation)
        
        return jsonify({
            "data": {
                "id": reservation.id,
                "date": reservation.date.isoformat() if reservation.date else None,
                "time": reservation.time,
                "guests": reservation.guests,
                "status": reservation.status.value
            },
            "message": "Cập nhật đặt bàn thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@reservation_bp.route("/reservations/<int:reservation_id>", methods=["DELETE"])
def cancel_reservation(reservation_id):
    """Cancel a reservation"""
    customer_id, error_msg = verify_customer_token()
    if not customer_id:
        return jsonify({"message": error_msg}), 401
    
    session = get_session()
    try:
        reservation = session.query(ReservationModel).filter(
            ReservationModel.id == reservation_id,
            ReservationModel.customer_id == customer_id
        ).first()
        
        if not reservation:
            return jsonify({"message": "Reservation not found"}), 404
        
        reservation.status = ReservationStatus.CANCELLED
        session.commit()
        
        return jsonify({"message": "Hủy đặt bàn thành công!"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


# ==================== RESTAURANT STAFF ENDPOINTS ====================

@reservation_bp.route("/restaurants/my/reservations", methods=["GET"])
@require_auth
def get_restaurant_reservations():
    """Get all reservations for the authenticated restaurant (Restaurant staff only)"""
    session = get_session()
    try:
        # Get tenant_id from authenticated user
        user = g.current_user
        tenant_id = user.tenant_id
        
        if not tenant_id:
            return jsonify({"message": "Bạn không thuộc nhà hàng nào"}), 403
        
        # Get query parameters
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        # Build query
        query = session.query(ReservationModel).filter(
            ReservationModel.tenant_id == tenant_id
        )
        
        if status:
            try:
                query = query.filter(ReservationModel.status == ReservationStatus(status))
            except ValueError:
                return jsonify({"message": f"Invalid status: {status}"}), 400
        
        # Order by date (upcoming first)
        query = query.order_by(ReservationModel.date.asc(), ReservationModel.time.asc())
        
        # Pagination
        total = query.count()
        reservations = query.offset((page - 1) * limit).limit(limit).all()
        
        # Get customer names
        customer_ids = [r.customer_id for r in reservations if r.customer_id]
        customers = {}
        if customer_ids:
            customer_list = session.query(CustomerModel).filter(
                CustomerModel.id.in_(customer_ids)
            ).all()
            customers = {c.id: c.name for c in customer_list}
        
        items = []
        for r in reservations:
            items.append({
                "id": r.id,
                "customer_id": r.customer_id,
                "customer_name": customers.get(r.customer_id, "Khách vãng lai"),
                "table_number": r.table_number,
                "date": _safe_isoformat(r.date),
                "time": r.time or "",
                "guests": r.guests if r.guests is not None else 1,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
                "notes": r.notes,
                "created_at": _safe_isoformat(getattr(r, "created_at", None)),
                "updated_at": _safe_isoformat(getattr(r, "updated_at", None)),
            })
        return jsonify({
            "data": {
                "items": items,
                "total": total,
                "page": page,
                "limit": limit
            },
            "message": "Lấy danh sách đặt bàn thành công!"
        }), 200
    except Exception as e:
        logger.error(f"Error getting restaurant reservations: {str(e)}", exc_info=True)
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@reservation_bp.route("/restaurants/my/reservations/<int:reservation_id>/approve", methods=["PUT"])
@require_manager
def approve_reservation(reservation_id):
    """Approve a reservation (Manager/Owner only)"""
    session = get_session()
    try:
        user = g.current_user
        tenant_id = user.tenant_id
        
        if not tenant_id:
            return jsonify({"message": "Bạn không thuộc nhà hàng nào"}), 403
        
        reservation = session.query(ReservationModel).filter(
            ReservationModel.id == reservation_id,
            ReservationModel.tenant_id == tenant_id
        ).first()
        
        if not reservation:
            return jsonify({"message": "Đặt bàn không tồn tại"}), 404
        
        if reservation.status == ReservationStatus.CANCELLED:
            return jsonify({"message": "Không thể duyệt đặt bàn đã bị hủy"}), 400
        
        reservation.status = ReservationStatus.CONFIRMED
        session.commit()
        session.refresh(reservation)
        
        return jsonify({
            "data": {
                "id": reservation.id,
                "status": reservation.status.value,
                "date": reservation.date.isoformat() if reservation.date else None,
                "time": reservation.time
            },
            "message": "Duyệt đặt bàn thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        logger.error(f"Error approving reservation: {str(e)}", exc_info=True)
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@reservation_bp.route("/restaurants/my/reservations/<int:reservation_id>/reject", methods=["PUT"])
@require_manager
def reject_reservation(reservation_id):
    """Reject a reservation (Manager/Owner only)"""
    session = get_session()
    try:
        user = g.current_user
        tenant_id = user.tenant_id
        
        if not tenant_id:
            return jsonify({"message": "Bạn không thuộc nhà hàng nào"}), 403
        
        data = request.get_json() or {}
        rejection_reason = data.get('reason', '')
        
        reservation = session.query(ReservationModel).filter(
            ReservationModel.id == reservation_id,
            ReservationModel.tenant_id == tenant_id
        ).first()
        
        if not reservation:
            return jsonify({"message": "Đặt bàn không tồn tại"}), 404
        
        if reservation.status == ReservationStatus.CANCELLED:
            return jsonify({"message": "Đặt bàn đã bị hủy trước đó"}), 400
        
        reservation.status = ReservationStatus.CANCELLED
        if rejection_reason:
            reservation.notes = (reservation.notes or '') + f"\n[Lý do từ chối: {rejection_reason}]"
        session.commit()
        session.refresh(reservation)
        
        return jsonify({
            "data": {
                "id": reservation.id,
                "status": reservation.status.value,
                "notes": reservation.notes
            },
            "message": "Từ chối đặt bàn thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        logger.error(f"Error rejecting reservation: {str(e)}", exc_info=True)
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@reservation_bp.route("/restaurants/my/reservations/<int:reservation_id>/status", methods=["PUT"])
@require_manager
def update_reservation_status(reservation_id):
    """Update reservation status (Manager/Owner only) - General endpoint"""
    session = get_session()
    try:
        user = g.current_user
        tenant_id = user.tenant_id
        
        if not tenant_id:
            return jsonify({"message": "Bạn không thuộc nhà hàng nào"}), 403
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"message": "Vui lòng cung cấp status"}), 400
        
        try:
            new_status = ReservationStatus(data['status'])
        except ValueError:
            return jsonify({"message": f"Status không hợp lệ: {data['status']}"}), 400
        
        reservation = session.query(ReservationModel).filter(
            ReservationModel.id == reservation_id,
            ReservationModel.tenant_id == tenant_id
        ).first()
        
        if not reservation:
            return jsonify({"message": "Đặt bàn không tồn tại"}), 404
        
        reservation.status = new_status
        if 'notes' in data:
            reservation.notes = data['notes']
        
        session.commit()
        session.refresh(reservation)
        
        return jsonify({
            "data": {
                "id": reservation.id,
                "status": reservation.status.value,
                "date": reservation.date.isoformat() if reservation.date else None,
                "time": reservation.time,
                "notes": reservation.notes
            },
            "message": "Cập nhật trạng thái đặt bàn thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating reservation status: {str(e)}", exc_info=True)
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()

