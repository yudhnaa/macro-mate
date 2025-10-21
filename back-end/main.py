from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import auth, advice

from contextlib import asynccontextmanager
from database.init_db import init_db
from models.factory import ModelFactory
from utils.redis_client import RedisCache
from config import settings
from database.checkpointer import get_async_checkpointer, get_manager
from utils.logger import setup_logger
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
            logger.info("✅ Async checkpointer ready")

            # # ✅ TEST write/read với ĐÚNG signature
            # test_config = {"configurable": {"thread_id": "test_startup_789"}}

            # ✅ Cách ĐÚNG: Dùng graph để test, không gọi trực tiếp aput()
        #     try:
        #         # Test bằng cách list checkpoints
        #         logger.info("📖 Testing checkpointer by listing...")
        #         count = 0
        #         async for checkpoint_tuple in checkpointer.alist(test_config):
        #             count += 1
        #             if count >= 1:  # Chỉ check 1 cái
        #                 break
        #
        #         logger.info(f"✅ Checkpointer operational (found {count} existing checkpoints)")
        #
        #     except Exception as e:
        #         logger.error(f"❌ Checkpointer test FAILED: {e}")
        #         import traceback
        #         logger.error(traceback.format_exc())
        else:
            logger.error("❌ Checkpointer is None!")

    except Exception as e:
        logger.error(f"PostgreSQL initialization error: {e}")
        import traceback
        logger.error(traceback.format_exc())

    except Exception as e:
        logger.error(f"PostgreSQL initialization error: {e}")
        import traceback
        logger.error(traceback.format_exc())

    # if settings.USE_MOCK_USER_SERVICE:
    #     print("Using MOCK User Service (local development mode)")
    #     from app.services.mock_user_service import MockUserService
    #     users = MockUserService.list_mock_users()
    #     print(f"   → Available mock users: {', '.join(users.keys())}")
    # else:
    #     print(f"Using REAL User Service: {settings.USER_SERVICE_URL}")

    yield

    # Shutdown
    print("Shutting down...")
    manager = get_manager()
    if manager:
        await manager.close()
        logger.info("✅ Async checkpointer closed")

    logger.info("✅ Shutdown complete")

app = FastAPI(
    title="Macro Mate API",
    version="1.0.0",
    lifespan=lifespan
)

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
        log_level=settings.LOG_LEVEL.lower()
    )