"""
Cryptography utilities
"""
import bcrypt
from passlib.context import CryptContext

# Try to use passlib, fallback to bcrypt directly if there's an issue
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    USE_PASSLIB = True
except Exception:
    USE_PASSLIB = False


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    if not password:
        raise ValueError("Password cannot be empty")
    
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # Bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes
        password_bytes = password_bytes[:72]
        password = password_bytes.decode('utf-8', errors='ignore')
    
    try:
        if USE_PASSLIB:
            return pwd_context.hash(password)
        else:
            # Fallback to bcrypt directly
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
    except Exception as e:
        # If passlib fails, try bcrypt directly
        try:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password_bytes, salt)
            return hashed.decode('utf-8')
        except Exception as e2:
            raise ValueError(f"Error hashing password: {str(e2)}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    if not plain_password or not hashed_password:
        return False
    
    # Try passlib first if available
    if USE_PASSLIB:
        try:
            if pwd_context.verify(plain_password, hashed_password):
                return True
        except Exception:
            pass
    
    # Fallback to bcrypt directly (always try this as well)
    try:
        # Ensure password is string
        if not isinstance(plain_password, str):
            plain_password = str(plain_password)
        
        # Bcrypt has a 72-byte limit, truncate if necessary
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception as e:
        # Log error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Password verification error: {str(e)}")
        return False

