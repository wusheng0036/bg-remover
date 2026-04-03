from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.database import engine, Base
from src.routers import tasks
from src.cache import init_cache
from config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    Base.metadata.create_all(bind=engine)
    cache_enabled = init_cache()
    print(f"🚀 缓存状态: {'已启用 (Redis)' if cache_enabled else '内存缓存'}")
    yield
    # 关闭时执行
    print("👋 服务关闭")


# 创建应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="极简任务管理 API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(tasks.router)


@app.get("/")
def root():
    """根路径"""
    return {
        "message": "Task API 服务运行中",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}
