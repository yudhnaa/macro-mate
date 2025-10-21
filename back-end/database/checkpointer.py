import logging
from typing import Optional
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from config import settings

logger = logging.getLogger(__name__)
# settings = get_settings()


class AsyncPostgresCheckpointerManager:
    def __init__(self, database_url: str = None, schema: str = None):
        self.database_url = settings.DATABASE_URL if database_url is None else database_url
        self.schema = schema or settings.CHECKPOINT_SCHEMA
        self._checkpointer: Optional[AsyncPostgresSaver] = None
        self._pool: Optional[AsyncConnectionPool] = None
        self._conn = None

    async def initialize(self):
        """Initialize async connection pool"""
        try:
            logger.info("🔌 Creating async connection pool...")

            connection_kwargs = {
                "autocommit": True,
                "prepare_threshold": 0,
                "options": f"-c search_path={self.schema},public"
            }

            # ✅ Create pool WITHOUT opening it
            self._pool = AsyncConnectionPool(
                self.database_url,
                min_size=2,
                max_size=10,
                kwargs=connection_kwargs,
                open=False
            )

            # ✅ Open pool explicitly
            await self._pool.open()
            logger.info("✅ Async pool opened")

            async with self._pool.connection() as conn:
                await conn.execute(f"CREATE SCHEMA IF NOT EXISTS {self.schema}")

            # ✅ Create checkpointer với POOL
            self._checkpointer = AsyncPostgresSaver(
                self._pool,
            )

            # ✅ Setup tables
            await self._checkpointer.setup()
            logger.info("✅ Checkpointer tables created/verified")

            return True

        except Exception as e:
            logger.error(f"❌ Failed to initialize async checkpointer: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    def get_checkpointer(self) -> Optional[AsyncPostgresSaver]:
        """Get checkpointer instance"""
        return self._checkpointer

    async def close(self):
        """Close pool and connections"""
        if self._conn and self._pool:
            try:
                await self._pool.putconn(self._conn)
            except Exception as e:
                logger.warning(f"Error returning connection: {e}")

        if self._pool:
            try:
                await self._pool.close()
                logger.info("✅ Async pool closed")
            except Exception as e:
                logger.warning(f"Error closing pool: {e}")


# Singleton
_manager: Optional[AsyncPostgresCheckpointerManager] = None


async def get_async_checkpointer() -> Optional[AsyncPostgresSaver]:
    """
    Get singleton async checkpointer

    ⚠️ Must be called AFTER initialize in app startup
    """
    global _manager

    if _manager is None:
        _manager = AsyncPostgresCheckpointerManager()
        success = await _manager.initialize()

        if not success:
            logger.error("❌ Failed to initialize checkpointer")
            return None

    return _manager.get_checkpointer()


def get_manager() -> Optional[AsyncPostgresCheckpointerManager]:
    """Get manager for health checks"""
    return _manager