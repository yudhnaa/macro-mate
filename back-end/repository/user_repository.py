### GIẢ LẬP CHỨC NĂNG LẤY THÔNG TIN NGƯỜI DÙNG ###

from typing import Optional, Dict, Any
from utils.redis_client import RedisCache
from utils.logger import setup_logger

logger = setup_logger(__name__)

class UserRepository:
    def __init__(self, redis_client: Optional[RedisCache] = None):
        self.redis = redis_client

    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get user profile với caching

        Flow:
        1. Check Redis cache
        2. If miss → Fetch from DB/API
        3. Cache result
        4. Return
        """
        cache_key = f"user_profile:{user_id}"

        # Try cache first
        if self.redis:
            try:
                cached = await self.redis.get(cache_key)
                if cached:
                    logger.info(f"✅ Cache HIT for user {user_id}")
                    return cached
            except Exception as e:
                logger.warning(f"Redis error: {e}")

        # Cache miss - fetch from source
        logger.info(f"⚠️ Cache MISS for user {user_id} - fetching...")

        # Giả lập gọi db
        user_profile = await self._fetch_from_source(user_id)

        if self.redis and user_profile:
            try:
                await self.redis.set(cache_key, user_profile, expire=30 * 60)
                logger.info(f"💾 Cached profile for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to cache: {e}")

        return user_profile

    async def _fetch_from_source(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch user từ database hoặc external service

        TODO: Implement actual data source
        - Option 1: PostgreSQL query
        - Option 2: HTTP call to User Service
        - Option 3: GraphQL query
        """
        # Mock data for now (replace with actual implementation)
        mock_users = {
            "user_123": {
                "user_id": "user_123",
                "name": "John Doe",
                "age": 30,
                "weight": 70,
                "height": 175,
                "bmi" : "N/A",
                "bodyShape" : "mập",
                "health_conditions": "tiểu đường loại 2, huyết áp cao",
                "description" : "Giảm cân"
            },
            "user_456": {
                "user_id": "user_456",
                "name": "Jane Smith",
                "age": 35,
                "weight": 58,
                "height": 165,
                "bmi" : "N/A",
                "bodyShape" : "mập",
                "health_conditions": None,
                "description": "Tăng cơ"
            },
            "user_789": {
                "user_id": "user_789",
                "name": "Bob Wilson",
                "age": 45,
                "weight": 85,
                "height": 180,
                "bmi" : "N/A",
                "bodyShape" : "mập",
                "health_conditions": None,
                "description": "Duy trì sức khỏe"
            }
        }

        profile = mock_users.get(user_id)

        if not profile:
            logger.warning(f"User {user_id} not found - returning default")
            return {
                "user_id": user_id,
                "name": "Unknown User",
                "age": 30,
                "weight": 70,
                "height": 170,
                "bmi" : "N/A",
                "bodyShape" : "mập",
                "health_conditions": None,
                "description": "Duy trì sức khỏe",
                "_is_default": True
            }

        return profile

    async def invalidate_cache(self, user_id: str):
        """Invalidate cached user profile"""
        if self.redis:
            cache_key = f"user_profile:{user_id}"
            try:
                await self.redis.delete(cache_key)
                logger.info(f"🗑️ Invalidated cache for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to invalidate cache: {e}")

