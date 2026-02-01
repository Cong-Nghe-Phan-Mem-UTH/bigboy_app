"""
Table routes
"""
from flask import Blueprint, request, jsonify, g
from app.infrastructure.databases import get_session
from app.models.table_model import TableModel, TableStatus
from app.api.decorators import require_employee
from app.utils.helpers import generate_qr_token

table_bp = Blueprint("table", __name__)


@table_bp.route("", methods=["GET"])
@require_employee
def get_tables():
    """Get list of tables"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User must belong to a tenant"}), 403
    
    session = get_session()
    try:
        tables = session.query(TableModel).filter(
            TableModel.tenant_id == g.current_user.tenant_id
        ).all()
        
        return jsonify({
            "data": [{
                "number": t.number,
                "tenant_id": t.tenant_id,
                "branch_id": t.branch_id,
                "capacity": t.capacity,
                "status": t.status.value,
                "token": t.token,
                "created_at": t.created_at.isoformat() if t.created_at else None
            } for t in tables],
            "message": "Lấy danh sách bàn thành công!"
        }), 200
    finally:
        session.close()


@table_bp.route("/<int:table_number>", methods=["GET"])
@require_employee
def get_table(table_number):
    """Get table by number"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User must belong to a tenant"}), 403
    
    session = get_session()
    try:
        table = session.query(TableModel).filter(
            TableModel.number == table_number,
            TableModel.tenant_id == g.current_user.tenant_id
        ).first()
        
        if not table:
            return jsonify({"message": "Table not found"}), 404
        
        return jsonify({
            "data": {
                "number": table.number,
                "tenant_id": table.tenant_id,
                "branch_id": table.branch_id,
                "capacity": table.capacity,
                "status": table.status.value,
                "token": table.token
            },
            "message": "Lấy thông tin bàn thành công!"
        }), 200
    finally:
        session.close()


@table_bp.route("", methods=["POST"])
@require_employee
def create_table():
    """Create a new table"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User must belong to a tenant"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        # Check if table number already exists for this tenant
        existing_table = session.query(TableModel).filter(
            TableModel.number == data.get('number'),
            TableModel.tenant_id == g.current_user.tenant_id
        ).first()
        
        if existing_table:
            return jsonify({"message": "Table number already exists"}), 400
        
        # Generate QR token
        token = generate_qr_token()
        
        table = TableModel(
            number=data.get('number'),
            tenant_id=g.current_user.tenant_id,
            branch_id=data.get('branch_id'),
            capacity=data.get('capacity'),
            status=TableStatus.AVAILABLE,
            token=token
        )
        
        session.add(table)
        session.commit()
        session.refresh(table)
        
        return jsonify({
            "data": {
                "number": table.number,
                "tenant_id": table.tenant_id,
                "branch_id": table.branch_id,
                "capacity": table.capacity,
                "status": table.status.value,
                "token": table.token
            },
            "message": "Tạo bàn thành công!"
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@table_bp.route("/<int:table_number>", methods=["PUT"])
@require_employee
def update_table(table_number):
    """Update a table"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User must belong to a tenant"}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request"}), 400
    
    session = get_session()
    try:
        table = session.query(TableModel).filter(
            TableModel.number == table_number,
            TableModel.tenant_id == g.current_user.tenant_id
        ).first()
        
        if not table:
            return jsonify({"message": "Table not found"}), 404
        
        # Update fields
        if 'capacity' in data:
            table.capacity = data['capacity']
        if 'status' in data:
            table.status = TableStatus(data['status'])
        
        session.commit()
        session.refresh(table)
        
        return jsonify({
            "data": {
                "number": table.number,
                "capacity": table.capacity,
                "status": table.status.value
            },
            "message": "Cập nhật bàn thành công!"
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()


@table_bp.route("/<int:table_number>", methods=["DELETE"])
@require_employee
def delete_table(table_number):
    """Delete a table"""
    if not g.current_user.tenant_id:
        return jsonify({"message": "User must belong to a tenant"}), 403
    
    session = get_session()
    try:
        table = session.query(TableModel).filter(
            TableModel.number == table_number,
            TableModel.tenant_id == g.current_user.tenant_id
        ).first()
        
        if not table:
            return jsonify({"message": "Table not found"}), 404
        
        session.delete(table)
        session.commit()
        
        return jsonify({"message": "Xóa bàn thành công!"}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"message": str(e)}), 500
    finally:
        session.close()

