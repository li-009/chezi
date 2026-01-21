"""
用户模块测试
"""


def test_get_profile_requires_auth(client):
    """获取资料需要认证"""
    response = client.get("/api/v1/users/profile")
    assert response.status_code in [401, 403]


def test_get_profile_with_auth(client):
    """认证后获取资料"""
    # 注册用户
    reg = client.post("/api/v1/auth/register", json={
        "username": "profileuser",
        "password": "password123"
    })
    token = reg.json()["data"]["token"]
    
    # 获取资料
    response = client.get("/api/v1/users/profile", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "profileuser"


def test_get_stats(client):
    """获取用户统计"""
    reg = client.post("/api/v1/auth/register", json={
        "username": "statsuser",
        "password": "password123"
    })
    token = reg.json()["data"]["token"]
    
    response = client.get("/api/v1/users/stats", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "operationTime" in data["data"]
