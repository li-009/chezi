"""
社区模块测试
"""


def test_get_posts_requires_auth(client):
    """获取帖子需要认证"""
    response = client.get("/api/v1/posts")
    assert response.status_code in [401, 403]


def test_create_and_get_posts(client):
    """创建和获取帖子"""
    # 注册用户
    reg = client.post("/api/v1/auth/register", json={
        "username": "postuser",
        "password": "password123"
    })
    token = reg.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 创建帖子
    create_resp = client.post("/api/v1/posts", json={
        "content": "这是测试帖子内容"
    }, headers=headers)
    assert create_resp.status_code == 200
    post_data = create_resp.json()
    assert post_data["success"] is True
    post_id = post_data["data"]["id"]
    
    # 获取帖子列表
    list_resp = client.get("/api/v1/posts", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["success"] is True


def test_like_post(client):
    """点赞帖子"""
    reg = client.post("/api/v1/auth/register", json={
        "username": "likeuser",
        "password": "password123"
    })
    token = reg.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 创建帖子
    create_resp = client.post("/api/v1/posts", json={
        "content": "点赞测试帖子"
    }, headers=headers)
    post_id = create_resp.json()["data"]["id"]
    
    # 点赞
    like_resp = client.post(f"/api/v1/posts/{post_id}/like", headers=headers)
    assert like_resp.status_code == 200
    assert like_resp.json()["data"]["isLiked"] is True


def test_comment_on_post(client):
    """评论帖子"""
    reg = client.post("/api/v1/auth/register", json={
        "username": "commentuser",
        "password": "password123"
    })
    token = reg.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 创建帖子
    create_resp = client.post("/api/v1/posts", json={
        "content": "评论测试帖子"
    }, headers=headers)
    post_id = create_resp.json()["data"]["id"]
    
    # 评论
    comment_resp = client.post(f"/api/v1/posts/{post_id}/comment", json={
        "content": "这是评论内容"
    }, headers=headers)
    assert comment_resp.status_code == 200
    assert comment_resp.json()["success"] is True
