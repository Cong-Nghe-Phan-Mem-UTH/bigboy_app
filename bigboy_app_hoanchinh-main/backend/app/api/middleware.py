"""
Middleware setup for Flask
"""
from flask import request, g
import logging
from app.infrastructure.databases import get_session
from app.models.tenant_model import TenantModel, TenantStatus
from app.config import Config
from app.utils.errors import AuthError, ForbiddenError

logger = logging.getLogger(__name__)

def setup_middleware(app):
    """Setup middleware"""
    
    @app.before_request
    def log_request():
        """Log all incoming requests"""
        logger.info(f"📥 {request.method} {request.path} - IP: {request.remote_addr}")
        if request.is_json:
            logger.debug(f"Request body: {request.get_json()}")
    
    @app.before_request
    def load_tenant():
        """Load tenant from header"""
        # Skip tenant check for certain routes
        skip_paths = ['/health', '/test', '/docs', '/redoc', '/openapi.json', '/static', '/api/v1/customer', '/api/v1/guest', '/api/v1/auth']
        if any(request.path.startswith(path) for path in skip_paths):
            return
        
        # Get tenant ID from header
        tenant_header = request.headers.get(Config.TENANT_HEADER)
        tenant_id_or_slug = tenant_header or Config.DEFAULT_TENANT_ID
        
        if not tenant_id_or_slug:
            return
        
        # Find tenant
        session = get_session()
        try:
            # Try by ID first, then by slug
            try:
                tenant_id = int(tenant_id_or_slug)
                tenant = session.query(TenantModel).filter(TenantModel.id == tenant_id).first()
            except ValueError:
                tenant = session.query(TenantModel).filter(TenantModel.slug == tenant_id_or_slug).first()
            
            if not tenant:
                return
            
            if tenant.status != TenantStatus.ACTIVE:
                return
            
            # Attach to request context
            g.tenant = tenant
            g.tenant_id = tenant.id
            
        finally:
            session.close()

