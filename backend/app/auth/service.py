"""
认证模块 - 业务逻辑服务
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..config import get_settings
from ..models import User

def hash_password(password: str) -> str:
    """哈希密码"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except ValueError:
        return False


def create_access_token(user_id: int) -> tuple[str, int]:
    """
    创建访问 Token
    
    Returns:
        (token, expires_in_seconds)
    """
    settings = get_settings()
    expires_delta = timedelta(minutes=settings.jwt_expire_minutes)
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    token = jwt.encode(
        payload, 
        settings.jwt_secret, 
        algorithm=settings.jwt_algorithm
    )
    
    return token, int(expires_delta.total_seconds())


def verify_token(token: str) -> Optional[int]:
    """
    验证 Token
    
    Returns:
        user_id if valid, None otherwise
    """
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id = int(payload.get("sub"))
        return user_id
    except JWTError:
        return None


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """通过用户名获取用户"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """通过 ID 获取用户"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, username: str, password: str) -> User:
    """
    创建新用户
    
    Raises:
        HTTPException: 用户名已存在
    """
    # 检查用户名是否存在
    existing = get_user_by_username(db, username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 创建用户
    user = User(
        username=username,
        password_hash=hash_password(password),
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
        level=1,
        points=0,
        coins=100.0,
        operation_time=0
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    验证用户登录
    
    Returns:
        用户数据 if 验证成功, None otherwise
    """
    user = get_user_by_username(db, username)
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user
