import hashlib
import json
import logging
from functools import wraps
from typing import Any, Dict, Optional

import redis

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self, url: str = "redis://localhost:6379/0"):
        self.client = redis.from_url(
            url,
            decode_responses=True,
            max_connections=50,
            socket_timeout=2,
            socket_connect_timeout=2,
            retry_on_timeout=True,
        )

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile từ cache

        Returns:
            Profile dict hoặc None nếu cache miss
        """
        key = f"profile:{user_id}"

        try:
            data = self.client.get(key)
            if data:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(data)

            logger.debug(f"Cache MISS: {key}")
            return None

        except redis.RedisError as e:
            logger.error(f"Redis error: {e}")
            return None

    def set_profile(
        self, user_id: str, profile: Dict[str, Any], ttl: int = 86400  # 24 hours
    ) -> bool:
        """
        Cache user profile

        Args:
            user_id: User identifier
            profile: Profile data (must be JSON-serializable)
            ttl: Time-to-live in seconds

        Returns:
            True if success
        """
        key = f"profile:{user_id}"

        try:
            self.client.setex(key, ttl, json.dumps(profile, ensure_ascii=False))
            logger.info(f"Cached profile: {user_id} (TTL: {ttl}s)")
            return True

        except redis.RedisError as e:
            logger.error(f"Failed to cache profile: {e}")
            return False

    def invalidate_profile(self, user_id: str) -> bool:
        """
        Xóa profile cache (khi user update profile)
        """
        key = f"profile:{user_id}"

        try:
            deleted = self.client.delete(key)
            logger.info(f"Invalidated cache: {key}")
            return deleted > 0

        except redis.RedisError as e:
            logger.error(f"Failed to invalidate: {e}")
            return False

    def get_thread(self, thread_id: str) -> Optional[Dict]:
        """
        Get conversation thread state (cho LangGraph checkpointing)
        """
        key = f"thread:{thread_id}"

        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Failed to get thread: {e}")
            return None

    def set_thread(self, thread_id: str, state: Dict, ttl: int = 604800):  # 7 days
        """
        Save thread state
        """
        key = f"thread:{thread_id}"

        try:
            self.client.setex(key, ttl, json.dumps(state))
            return True
        except Exception as e:
            logger.error(f"Failed to save thread: {e}")
            return False

    def health_check(self) -> bool:
        """
        Check Redis connection
        """
        try:
            self.client.ping()
            return True
        except Exception:
            return False


def cache_user_profile(ttl: int = 86400):
    """
    Decorator tự động cache profile

    Usage:
        @cache_user_profile(ttl=3600)
        async def fetch_user_profile(user_id: str):
            # Call User Service API
            return profile_data
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(user_id: str, *args, **kwargs):
            cache = RedisCache()

            # Try cache first
            cached = cache.get_profile(user_id)
            if cached:
                return cached

            # Cache miss → call original function
            result = await func(user_id, *args, **kwargs)

            # Save to cache
            if result:
                cache.set_profile(user_id, result, ttl)

            return result

        return wrapper

    return decorator
