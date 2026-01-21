"""商城模块 - API 路由"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StoreItem, Order, OrderItem, User
from ..auth.deps import get_current_user

router = APIRouter()


class OrderItemRequest(BaseModel):
    item_id: int
    quantity: int = Field(ge=1)


class CreateOrderRequest(BaseModel):
    items: List[OrderItemRequest]


@router.get("/items")
def get_store_items(category: Optional[str] = None, db: Session = Depends(get_db)):
    """获取商品列表"""
    query = db.query(StoreItem)
    
    if category and category != "all":
        query = query.filter(StoreItem.category == category)
    
    items = query.all()
    
    return {
        "success": True,
        "data": [
            {
                "id": i.id,
                "name": i.name,
                "description": i.description,
                "price": i.price,
                "image": i.image,
                "category": i.category,
                "stock": i.stock
            }
            for i in items
        ]
    }


@router.get("/items/{item_id}")
def get_store_item(item_id: int, db: Session = Depends(get_db)):
    """获取商品详情"""
    item = db.query(StoreItem).filter(StoreItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    return {
        "success": True,
        "data": {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "image": item.image,
            "category": item.category,
            "stock": item.stock
        }
    }


@router.post("/orders")
def create_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建订单"""
    total_amount = 0
    order_items_data = []
    
    for item_req in request.items:
        product = db.query(StoreItem).filter(StoreItem.id == item_req.item_id).first()
        
        if not product:
            raise HTTPException(status_code=400, detail=f"商品 {item_req.item_id} 不存在")
        
        item_total = product.price * item_req.quantity
        total_amount += item_total
        
        order_items_data.append({
            "item_id": item_req.item_id,
            "name": product.name,
            "price": product.price,
            "quantity": item_req.quantity,
            "subtotal": item_total
        })
    
    # 检查余额
    if current_user.coins < total_amount:
        raise HTTPException(status_code=400, detail="余额不足")
    
    # 创建订单
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(order)
    db.flush()
    
    # 创建订单项
    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            item_id=item_data["item_id"],
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(order_item)
    
    # 扣除余额
    current_user.coins -= total_amount
    
    db.commit()
    
    return {
        "success": True,
        "data": {
            "order_id": order.id,
            "total_amount": total_amount,
            "items": order_items_data,
            "remaining_balance": current_user.coins
        },
        "message": "订单创建成功"
    }


@router.get("/orders")
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户订单"""
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()
    
    return {
        "success": True,
        "data": [
            {
                "id": o.id,
                "total_amount": o.total_amount,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
                "items": [
                    {
                        "id": item.id,
                        "item_id": item.item_id,
                        "quantity": item.quantity,
                        "price": item.price
                    }
                    for item in o.items
                ]
            }
            for o in orders
        ]
    }
