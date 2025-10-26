import base64
import os
from typing import Any, Iterator, List, Optional

import google.generativeai as genai
import requests
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
            # Gửi toàn bộ parts (bao gồm cả text và image)
            last_message_parts = gemini_messages[-1]["parts"]

            response = chat.send_message(
                last_message_parts,  # Gửi full parts array thay vì chỉ parts[0]
                generation_config=genai.types.GenerationConfig(
                    temperature=self.temperature,
                ),
            )

            return ChatResult(
                generations=[ChatGeneration(message=AIMessage(content=response.text))]
            )
        except Exception as e:
            # Fallback: Queue request hoặc switch sang OpenRouter
            logger.error(f"Gemini generation error: {e}")
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

            # Gửi toàn bộ parts (bao gồm cả text và image)
            last_message_parts = gemini_messages[-1]["parts"]

            # Stream response
            response = chat.send_message(
                last_message_parts,  # Gửi full parts array thay vì chỉ parts[0]
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

            # Xử lý multimodal content (text + image)
            if isinstance(msg.content, list):
                parts = []
                for item in msg.content:
                    if isinstance(item, dict):
                        if item.get("type") == "text":
                            parts.append(item["text"])
                        elif item.get("type") == "image_url":
                            # Gemini hỗ trợ inline data cho ảnh theo format chính thức
                            image_url = item["image_url"]["url"]
                            try:
                                if image_url.startswith("http"):
                                    # Download image và convert sang base64
                                    logger.info(
                                        f"Downloading image from URL: \
                                            {image_url[:100]}..."
                                    )
                                    response = requests.get(image_url, timeout=10)
                                    image_bytes = response.content

                                    # Format theo Python SDK: inline_data
                                    #   với mime_type và data
                                    parts.append(
                                        {
                                            "inline_data": {
                                                "mime_type": response.headers.get(
                                                    "content-type", "image/jpeg"
                                                ),
                                                "data": base64.b64encode(
                                                    image_bytes
                                                ).decode("utf-8"),
                                            }
                                        }
                                    )
                                    logger.info(
                                        f"Image downloaded, size: {len(image_bytes)} \
                                            bytes, mime: {response.headers.get('content-type')}"
                                    )
                                elif image_url.startswith("data:image"):
                                    # Base64 encoded image từ form
                                    header, encoded = image_url.split(",", 1)
                                    mime_type = header.split(":")[1].split(";")[0]

                                    # Format theo Python SDK: inline_data (snake_case) với mime_type và data
                                    parts.append(
                                        {
                                            "inline_data": {
                                                "mime_type": mime_type,
                                                "data": encoded,
                                            }
                                        }
                                    )
                                    logger.info(
                                        f"Base64 image added, mime: {mime_type}, \
                                            data length: {len(encoded)}"
                                    )
                                else:
                                    logger.warning(
                                        f"Unsupported image URL format: {image_url}"
                                    )
                                    parts.append(f"[Error: Unsupported image format]")
                            except Exception as e:
                                logger.error(f"Failed to load image: {e}")
                                parts.append(f"[Error loading image: {e}]")
                    else:
                        parts.append(item)
                gemini_messages.append({"role": role, "parts": parts})
                logger.info(f"Added multimodal message with {len(parts)} parts")
            else:
                # Simple text content
                gemini_messages.append({"role": role, "parts": [msg.content]})

        # Merge system message
        if messages and messages[0].type == "system":
            system_content = messages[0].content
            if len(gemini_messages) > 1:
                # Merge system với user message đầu tiên
                first_user_parts = (
                    gemini_messages[1]["parts"] if len(gemini_messages) > 1 else []
                )
                merged_parts = []

                # Thêm system prompt trước
                merged_parts.append(f"{system_content}\n\n")

                # Thêm parts từ user message (có thể là text + image)
                if isinstance(first_user_parts, list):
                    text_parts = []
                    other_parts = []
                    for part in first_user_parts:
                        if isinstance(part, str):
                            text_parts.append(part)
                        else:
                            other_parts.append(part)

                    # Merge text parts
                    if text_parts:
                        merged_parts[0] += "".join(text_parts)
                    # Thêm image/other parts
                    merged_parts.extend(other_parts)
                else:
                    merged_parts[0] += str(first_user_parts)

                gemini_messages = [
                    {"role": "user", "parts": merged_parts}
                ] + gemini_messages[2:]
            else:
                gemini_messages = [{"role": "user", "parts": [system_content]}]

        return gemini_messages
