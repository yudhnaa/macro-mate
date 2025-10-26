import base64
import io
import os
import re
from typing import Any, Iterator, List, Optional

import google.generativeai as genai
from google.generativeai.types import HarmBlockThreshold, HarmCategory
from dotenv import load_dotenv
import httpx
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from models.base.base_llm import BaseReasoningModel
from models.base.base_vlm import BaseVisionLanguageModel
from pydantic import Field, PrivateAttr
from utils.logger import setup_logger

from PIL import Image

load_dotenv()

logger = setup_logger(__name__)


class Gemini(BaseReasoningModel, BaseVisionLanguageModel):
    """
    Gemini 2.0 Flash - Unified VLM + LLM

    ✅ Fixed all Pydantic field issues
    """

    # ✅ ADD MISSING FIELD
    model_name: str = Field(default="gemini-2.0-flash-exp")
    api_key: Optional[str] = Field(default=None)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=0.95, ge=0.0, le=1.0)
    max_output_tokens: int = Field(default=8192, gt=0)

    # ✅ PRIVATE ATTRIBUTES (not validated by Pydantic)
    _gemini_model: Any = PrivateAttr()
    _generation_config: Any = PrivateAttr()
    _safety_settings: Any = PrivateAttr()

    def __init__(
        self,
        model_name: str = "gemini-2.0-flash-exp",
        api_key: str = None,
        temperature: float = 0.7,
        top_p: float = 0.95,
        max_output_tokens: int = 8192,
        **kwargs
    ):
        # ✅ Call super().__init__() FIRST
        super().__init__(
            model_name=model_name,
            api_key=api_key,
            temperature=temperature,
            top_p=top_p,
            max_output_tokens=max_output_tokens,
            **kwargs
        )

        # Configure SDK
        genai.configure(api_key=self.api_key or os.getenv("GOOGLE_API_KEY"))

        # ✅ UNCOMMENT: Generation config (needed for API calls)
        self._generation_config = genai.types.GenerationConfig(
            temperature=self.temperature,
            top_p=self.top_p,
            top_k=40,
            max_output_tokens=self.max_output_tokens,
        )

        # ✅ UNCOMMENT: Safety settings
        self._safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        # ✅ FIX: Use _gemini_model (private attribute), not self.model
        self._gemini_model = genai.GenerativeModel(
            model_name=self.model_name,
            generation_config=self._generation_config,
            safety_settings=self._safety_settings
        )

        logger.info(f"✅ Gemini initialized: {self.model_name}")

    @property
    def _llm_type(self) -> str:
        return "gemini"

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def supports_streaming(self) -> bool:
        return True

    @property
    def supports_vision(self) -> bool:
        return True

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """
        ✅ Synchronous generation
        """
        try:
            gemini_messages = self._prepare_messages(messages)

            logger.info(f"📤 Sending {len(gemini_messages)} messages to Gemini")

            # Start chat with history (exclude last message)
            chat = self._gemini_model.start_chat(
                history=gemini_messages[:-1] if len(gemini_messages) > 1 else []
            )

            # Get last message parts (can be multimodal: [text, image, ...])
            last_message_parts = gemini_messages[-1]["parts"]

            logger.info(f"📝 Last message has {len(last_message_parts)} parts")
            for i, part in enumerate(last_message_parts):
                if isinstance(part, str):
                    logger.info(f"  Part {i}: text ({len(part)} chars)")
                elif isinstance(part, Image.Image):
                    logger.info(f"  Part {i}: PIL Image ({part.size})")
                else:
                    logger.info(f"  Part {i}: {type(part)}")

            # Send multimodal message (list of parts)
            response = chat.send_message(
                last_message_parts,  # ✅ FIX: Send ALL parts, not just parts[0]
                generation_config=self._generation_config,
            )

            return ChatResult(
                generations=[ChatGeneration(message=AIMessage(content=response.text))]
            )

        except Exception as e:
            logger.error(f"❌ Gemini generation error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise ValueError(f"Gemini error: {str(e)}")

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """
        ✅ Streaming generation
        """
        try:
            gemini_messages = self._prepare_messages(messages)

            # Start chat with history (exclude last message)
            chat = self._gemini_model.start_chat(
                history=gemini_messages[:-1] if len(gemini_messages) > 1 else []
            )

            # Get last message parts (can be multimodal: [text, image, ...])
            last_message_parts = gemini_messages[-1]["parts"]

            # Stream response
            response = chat.send_message(
                last_message_parts,  # ✅ FIX: Send ALL parts, not just parts[0]
                generation_config=self._generation_config,
                stream=True,
            )

            # Yield chunks
            for chunk in response:
                text_content = ""

                try:
                    if hasattr(chunk, "text") and chunk.text:
                        text_content = chunk.text
                except (ValueError, AttributeError):
                    if hasattr(chunk, "parts") and chunk.parts:
                        for part in chunk.parts:
                            if hasattr(part, "text") and part.text:
                                text_content += part.text

                if text_content:
                    yield ChatGenerationChunk(
                        message=AIMessageChunk(content=text_content)
                    )

                    if run_manager:
                        run_manager.on_llm_new_token(text_content)

        except Exception as e:
            logger.error(f"❌ Gemini streaming error: {e}")
            raise ValueError(f"Gemini streaming error: {str(e)}")

    def _prepare_messages(self, messages: List[BaseMessage]) -> List[dict]:
        """
        ✅ COMPLETE: Convert LangChain messages to Gemini chat format

        Handles:
        - Text-only messages
        - Multimodal messages (text + image)
        - System message merging
        """
        gemini_messages = []

        for msg in messages:
            role = "user" if msg.type in ["human", "user"] else "model"
            content = msg.content

            # Handle multimodal content (list)
            if isinstance(content, list):
                parts = []

                for item in content:
                    if item["type"] == "text":
                        parts.append(item["text"])

                    elif item["type"] == "image_url":
                        # Legacy OpenAI format support
                        image_url_field = item["image_url"]

                        if isinstance(image_url_field, dict):
                            image_url = image_url_field["url"]
                        else:
                            image_url = image_url_field

                        image_part = self._process_image_url(image_url)
                        if image_part:
                            parts.append(image_part)

                    elif item["type"] == "image":
                        # LangChain v1 standard content blocks
                        # Ref: https://python.langchain.com/docs/concepts/messages/#multimodal
                        source_type = item.get("source_type")

                        # Handle various base64 formats
                        base64_data = item.get("data") or item.get("base64")
                        mime_type = item.get("mime_type") or item.get("mimeType") or "image/jpeg"
                        image_url = item.get("url")

                        if source_type == "base64" or base64_data:
                            # Extract base64 data
                            if not base64_data:
                                logger.error(f"Missing 'data' or 'base64' field in base64 image block: {item}")
                                continue

                            # Reconstruct data URI for processing
                            data_uri = f"data:{mime_type};base64,{base64_data}"
                            image_part = self._process_image_url(data_uri)
                            if image_part:
                                parts.append(image_part)

                        elif source_type == "url" or image_url:
                            # URL-based image
                            if not image_url:
                                logger.error(f"Missing 'url' field in url image block: {item}")
                                continue

                            image_part = self._process_image_url(image_url)
                            if image_part:
                                parts.append(image_part)

                        elif source_type == "id":
                            # Provider-managed file ID (not yet supported)
                            logger.warning(f"File ID source type not supported: {item.get('id')}")

                        else:
                            logger.error(f"Unknown or missing source_type in image block: {item}")

                gemini_messages.append({"role": role, "parts": parts})

            # Handle text-only content (string)
            else:
                gemini_messages.append({"role": role, "parts": [content]})

        # Merge system message with first user message
        if messages and messages[0].type == "system":
            system_content = messages[0].content

            if len(messages) > 1:
                # Merge system into first user message
                first_user_content = messages[1].content
                merged_content = f"{system_content}\n\n{first_user_content}"

                gemini_messages = [
                    {"role": "user", "parts": [merged_content]}
                ] + [
                    {
                        "role": "user" if m.type in ["human", "user"] else "model",
                        "parts": [m.content] if isinstance(m.content, str) else m.content
                    }
                    for m in messages[2:]
                ]
            else:
                gemini_messages = [{"role": "user", "parts": [system_content]}]

        return gemini_messages

    def _process_image_url(self, image_url: str):
        """
        Process image URL for Gemini (using PIL Image)

        Supports:
        - Base64 data URI
        - HTTP/HTTPS URL
        - Local file path

        Returns: PIL Image object optimized for Gemini
        """
        try:
            image = None

            # Base64 data URI
            if image_url.startswith("data:image"):
                match = re.search(r"base64,(.+)", image_url)
                if match:
                    base64_data = match.group(1)
                    image_bytes = base64.b64decode(base64_data)
                    image = Image.open(io.BytesIO(image_bytes))
                    logger.info(f"✅ Decoded base64 image: {image.format} {image.size} {image.mode}")

            # HTTP/HTTPS URL
            elif image_url.startswith("http"):
                response = httpx.get(image_url, timeout=10.0)
                image = Image.open(io.BytesIO(response.content))
                logger.info(f"✅ Downloaded image from URL: {image.format} {image.size} {image.mode}")

            # Local file path
            else:
                image = Image.open(image_url)
                logger.info(f"✅ Loaded local image: {image.format} {image.size} {image.mode}")

            if image:
                # Convert to RGB if needed (Gemini works best with RGB)
                if image.mode not in ('RGB', 'RGBA'):
                    logger.info(f"🔄 Converting image from {image.mode} to RGB")
                    image = image.convert('RGB')

                # Resize if too large (Gemini has size limits)
                max_dimension = 3072  # Gemini's max dimension
                if max(image.size) > max_dimension:
                    ratio = max_dimension / max(image.size)
                    new_size = tuple(int(dim * ratio) for dim in image.size)
                    image = image.resize(new_size, Image.Resampling.LANCZOS)
                    logger.info(f"🔄 Resized image to {new_size}")

                return image

            return None

        except Exception as e:
            logger.error(f"❌ Image processing error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None

    def _convert_messages_to_content(self, messages: List[BaseMessage]) -> List:
        """
        ✅ Alternative: Content API format (for generate_content)

        Currently not used, but kept for reference
        """
        content_parts = []

        for msg in messages:
            content = msg.content

            if isinstance(content, list):
                for item in content:
                    if item["type"] == "text":
                        content_parts.append(item["text"])
                    elif item["type"] == "image_url":
                        image_url = item["image_url"]["url"]
                        image_obj = self._process_image_url(image_url)
                        if image_obj:
                            content_parts.append(image_obj)

            elif isinstance(content, str):
                if msg.type == "system":
                    content_parts.append(f"[System Instructions]\n{content}")
                else:
                    content_parts.append(content)

        return content_parts
