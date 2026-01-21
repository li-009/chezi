def test_register_and_login(client):
    # 1. Register
    reg_response = client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "password": "password123"
    })
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert reg_data["success"] is True
    assert reg_data["data"]["username"] == "testuser"
    assert "token" in reg_data["data"]
    
    token = reg_data["data"]["token"]
    
    # 2. Login
    login_response = client.post("/api/v1/auth/login", json={
        "username": "testuser",
        "password": "password123"
    })
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    assert "token" in login_data["data"]
    
    # 3. Get Me
    me_response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["success"] is True
    assert me_data["data"]["username"] == "testuser"

def test_login_invalid_password(client):
    # Register handled by previous test or isolated per run, 
    # but here scope=module so 'testuser' exists if ordered correctly or run independently
    # Let's create a fresh user just in case
    client.post("/api/v1/auth/register", json={
        "username": "wronguser", 
        "password": "password123"
    })
    
    response = client.post("/api/v1/auth/login", json={
        "username": "wronguser",
        "password": "wrongpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False

def test_register_existing_user(client):
    client.post("/api/v1/auth/register", json={
        "username": "existinguser",
        "password": "password123"
    })
    
    response = client.post("/api/v1/auth/register", json={
        "username": "existinguser",
        "password": "password123"
    })
    assert response.status_code == 400
