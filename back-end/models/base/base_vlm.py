from abc import ABC, abstractmethod
from typing import Optional, Any, Iterator

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage
from langchain_core.outputs import ChatResult, ChatGenerationChunk

class BaseVisionLanguageModel(BaseChatModel, ABC):
    '''
    Interface cho các mô hình VLM Providers
    '''
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    timeout: int = 60  # Request timeout (seconds)

    @abstractmethod
    def _generate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        pass

    @abstractmethod
    def _stream(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        pass

    @property
    @abstractmethod
    def provider_name(self):
        pass