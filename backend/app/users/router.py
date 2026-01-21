"""用户模块 - API 路由"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Order, Follow
from ..auth.deps import get_current_user

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    avatar: Optional[str] = None


class RechargeRequest(BaseModel):
    amount: float = Field(gt=0)


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """获取用户资料"""
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


@router.put("/profile")
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新用户资料"""
    if request.avatar:
        current_user.avatar = request.avatar
    
    db.commit()
    
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "username": current_user.username,
            "avatar": current_user.avatar
        },
        "message": "资料已更新"
    }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户统计数据"""
    tasks_completed = db.query(Order).filter(Order.user_id == current_user.id).count()
    earnings = current_user.operation_time * 0.5
    
    return {
        "success": True,
        "data": {
            "operationTime": current_user.operation_time,
            "earnings": earnings,
            "tasksCompleted": tasks_completed
        }
    }


@router.post("/recharge")
def recharge(
    request: RechargeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """充值余额"""
    current_user.coins += request.amount
    db.commit()
    
    return {
        "success": True,
        "data": {"coins": current_user.coins},
        "message": f"充值成功，当前余额: {current_user.coins}"
    }


@router.post("/{user_id}/follow")
def toggle_follow(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """关注/取消关注用户"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能关注自己")
    
    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if existing:
        db.delete(existing)
        is_following = False
    else:
        follow = Follow(follower_id=current_user.id, following_id=user_id)
        db.add(follow)
        is_following = True
    
    db.commit()
    
    return {
        "success": True,
        "data": {"isFollowing": is_following}
    }
