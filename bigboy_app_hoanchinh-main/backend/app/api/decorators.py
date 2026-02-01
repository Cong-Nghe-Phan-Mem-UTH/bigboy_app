"""
Authentication decorators for Flask
"""
from functools import wraps
from flask import request, g, jsonify
from app.infrastructure.databases import get_session
from app.models.account_model import AccountModel, AccountRole
from app.utils.jwt import verify_access_token
from app.utils.errors import AuthError, ForbiddenError

def require_auth(f):
    """Require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthError('Không nhận được access token')
        
        try:
            token = auth_header.split(' ')[1]  # Bearer <token>
        except IndexError:
            raise AuthError('Invalid authorization header format')
        
        payload = verify_access_token(token)
        if not payload:
            raise AuthError('Access token không hợp lệ')
        
        user_id = payload.get('sub')
        if not user_id:
            raise AuthError('Invalid token payload')
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            raise AuthError('Invalid token payload')
        
        session = get_session()
        try:
            user = session.query(AccountModel).filter(AccountModel.id == user_id).first()
            if not user:
                raise AuthError('User not found')
            
            # Verify tenant access if tenant is set
            if hasattr(g, 'tenant_id') and user.tenant_id and user.tenant_id != g.tenant_id:
                raise AuthError('Không có quyền truy cập tenant này')
            
            g.current_user = user
            return f(*args, **kwargs)
        finally:
            session.close()
    
    return decorated_function

def require_admin(f):
    """Require admin role"""
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if g.current_user.role != AccountRole.ADMIN:
            raise ForbiddenError('Admin access required')
        return f(*args, **kwargs)
    return decorated_function

def require_owner(f):
    """Require owner role"""
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if g.current_user.role != AccountRole.OWNER:
            raise ForbiddenError('Owner access required')
        return f(*args, **kwargs)
    return decorated_function

def require_employee(f):
    """Require employee role (Employee, Manager, Cashier, Kitchen, Owner)"""
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        allowed_roles = [
            AccountRole.EMPLOYEE,
            AccountRole.MANAGER,
            AccountRole.CASHIER,
            AccountRole.KITCHEN,
            AccountRole.OWNER
        ]
        if g.current_user.role not in allowed_roles:
            raise ForbiddenError('Employee access required')
        return f(*args, **kwargs)
    return decorated_function

def require_manager(f):
    """Require manager role (Manager or Owner)"""
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if g.current_user.role not in [AccountRole.MANAGER, AccountRole.OWNER]:
            raise ForbiddenError('Manager access required')
        return f(*args, **kwargs)
    return decorated_function

