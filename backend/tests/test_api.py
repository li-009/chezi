"""
Chezi 后端完整功能测试
运行: pytest tests/ -v
"""


def test_health(client):
    """健康检查"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "SQLite"


def test_get_vehicles(client):
    """获取设备列表"""
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_get_vehicle_detail(client, test_db):
    """获取设备详情"""
    from app.models import Vehicle
    # 先确保有设备
    vehicle = test_db.query(Vehicle).first()
    if vehicle:
        response = client.get(f"/api/v1/vehicles/{vehicle.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


def test_get_store_items(client):
    """获取商品列表"""
    response = client.get("/api/v1/store/items")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
