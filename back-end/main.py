from contextlib import asynccontextmanager

import uvicorn
from config import settings
from database.checkpointer import get_async_checkpointer, get_manager
from database.init_db import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.factory import ModelFactory
from routers import advice, auth, analys
from utils.logger import setup_logger
from utils.redis_client import RedisCache

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle hooks - run on startup/shutdown

    Startup:
    - Load model config
    - Warm up models (optional)

    Shutdown:
    - Close database connections
    - Flush metrics
    """
    # Startup
    init_db()
    print("Loading model configuration...")
    ModelFactory.load_config(settings.MODEL_CONFIG_PATH)

    if settings.REDIS_URL and settings.REDIS_ENABLED:
        print("Connecting to Redis...")
        try:
            cache = RedisCache(url=settings.REDIS_URL)
            if cache.health_check():
                print("Redis connected successfully")
            else:
                print("Redis connection failed - running without cache")
        except Exception as e:
            print(f"Redis initialization error: {e}")
            print("   → Running without Redis cache")
    else:
        print("Redis disabled - using in-memory cache only")

    print("Connecting to PostgreSQL...")
    try:
        checkpointer = await get_async_checkpointer()

        if checkpointer:
            logger.info("Async checkpointer ready")
        else:
            logger.error("Checkpointer is None!")

    except Exception as e:
        logger.error(f"PostgreSQL initialization error: {e}")
        import traceback

        logger.error(traceback.format_exc())

    except Exception as e:
        logger.error(f"PostgreSQL initialization error: {e}")
        import traceback

        logger.error(traceback.format_exc())

    yield

    # Shutdown
    print("Shutting down...")
    manager = get_manager()
    if manager:
        await manager.close()
        logger.info("Async checkpointer closed")

    logger.info("Shutdown complete")


app = FastAPI(title="Macro Mate API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Thay bằng domain cụ thể trong production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup -> Cách cũ: FastAPI không còn hỗ trợ
# @app.on_event("startup")
# async def startup_event():
#     init_db()

# Include routers
app.include_router(auth.router)
app.include_router(advice.router)
app.include_router(analys.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Macro Mate API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
