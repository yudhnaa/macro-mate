import os
from typing import Any, Iterator, List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from models.base.base_llm import BaseReasoningModel
from pydantic import PrivateAttr
from utils.logger import setup_logger
load_dotenv()

logger = setup_logger(__name__)


class Gemini(BaseReasoningModel):
    model_name: str = None
    api_key: str = os.getenv("GOOGLE_API_KEY", "")

    _gemini_model: Any = PrivateAttr()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        genai.configure(api_key=self.api_key)
        self._gemini_model = genai.GenerativeModel(self.model_name)

    @property
    def _llm_type(self) -> str:
        return "gemini"

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def supports_streaming(self) -> bool:
        """Gemini supports streaming via generate_content(stream=True)"""
        return True

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        gemini_messages = self._prepare_messages(messages)
        chat = self._gemini_model.start_chat(
            history=gemini_messages[:-1] if len(gemini_messages) > 1 else []
        )
        try:
            response = chat.send_message(
                gemini_messages[-1]["parts"][0],
                generation_config=genai.types.GenerationConfig(
                    temperature=self.temperature,
                ),
            )

            return ChatResult(
                generations=[ChatGeneration(message=AIMessage(content=response.text))]
            )
        except Exception as e:
            # Fallback: Queue request hoặc switch sang OpenRouter
            raise ValueError(f"Gemini error: {str(e)}")

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """
        Stream từ Gemini với chat history

        Dùng chat API để giữ message history
        """
        gemini_messages = self._prepare_messages(messages)

        try:
            # Start chat với history
            chat = self._gemini_model.start_chat(
                history=gemini_messages[:-1] if len(gemini_messages) > 1 else []
            )

            # Stream response
            response = chat.send_message(
                gemini_messages[-1]["parts"][0],
                generation_config=genai.types.GenerationConfig(
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                ),
                stream=True,  # ← Enable streaming
            )

            # Yield chunks
            for chunk in response:
                text_content = ""

                # Try simple text accessor first
                try:
                    if hasattr(chunk, "text") and chunk.text:
                        text_content = chunk.text
                except (ValueError, AttributeError):
                    #  Fallback: Extract from parts (multi-part response)
                    if hasattr(chunk, "parts") and chunk.parts:
                        for part in chunk.parts:
                            if hasattr(part, "text") and part.text:
                                text_content += part.text

                # Yield nếu có content
                if text_content:
                    yield ChatGenerationChunk(
                        message=AIMessageChunk(content=text_content)
                    )

                    # Callback for monitoring
                    if run_manager:
                        run_manager.on_llm_new_token(text_content)

        except Exception as e:
            logger.info(f"LLM ERROR {e}")
            raise ValueError(f"Gemini streaming error: {str(e)}")

    def _convert_messages_to_prompt(self, messages: List[BaseMessage]) -> str:
        """
        Convert LangChain messages → Gemini text prompt

        Gemini API không có message history format như OpenAI
        Workaround: Concatenate thành single prompt

        """
        prompt_parts = []

        for msg in messages:
            role = msg.type  # "system", "human", "ai"
            content = msg.content

            if role == "system":
                prompt_parts.append(f"Instructions: {content}")
            elif role == "human":
                prompt_parts.append(f"User: {content}")
            elif role == "ai":
                prompt_parts.append(f"Assistant: {content}")
            else:
                prompt_parts.append(content)

        return "\n\n".join(prompt_parts)

    def _prepare_messages(self, messages) -> list[dict]:
        gemini_messages = []
        for msg in messages:
            role = "user" if msg.type in ["human", "user"] else "model"
            gemini_messages.append({"role": role, "parts": [msg.content]})

        # Merge system message
        if messages and messages[0].type == "system":
            system_content = messages[0].content
            if len(messages) > 1:
                gemini_messages = [
                    {
                        "role": "user",
                        "parts": [f"{system_content}\n\n{messages[1].content}"],
                    }
                ] + [
                    {
                        "role": "user" if m.type in ["human", "user"] else "model",
                        "parts": [m.content],
                    }
                    for m in messages[2:]
                ]
            else:
                gemini_messages = [{"role": "user", "parts": [system_content]}]

        return gemini_messages
