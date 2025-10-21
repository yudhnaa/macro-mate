import asyncio
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Dict

from database.checkpointer import get_async_checkpointer
from langchain_core.messages import AIMessage, HumanMessage
from langgraph_flow.graph import build_workflow
from langgraph_flow.state import GraphState
from models.factory import ModelFactory
from prompt.image_advisor_prompt import get_image_advisor_prompt
from prompt.text_advisor_prompt import get_text_advisor_prompt
from services.user_service import UserProfileService
from utils.logger import setup_logger
from utils.redis_client import RedisCache

logger = setup_logger(__name__)


class WorkflowService:
    def __init__(self):
        self._workflow = build_workflow()
        self._compiled_graph = None
        self.reasoning_model = ModelFactory.create_llm()
        self._locks = {}

    @asynccontextmanager
    async def _thread_lock(self, thread_id: str):
        if thread_id not in self._locks:
            self._locks[thread_id] = asyncio.Lock()

        async with self._locks[thread_id]:
            yield

    async def _get_graph(self):
        if self._compiled_graph is None:
            logger.info("Compiling graph with async checkpointer...")
            checkpointer = await get_async_checkpointer()

            if checkpointer is None:
                logger.warning("No checkpointer - compiling without memory")
                self._compiled_graph = self._workflow.compile()
            else:
                logger.info("Async checkpointer ready")
                self._compiled_graph = self._workflow.compile(checkpointer=checkpointer)
        return self._compiled_graph

    async def process_request_stream(
        self,
        thread_id: str,
        image_url: str,
        user_query: str,
        user_profile: Dict[str, Any],
    ) -> AsyncIterator[Dict[str, Any]]:
        async with self._thread_lock(thread_id):
            try:
                graph = await self._get_graph()

                config = {"configurable": {"thread_id": thread_id}}

                initial_state: GraphState = {
                    "messages": [HumanMessage(content=user_query)],
                    "image_url": image_url,
                    "user_query": user_query,
                    "user_profile": user_profile,
                    "has_image": False,
                    "vision_result": None,
                    "error": None,
                }

                yield {
                    "type": "progress",
                    "step": "processing",
                    "message": "Đang xử lý yêu cầu...",
                }

                final_state = initial_state.copy()
                vision_emitted = False

                async for event in graph.astream(
                    initial_state, config, stream_mode="updates"
                ):
                    for node_name, state_update in event.items():
                        if node_name == "vision" and not vision_emitted:
                            if state_update.get("error"):
                                yield {
                                    "type": "error",
                                    "content": state_update["error"],
                                }
                                return

                            if state_update.get("vision_result"):
                                yield {
                                    "type": "progress",
                                    "step": "vision_analyzing",
                                    "message": "Đang phân tích hình ảnh...",
                                }

                                vr = state_update["vision_result"]
                                yield {
                                    "type": "vision_complete",
                                    "data": {
                                        "dish_name": vr.dish_name,
                                        "calories": vr.total_estimated_calories,
                                        "confidence": getattr(
                                            vr.safety, "confidence", 0
                                        ),
                                    },
                                }
                                vision_emitted = True
                        final_state.update(state_update)

                yield {
                    "type": "progress",
                    "step": "advisor_thinking",
                    "message": "Đang phân tích dinh dưỡng...",
                }
                yield {"type": "advisor_start"}

                if final_state:
                    advisor_input = self._prepare_advisor_input(final_state)

                    if final_state.get("has_image"):
                        prompt = get_image_advisor_prompt()
                    else:
                        prompt = get_text_advisor_prompt()

                    chain = prompt | self.reasoning_model

                    full_response = ""
                    async for chunk in chain.astream(advisor_input):
                        content = (
                            chunk.content if hasattr(chunk, "content") else str(chunk)
                        )

                        if content:
                            full_response += content
                            yield {"type": "token", "content": content}
                            await asyncio.sleep(0.01)

                    try:
                        current_state = await graph.aget_state(config)
                        messages = list(current_state.values.get("messages", []))

                        if messages and isinstance(messages[-1], AIMessage):
                            messages[-1] = AIMessage(content=full_response)
                        else:
                            messages.append(AIMessage(content=full_response))

                        node_name = (
                            "image_advisor"
                            if final_state.get("has_image")
                            else "text_advisor"
                        )
                        await graph.aupdate_state(
                            config, {"messages": messages}, as_node=node_name
                        )
                        logger.info(f"Streamed response saved to checkpoint")
                    except Exception as e:
                        logger.warning(f"Failed to update state: {e}")
                else:
                    yield {"type": "error", "content": "Invalid final state"}
                    return
                yield {"type": "complete"}
            except Exception as e:
                import traceback

                logger.error(f"Stream error: {e}\n{traceback.format_exc()}")
                yield {
                    "type": "error",
                    "content": str(e),
                    "detail": traceback.format_exc(),
                }

    def _prepare_advisor_input(self, state: GraphState) -> Dict[str, Any]:
        """Helper: Prepare input dict cho advisor prompt"""
        user_profile = state["user_profile"]

        common_input = {
            "age": user_profile.get("age", "N/A"),
            "weight": user_profile.get("weight", "N/A"),
            "bmi": user_profile.get("bmi", "N/A"),
            "bodyShape": user_profile.get("bodyShape", "bình thường"),
            "description": user_profile.get("description", "Duy trì sức khỏe"),
            "health_conditions": user_profile.get("health_conditions") or "Không có",
            "messages": state.get("messages", []),
        }

        if state.get("has_image") and state.get("vision_result"):
            vision_result = state["vision_result"]
            ingredients_str = (
                "\n".join(
                    [
                        f"  • {ing.name}: {ing.estimated_weight}g - "
                        f"Calo: {ing.nutrition.calories if ing.nutrition else 'N/A'}"
                        for ing in (vision_result.ingredients or [])
                    ]
                )
                or "  Không có thông tin"
            )

            return {
                **common_input,
                "dish_name": vision_result.dish_name or "Không xác định",
                "calories": vision_result.total_estimated_calories or "N/A",
                "ingredients": ingredients_str,
                "additional_query": (
                    f"\n{state.get('user_query', '')}"
                    if state.get("user_query")
                    else ""
                ),
            }
        else:
            return {**common_input, "user_query": state.get("user_query", "")}


_service_instance = None


def get_profile_service() -> UserProfileService:
    """Dependency injection"""
    global _service_instance
    if _service_instance is None:
        redis_client = RedisCache()
        _service_instance = UserProfileService(redis_client)
    return _service_instance
