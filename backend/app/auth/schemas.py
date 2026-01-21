"""
认证模块 - Pydantic 模型定义
"""
from pydantic import BaseModel, Field
from typing import Optional


class RegisterRequest(BaseModel):
    """注册请求"""
    username: str = Field(
        min_length=3, 
        max_length=20,
        description="用户名，3-20个字符"
    )
    password: str = Field(
        min_length=6,
        max_length=128,
        description="密码，至少6个字符"
    )


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(description="用户名")
    password: str = Field(description="密码")


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: str
    avatar: str
    level: int = 1
    points: int = 0
    coins: float = 0
    operation_time: int = 0
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """认证响应（登录/注册）"""
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None


class MeResponse(BaseModel):
    """当前用户响应"""
    success: bool = True
    data: UserResponse
