from abc import ABC, abstractmethod
from typing import Any, Iterator, Optional

from langchain_core.language_models import BaseChatModel


class BaseReasoningModel(BaseChatModel, ABC):
    """
    Interface cho text-only LLMs (không cần vision).
    """

    temperature: float = 0.7
    max_tokens: Optional[int] = 4096
    timeout: int = 60  # Request timeout (seconds)

    @abstractmethod
    def _generate(self, messages, stop=None, **kwargs):
        pass

    @abstractmethod
    def _stream(self, messages, stop=None, **kwargs):
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    def supports_streaming(self) -> bool:
        """
        Indicates if the model supports native streaming.
        Override in subclasses if streaming is not supported.
        """
        return True  # Default: assume streaming is supported
