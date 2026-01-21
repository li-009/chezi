# Chezi Backend - FastAPI

工业设备远程操控平台后端服务（重构版）

## 🚀 技术栈

- **Python 3.11+**
- **FastAPI** - 高性能 Web 框架
- **Pydantic** - 数据验证
- **Supabase** - PostgreSQL 数据库
- **JWT** - 用户认证
- **bcrypt** - 密码哈希

## 📦 安装

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

## ⚙️ 配置

1. 复制 `.env.example` 为 `.env`
2. 填写 Supabase 凭据和 JWT 密钥

```bash
cp .env.example .env
```

## 🏃 运行

```bash
# 开发模式
uvicorn app.main:app --reload --port 5000

# 或
python -m app.main
```

## 📡 API 文档

启动后访问：
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## 📂 项目结构

```
backend/
├── app/
│   ├── main.py          # 应用入口
│   ├── config.py        # 配置管理
│   ├── database.py      # 数据库连接
│   ├── auth/            # 认证模块
│   ├── vehicles/        # 设备模块
│   ├── posts/           # 社区模块
│   ├── store/           # 商城模块
│   └── users/           # 用户模块
├── tests/               # 测试
├── .env.example
└── requirements.txt
```

## 🔐 API 端点

### 认证
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录
- `GET /api/v1/auth/me` - 当前用户

### 设备
- `GET /api/v1/vehicles` - 设备列表
- `POST /api/v1/vehicles/{id}/reserve` - 预约
- `POST /api/v1/vehicles/{id}/release` - 释放

### 社区
- `GET /api/v1/posts` - 帖子列表
- `POST /api/v1/posts` - 发帖
- `POST /api/v1/posts/{id}/like` - 点赞
- `POST /api/v1/posts/{id}/comment` - 评论

### 商城
- `GET /api/v1/store/items` - 商品列表
- `POST /api/v1/store/orders` - 下单
- `GET /api/v1/store/orders` - 我的订单

### 用户
- `GET /api/v1/users/profile` - 个人资料
- `POST /api/v1/users/recharge` - 充值
