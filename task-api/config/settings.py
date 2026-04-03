from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    app_name: str = "Task API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    database_url: str = "sqlite:///./tasks.db"
    
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Redis 缓存配置
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    cache_enabled: bool = True
    
    class Config:
        env_file = ".env"


settings = Settings()
