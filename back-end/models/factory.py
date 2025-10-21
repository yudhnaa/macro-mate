import os
from typing import Literal, Optional

import yaml
from config import settings
from models.base.base_llm import BaseReasoningModel
from models.base.base_vlm import BaseVisionLanguageModel
from models.providers.gemini import Gemini
from models.providers.openrouter import OpenRouterVLM

ModelType = Literal["vlm", "llm"]
ProviderType = Literal["openrouter", "gemini", "anthropic", "openai"]


class ModelFactory:
    """Factory tạo model dựa trên config"""

    _config: dict = {}
    _instances: dict = {}

    @classmethod
    def load_config(cls, config_path: str = "model_config.yaml"):
        with open(config_path, "r") as f:
            cls._config = yaml.safe_load(f)

    @classmethod
    def create_vlm(
        cls,
        provider: Optional[ProviderType] = None,
        model_name: Optional[str] = None,
        **kwargs,
    ) -> BaseVisionLanguageModel:
        if not cls._config:
            cls.load_config()

        provider = (
            provider
            or os.getenv("VLM_PROVIDER")
            or cls._config["vlm"]["default_provider"]
        )

        cache_key = f"vlm_{provider}_{model_name}"
        if cache_key in cls._instances:
            return cls._instances[cache_key]

        provider_config = cls._config["vlm"]["providers"][provider]
        if provider == "openrouter":
            model = OpenRouterVLM(
                model_name=model_name or provider_config["model"],
                api_key=os.getenv("OPEN_ROUTER_API_KEY"),
                **kwargs,
            )
        elif provider == "gemini":
            model = Gemini(
                model_name=model_name or provider_config["gemini"],
                api_key=os.getenv("GOOGLE_API_KEY"),
                **kwargs,
            )
            # raise NotImplementedError("Gemini VLM chưa implement")
        else:
            raise ValueError(f"Unknown VLM provider: {provider}")
        cls._instances[cache_key] = model
        return model

    @classmethod
    def create_llm(cls):
        """
        Tạo LLM với streaming support

        ⚠️ Lưu ý: Kiểm tra model có support streaming không
        """
        # settings = get_settings()
        provider = settings.LLM_PROVIDER
        llm_config = settings.get_llm_config()
        api_key = settings.get_api_key(provider)

        if provider == "gemini":

            model = Gemini(model_name=llm_config["model"], api_key=api_key)

            # Check if model supports streaming (property now exists)
            if not model.supports_streaming:
                print(
                    f"⚠️ Model {llm_config['model']} does not support native streaming"
                )

            return model

        else:
            raise ValueError(f"Unknown LLM provider: {provider}")

    @classmethod
    def create_with_fallback(
        cls,
        model_type: ModelType,
        primary_provider: ProviderType,
        fallback_providers: list[ProviderType],
        **kwargs,
    ):
        pass
