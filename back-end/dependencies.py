from functools import lru_cache

from services.workflow_service import WorkflowService
from utils.redis_client import RedisCache, cache_user_profile


@lru_cache()
def get_workflow_service() -> WorkflowService:
    """
    Dependency injection - singleton service

    """
    return WorkflowService()


def get_checkpointer() -> RedisCache:
    """
    Get Redis checkpointer instance

    Use case: Direct access để xóa checkpoints, list threads, etc.
    """
    return cache_user_profile()


# def get_settings_dependency() -> Settings:
#     """
#     Inject settings vào routes
#     """
#     return get_settings()
