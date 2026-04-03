from fastapi import Request, Response
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
import redis
from config.settings import settings

# Redis 连接
redis_client = None


def init_cache():
    """初始化缓存"""
    global redis_client
    try:
        redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            decode_responses=True
        )
        redis_client.ping()
        FastAPICache.init(RedisBackend(redis_client), prefix="task-api")
        return True
    except Exception:
        # Redis 未启用或连接失败，使用内存缓存
        from fastapi_cache.backends.inmemory import InMemoryBackend
        FastAPICache.init(InMemoryBackend(), prefix="task-api")
        return False


def cache_key_builder(func, namespace: str = "", *, request: Request, response: Response, **kwargs):
    """自定义缓存 key"""
    return f"{namespace}:{request.url.path}:{hash(str(request.query_params))}"


# 缓存装饰器（带过期时间）
cache_1min = cache(expire=60)
cache_5min = cache(expire=300)
cache_1hour = cache(expire=3600)
