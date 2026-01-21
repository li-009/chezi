"""
FastAPI 主应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import init_db
from .auth.router import router as auth_router
from .vehicles.router import router as vehicles_router
from .posts.router import router as posts_router
from .store.router import router as store_router
from .users.router import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    settings = get_settings()
    print(f"🚀 Chezi Backend 启动中...")
    print(f"📍 端口: {settings.port}")
    print(f"💾 数据库: {settings.database_path}")
    
    # 初始化数据库
    init_db()
    
    # 插入示例数据（首次运行）
    seed_demo_data()
    
    yield
    
    # 关闭时
    print("👋 Chezi Backend 已关闭")


def seed_demo_data():
    """插入示例数据（如果数据库为空）"""
    from .database import SessionLocal
    from .models import Vehicle, StoreItem
    
    db = SessionLocal()
    try:
        # 检查是否已有数据
        if db.query(Vehicle).count() == 0:
            # 添加示例设备
            vehicles = [
                Vehicle(
                    vehicle_id="EXC-001",
                    name="卡特彼勒 320D",
                    type="excavator",
                    status="available",
                    price=2.5,
                    latency=45,
                    image="https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400",
                    rating=4.8
                ),
                Vehicle(
                    vehicle_id="CRN-001",
                    name="徐工 QY25K5",
                    type="crane",
                    status="available",
                    price=3.0,
                    latency=50,
                    image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
                    rating=4.6
                ),
                Vehicle(
                    vehicle_id="LDR-001",
                    name="临工 L956F",
                    type="loader",
                    status="available",
                    price=2.0,
                    latency=40,
                    image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                    rating=4.7
                ),
            ]
            db.add_all(vehicles)
            print("✅ 已添加示例设备")
        
        if db.query(StoreItem).count() == 0:
            # 添加示例商品
            items = [
                StoreItem(
                    name="操控手套 Pro",
                    description="专业级操控手套，提升操控精度",
                    price=99.0,
                    category="equipment",
                    image="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400",
                    stock=50
                ),
                StoreItem(
                    name="VIP 月卡",
                    description="每月 100 分钟免费操控时长",
                    price=199.0,
                    category="membership",
                    image="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400",
                    stock=999
                ),
                StoreItem(
                    name="操控教程",
                    description="专业操作员培训课程",
                    price=49.0,
                    category="course",
                    image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
                    stock=999
                ),
            ]
            db.add_all(items)
            print("✅ 已添加示例商品")
        
        db.commit()
    except Exception as e:
        print(f"⚠️ 插入示例数据失败: {e}")
        db.rollback()
    finally:
        db.close()


# 创建 FastAPI 应用
app = FastAPI(
    title="Chezi API",
    description="工业设备远程操控平台 API (SQLite 版)",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "database": "SQLite",
        "service": "chezi-backend"
    }


# 注册路由
app.include_router(auth_router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(vehicles_router, prefix="/api/v1/vehicles", tags=["设备"])
app.include_router(posts_router, prefix="/api/v1/posts", tags=["社区"])
app.include_router(store_router, prefix="/api/v1/store", tags=["商城"])
app.include_router(users_router, prefix="/api/v1/users", tags=["用户"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
