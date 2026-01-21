"""
认证模块 - API 路由
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from .schemas import (
    RegisterRequest, 
    LoginRequest, 
    AuthResponse
)
from .service import (
    create_user,
    authenticate_user,
    create_access_token
)
from .deps import get_current_user
from ..database import get_db
from ..models import User

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    用户注册
    
    - **username**: 用户名，3-20个字符
    - **password**: 密码，至少6个字符
    """
    try:
        # 创建用户
        user = create_user(db, request.username, request.password)
        
        # 生成 Token
        token, expires_in = create_access_token(user.id)
        
        return {
            "success": True,
            "data": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar,
                "level": user.level,
                "points": user.points,
                "coins": user.coins,
                "token": token
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    用户登录
    
    - **username**: 用户名
    - **password**: 密码
    """
    user = authenticate_user(db, request.username, request.password)
    
    if user is None:
        return {
            "success": False,
            "message": "用户名或密码错误"
        }
    
    # 生成 Token
    token, expires_in = create_access_token(user.id)
    
    return {
        "success": True,
        "data": {
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar,
            "level": user.level,
            "points": user.points,
            "coins": user.coins,
            "token": token
        }
    }


@router.get("/me", response_model=AuthResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    获取当前登录用户信息
    
    需要在请求头中携带 Bearer Token
    """
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "username": current_user.username,
            "avatar": current_user.avatar,
            "level": current_user.level,
            "points": current_user.points,
            "coins": current_user.coins,
            "operation_time": current_user.operation_time
        }
    }
