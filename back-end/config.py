from pathlib import Path
from typing import Optional

import yaml
from pydantic import ConfigDict, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database settings
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = ""
    DATABASE_NAME: str = "macro_mate"

    # ===== API Settings =====
    API_V1_PREFIX: str = "/api/v1"

    # ===== CORS =====
    ALLOWED_ORIGINS: list[str] = Field(
        default=["http://localhost:3000"], description="Allowed CORS origins"
    )

    # Model Routers API key
    OPENROUTER_API_KEY: Optional[str] = Field(
        default=None, alias="OPEN_ROUTER_API_KEY", description="OpenRouter API key"
    )

    GOOGLE_API_KEY: Optional[str] = Field(default=None, description="Google AI API key")

    GOOGLE_CLOUD_PROJECT: Optional[str] = Field(
        default=None, description="Google Cloud project ID"
    )

    # ===== Model Providers =====
    VLM_PROVIDER: str = Field(
        default="openrouter", description="Vision Language Model provider"
    )

    LLM_PROVIDER: str = Field(default="gemini", description="Text LLM provider")

    # ===== Feature Flags =====
    ENABLE_STREAMING: bool = Field(
        default=True, description="Enable SSE streaming responses"
    )

    ENABLE_COST_TRACKING: bool = Field(default=True, description="Track API call costs")

    ENABLE_FALLBACK: bool = Field(
        default=True, description="Auto fallback to alternative providers on failure"
    )

    # ===== Paths =====
    MODEL_CONFIG_PATH: str = Field(
        default="model_config.yaml", description="Path to model configuration YAML"
    )

    # AI SCHEMA
    CHECKPOINT_SCHEMA: str = Field(
        default="ai_service", description="PostgreSQL schema for LangGraph checkpoints"
    )

    # ===== Cache Settings =====
    CACHE_TTL: int = Field(default=3600, description="Cache TTL in seconds (1 hour)")
    ENABLE_MEMORY_CACHE: bool = Field(
        default=True, description="Enable L1 memory cache"
    )

    # ===== Pydantic Config =====
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore", 
        populate_by_name=True,
    )

    # ===== Redis Configuration =====
    REDIS_URL: Optional[str] = Field(
        default=None,
        description="Redis connection URL. Format: redis://localhost:6379/0",
    )
    REDIS_ENABLED: bool = Field(
        default=True, description="Enable/disable Redis caching"
    )

    # ===== YAML Config Cache =====
    _yaml_config: dict = {}

    def model_post_init(self, __context) -> None:
        self._load_yaml_config()

    def _load_yaml_config(self) -> None:
        """
        Load model config từ YAML file

        TODO: Add validation cho YAML structure
        """
        config_path = Path(self.MODEL_CONFIG_PATH)

        if not config_path.exists():
            raise FileNotFoundError(
                f"Model config file not found: {self.MODEL_CONFIG_PATH}"
            )

        with open(config_path, "r", encoding="utf-8") as f:
            self._yaml_config = yaml.safe_load(f)

    def get_vlm_config(self) -> dict:
        """
        Get VLM configuration cho provider hiện tại

        Returns:
            {
                "model": "qwen/qwen2.5-vl-72b-instruct:free",
                "rate_limit": {...},
                "timeout": 30,
                ...
            }
        """
        provider = self.VLM_PROVIDER
        vlm_config = self._yaml_config.get("vlm", {})

        if provider not in vlm_config.get("providers", {}):
            raise ValueError(
                f"VLM provider '{provider}' not found in config. "
                f"Available: {list(vlm_config.get('providers', {}).keys())}"
            )

        return vlm_config["providers"][provider]

    def get_llm_config(self) -> dict:
        """
        Get LLM configuration cho provider hiện tại
        """
        provider = self.LLM_PROVIDER
        llm_config = self._yaml_config.get("llm", {})

        if provider not in llm_config.get("providers", {}):
            raise ValueError(
                f"LLM provider '{provider}' not found in config. "
                f"Available: {list(llm_config.get('providers', {}).keys())}"
            )

        return llm_config["providers"][provider]

    def get_feature_flags(self) -> dict:
        """
        Get all feature flags từ YAML

        Merge với env vars (env vars có priority cao hơn)
        """
        yaml_features = self._yaml_config.get("features", {})

        # Override bằng env vars
        return {
            "enable_streaming": self.ENABLE_STREAMING,
            "enable_cost_tracking": self.ENABLE_COST_TRACKING,
            "enable_fallback": self.ENABLE_FALLBACK,
            **yaml_features,
        }

    def get_monitoring_config(self) -> dict:
        """
        Get monitoring configuration
        """
        return self._yaml_config.get("monitoring", {})

    def get_api_key(self, provider: str) -> str:
        """
        Get API key cho provider cụ thể

        Args:
            provider: "openrouter", "gemini", etc.

        Returns:
            API key string

        Raises:
            ValueError: Nếu API key không được set
        """
        key_map = {
            "openrouter": self.OPENROUTER_API_KEY,
            "gemini": self.GOOGLE_API_KEY,
        }

        if provider not in key_map:
            raise ValueError(f"Unknown provider: {provider}")

        api_key = key_map[provider]

        if not api_key:
            raise ValueError(
                f"API key for '{provider}' not set. "
                f"Please set {'OPENROUTER_API_KEY' if provider == 'openrouter' else 'GOOGLE_API_KEY'} "
                f"in .env file"
            )

        return api_key

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

    # class Config:
    #     env_file = ".env"


settings = Settings()