"""设备模块 - API 路由"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Vehicle, User
from ..auth.deps import get_current_user

router = APIRouter()


@router.get("")
def get_vehicles(type: Optional[str] = None, db: Session = Depends(get_db)):
    """
    获取设备列表
    
    - **type**: 可选，按类型筛选
    """
    query = db.query(Vehicle)
    
    if type and type != "all":
        query = query.filter(Vehicle.type == type)
    
    vehicles = query.all()
    
    return {
        "success": True,
        "data": [
            {
                "id": v.id,
                "vehicle_id": v.vehicle_id,
                "name": v.name,
                "type": v.type,
                "status": v.status,
                "price": v.price,
                "latency": v.latency,
                "image": v.image,
                "rating": v.rating
            }
            for v in vehicles
        ]
    }


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """获取单个设备详情"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="设备不存在"
        )
    
    return {
        "success": True,
        "data": {
            "id": vehicle.id,
            "vehicle_id": vehicle.vehicle_id,
            "name": vehicle.name,
            "type": vehicle.type,
            "status": vehicle.status,
            "price": vehicle.price,
            "latency": vehicle.latency,
            "image": vehicle.image,
            "rating": vehicle.rating
        }
    }


@router.post("/{vehicle_id}/reserve")
def reserve_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """预约设备（需要认证）"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="设备不存在"
        )
    
    if vehicle.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="设备当前不可用"
        )
    
    # 更新设备状态
    vehicle.status = "reserved"
    vehicle.reserved_by = current_user.id
    db.commit()
    
    return {
        "success": True,
        "message": "预约成功",
        "data": {
            "id": vehicle.id,
            "name": vehicle.name,
            "status": vehicle.status
        }
    }


@router.post("/{vehicle_id}/release")
def release_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """释放设备（需要认证）"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="设备不存在"
        )
    
    # 更新设备状态
    vehicle.status = "available"
    vehicle.reserved_by = None
    db.commit()
    
    return {
        "success": True,
        "message": "设备已释放"
    }
