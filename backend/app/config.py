"""
应用配置模块
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    
    # 服务器配置
    port: int = 5000
    host: str = "0.0.0.0"
    debug: bool = True
    
    # 数据库配置 (SQLite)
    database_path: str = "./chezi.db"
    
    # JWT 配置
    jwt_secret: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24小时
    
    # CORS 配置
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Gemini AI (可选)
    gemini_api_key: str = ""
    
    @property
    def cors_origins_list(self) -> list[str]:
        """获取 CORS 允许的源列表"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()
