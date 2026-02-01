"""
JWT utilities for Flask
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt
from app.config import Config


def create_access_token(
    data: Dict,
    expires_delta: Optional[timedelta] = None,
    is_guest: bool = False
) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if is_guest:
            expire = datetime.utcnow() + timedelta(seconds=Config.GUEST_ACCESS_TOKEN_EXPIRES_IN)
        else:
            expire = datetime.utcnow() + timedelta(seconds=Config.ACCESS_TOKEN_EXPIRES_IN)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(
        to_encode,
        Config.ACCESS_TOKEN_SECRET,
        algorithm="HS256"
    )
    return encoded_jwt


def create_refresh_token(
    data: Dict,
    expires_delta: Optional[timedelta] = None,
    is_guest: bool = False
) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if is_guest:
            expire = datetime.utcnow() + timedelta(seconds=Config.GUEST_REFRESH_TOKEN_EXPIRES_IN)
        else:
            expire = datetime.utcnow() + timedelta(seconds=Config.REFRESH_TOKEN_EXPIRES_IN)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(
        to_encode,
        Config.REFRESH_TOKEN_SECRET,
        algorithm="HS256"
    )
    return encoded_jwt


def verify_access_token(token: str) -> Optional[Dict]:
    """Verify and decode access token"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        payload = jwt.decode(
            token,
            Config.ACCESS_TOKEN_SECRET,
            algorithms=["HS256"]
        )
        logger.info(f"✅ Token decoded successfully - keys: {list(payload.keys())}")
        return payload
    except jwt.ExpiredSignatureError as e:
        logger.warning(f"❌ Token expired: {str(e)}")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"❌ Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"❌ Token verification error: {str(e)}", exc_info=True)
        return None


def verify_refresh_token(token: str) -> Optional[Dict]:
    """Verify and decode refresh token"""
    try:
        payload = jwt.decode(
            token,
            Config.REFRESH_TOKEN_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
