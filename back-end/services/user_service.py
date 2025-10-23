from repository.user_repository import UserRepository
from utils.redis_client import RedisCache


class UserProfileService:
    def __init__(self, redis_client: RedisCache = None):
        self.repository = UserRepository(redis_client)

    async def get_profile(self, user_id: str):
        profile = await self.repository.get_user_profile(user_id)

        return profile

    async def invalidate_cache(self, user_id: str):
        """Webhook từ User Service khi profile thay đổi"""
        await self.repository.invalidate_cache(user_id)
