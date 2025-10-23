import json
import os
from typing import Any, Iterator, Optional

import requests
from dotenv import load_dotenv
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from models.base.base_vlm import BaseVisionLanguageModel
from utils.logger import setup_logger

logger = setup_logger(__name__)

load_dotenv()

try:
    from openai import OpenAI

    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    logger.warning("openai package not installed. Install with: pip install openai")


class OpenRouterVLM(BaseVisionLanguageModel):
    model_name: str = None
    api_key: str = os.getenv("OPEN_ROUTER_API_KEY", "")
    timeout: int = 60  # Request timeout (seconds)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if HAS_OPENAI:
            self._client = OpenAI(
                base_url="https://openrouter.ai/api/v1", api_key=self.api_key
            )
        else:
            self._client = None

    @property
    def _llm_type(self) -> str:
        return "openrouter-vlm"

    @property
    def provider_name(self) -> str:
        return "openrouter"

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        headers = self._build_headers()

        def normalize_role(role: str) -> str:
            if role == "human":
                return "user"
            if role == "ai":
                return "assistant"
            return role

        def convert_content(content):
            if isinstance(content, str):
                return content

            if isinstance(content, list):
                converted = []
                for part in content:
                    if part.get("type") == "text":
                        converted.append(part)
                    elif part.get("type") == "image":
                        if part.get("source_type") == "url":
                            converted.append(
                                {"type": "image_url", "image_url": {"url": part["url"]}}
                            )
                        elif part.get("source_type") == "base64":
                            mime_type = part.get("mime_type", "image/jpeg")
                            data_url = f"data:{mime_type};base64,{part['data']}"
                            converted.append(
                                {
                                    "type": "image_url",
                                    "image_url": {"url": data_url},
                                }
                            )
                    else:
                        converted.append(part)
                return converted

            return content

        payload = self._build_payload(messages, stream=False, **kwargs)

        logger.info("🔵 Calling OpenRouter API")
        logger.info(f"Model: {self.model_name}")
        logger.info(
            f"Full Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}"
        )

        if self._client and HAS_OPENAI:
            try:
                logger.info("🔵 Using OpenAI SDK client")
                completion = self._client.chat.completions.create(
                    extra_headers={
                        "HTTP-Referer": "http://localhost",
                        "X-Title": "DietAssistant",
                    },
                    model=self.model_name,
                    messages=payload["messages"],
                    timeout=self.timeout,
                )

                content = completion.choices[0].message.content

                # Check if content exists
                if not content:
                    logger.error("❌ No content in response")
                    logger.error(f"Full response: {completion.model_dump_json()}")
                    raise ValueError("No content generated from model")

                logger.info(f"Response (first 500 chars): {content[:500]}")

                return ChatResult(
                    generations=[ChatGeneration(message=AIMessage(content=content))]
                )
            except Exception as e:
                logger.error(f"OpenAI SDK error: {e}")
                # Log full exception details
                import traceback

                logger.error(f"Traceback: {traceback.format_exc()}")
                raise ValueError(f"OpenRouter error: {str(e)}")

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )

            logger.info(f"OpenRouter response status: {response.status_code}")

            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.text}")
                raise ValueError(
                    f"OpenRouter error {response.status_code}: {response.text}"
                )

            data = response.json()
            logger.info(
                f"OpenRouter full response: "
                f"{json.dumps(data, indent=2, ensure_ascii=False)}"
            )

            # Better error handling for missing content
            if "choices" not in data or len(data["choices"]) == 0:
                logger.error("No choices in response")
                raise ValueError("No choices returned from OpenRouter API")

            choice = data["choices"][0]
            if "message" not in choice or "content" not in choice["message"]:
                logger.error(f"No content in choice: {choice}")
                raise ValueError("No content in message from OpenRouter API")

            content = choice["message"]["content"]

            if not content:
                logger.error("Empty content")
                raise ValueError("Empty content returned from model")

            return ChatResult(
                generations=[ChatGeneration(message=AIMessage(content=content))]
            )
        except requests.Timeout:
            logger.error(f"Request timeout after {self.timeout}s")
            raise ValueError(f"Request timeout after {self.timeout}s")
        except requests.RequestException as e:
            logger.error(f"Network error: {e}")
            raise ValueError(f"Network error: {e}")

    def _stream(
        self,
        messages: list[BaseMessage],
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        headers = self._build_headers()
        payload = self._build_payload(messages, stream=False)

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            stream=True,
            timeout=self.timeout,
        )

        buffer = ""
        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue

            line = line.strip()

            if line.startswith(":"):
                continue

            if line.startswith("data: "):
                json_str = line[6:].strip()

                if json_str == "[DONE]":
                    logger.info("Stream completed")
                    break

                buffer += json_str

                try:
                    chunk_data = json.loads(buffer)
                    buffer = ""

                    if "choices" in chunk_data and len(chunk_data["choices"]) > 0:
                        delta = chunk_data["choices"][0].get("delta", {})
                        content = delta.get("content", "")

                        if content:
                            chunk = ChatGenerationChunk(
                                message=AIMessageChunk(content=content)
                            )

                            if run_manager:
                                run_manager.on_llm_new_token(content)

                            yield chunk

                except json.JSONDecodeError:
                    continue

    def _build_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "DietAssistant",
        }

    def _build_payload(self, messages, stream=False, **kwargs) -> dict:
        def normalize_role(role: str) -> str:
            if role == "human":
                return "user"
            if role == "ai":
                return "assistant"
            return role

        def convert_content(content):
            if isinstance(content, str):
                return content

            if isinstance(content, list):
                converted = []
                for part in content:
                    if part.get("type") == "text":
                        converted.append(part)
                    # Xử lý định dạng image từ LangChain
                    elif part.get("type") == "image_url":
                        converted.append(part)
                    elif (
                        part.get("type") == "image"
                    ):  # Đây là định dạng bạn dùng trong vision_node
                        if part.get("source_type") == "url":
                            converted.append(
                                {"type": "image_url", "image_url": {"url": part["url"]}}
                            )
                        elif part.get("source_type") == "base64":
                            mime_type = part.get("mime_type", "image/jpeg")
                            data_url = f"data:{mime_type};base64,{part['data']}"
                            converted.append(
                                {
                                    "type": "image_url",
                                    "image_url": {"url": data_url},
                                }
                            )
                    else:
                        converted.append(part)
                return converted

            return content

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": normalize_role(m.type), "content": convert_content(m.content)}
                for m in messages
            ],
        }

        if stream:
            payload["stream"] = True

        # Lấy temperature và max_tokens từ instance hoặc kwargs
        temperature = kwargs.get("temperature", self.temperature)
        max_tokens = kwargs.get("max_tokens", self.max_tokens)

        if temperature is not None:
            payload["temperature"] = temperature

        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        return payload
