# import asyncio
# from contextlib import asynccontextmanager
# from typing import Any, AsyncIterator, Dict

# from database.checkpointer import get_async_checkpointer
# from langchain_core.messages import AIMessage, HumanMessage
# from langgraph_flow.graph import build_workflow
# from langgraph_flow.nodes import vision_node
# from langgraph_flow.state import GraphState
# from models.factory import ModelFactory
# from prompt.image_advisor_prompt import get_image_advisor_prompt
# from prompt.text_advisor_prompt import get_text_advisor_prompt
# from schema.recognition_food import RecognitionWithSafety
# from services.user_service import UserProfileService
# from utils.logger import setup_logger
# from utils.redis_client import RedisCache

# logger = setup_logger(__name__)


# class WorkflowService:
#     def __init__(self):
#         self._workflow = build_workflow()
#         self._compiled_graph = None
#         self.reasoning_model = ModelFactory.create_llm()
#         self._locks = {}

#     @asynccontextmanager
#     async def _thread_lock(self, thread_id: str):
#         if thread_id not in self._locks:
#             self._locks[thread_id] = asyncio.Lock()

#         async with self._locks[thread_id]:
#             yield

#     async def _get_graph(self):
#         if self._compiled_graph is None:
#             logger.info("Compiling graph with async checkpointer...")
#             checkpointer = await get_async_checkpointer()

#             if checkpointer is None:
#                 logger.warning("No checkpointer - compiling without memory")
#                 self._compiled_graph = self._workflow.compile()
#             else:
#                 logger.info("Async checkpointer ready")
#                 self._compiled_graph = self._workflow.compile(checkpointer=checkpointer)
#         return self._compiled_graph

#     async def process_request_stream(
#         self,
#         thread_id: str,
#         image_url: str,
#         user_query: str,
#         user_profile: Dict[str, Any],
#     ) -> AsyncIterator[Dict[str, Any]]:
#         async with self._thread_lock(thread_id):
#             try:
#                 graph = await self._get_graph()

#                 config = {"configurable": {"thread_id": thread_id}}

#                 initial_state: GraphState = {
#                     "messages": [HumanMessage(content=user_query)],
#                     "image_url": image_url,
#                     "user_query": user_query,
#                     "user_profile": user_profile,
#                     "has_image": False,
#                     "vision_result": None,
#                     "error": None,
#                 }

#                 yield {
#                     "type": "progress",
#                     "step": "processing",
#                     "message": "Đang xử lý yêu cầu...",
#                 }

#                 final_state = initial_state.copy()
#                 vision_emitted = False

#                 async for event in graph.astream(
#                     initial_state, config, stream_mode="updates"
#                 ):
#                     for node_name, state_update in event.items():
#                         if node_name == "vision" and not vision_emitted:
#                             if state_update.get("error"):
#                                 yield {
#                                     "type": "error",
#                                     "content": state_update["error"],
#                                 }
#                                 return

#                             if state_update.get("vision_result"):
#                                 yield {
#                                     "type": "progress",
#                                     "step": "vision_analyzing",
#                                     "message": "Đang phân tích hình ảnh...",
#                                 }

#                                 vr = state_update["vision_result"]
#                                 yield {
#                                     "type": "vision_complete",
#                                     "data": {
#                                         "dish_name": vr.dish_name,
#                                         "calories": vr.total_estimated_calories,
#                                         "confidence": getattr(
#                                             vr.safety, "confidence", 0
#                                         ),
#                                     },
#                                 }
#                                 vision_emitted = True
#                         final_state.update(state_update)

#                 yield {
#                     "type": "progress",
#                     "step": "advisor_thinking",
#                     "message": "Đang phân tích dinh dưỡng...",
#                 }
#                 yield {"type": "advisor_start"}

#                 if final_state:
#                     advisor_input = self._prepare_advisor_input(final_state)

#                     if final_state.get("has_image"):
#                         prompt = get_image_advisor_prompt()
#                     else:
#                         prompt = get_text_advisor_prompt()

#                     chain = prompt | self.reasoning_model

#                     full_response = ""
#                     async for chunk in chain.astream(advisor_input):
#                         content = (
#                             chunk.content if hasattr(chunk, "content") else str(chunk)
#                         )

#                         if content:
#                             full_response += content
#                             yield {"type": "token", "content": content}
#                             await asyncio.sleep(0.01)

#                     try:
#                         current_state = await graph.aget_state(config)
#                         messages = list(current_state.values.get("messages", []))

#                         if messages and isinstance(messages[-1], AIMessage):
#                             messages[-1] = AIMessage(content=full_response)
#                         else:
#                             messages.append(AIMessage(content=full_response))

#                         node_name = (
#                             "image_advisor"
#                             if final_state.get("has_image")
#                             else "text_advisor"
#                         )
#                         await graph.aupdate_state(
#                             config, {"messages": messages}, as_node=node_name
#                         )
#                         logger.info("Streamed response saved to checkpoint")
#                     except Exception as e:
#                         logger.warning(f"Failed to update state: {e}")
#                 else:
#                     yield {"type": "error", "content": "Invalid final state"}
#                     return
#                 yield {"type": "complete"}
#             except Exception as e:
#                 import traceback

#                 logger.error(f"Stream error: {e}\n{traceback.format_exc()}")
#                 yield {
#                     "type": "error",
#                     "content": str(e),
#                     "detail": traceback.format_exc(),
#                 }

#     def _prepare_advisor_input(self, state: GraphState) -> Dict[str, Any]:
#         """Helper: Prepare input dict cho advisor prompt"""
#         user_profile = state["user_profile"]

#         common_input = {
#             "age": user_profile.get("age", "N/A"),
#             "weight": user_profile.get("weight", "N/A"),
#             "bmi": user_profile.get("bmi", "N/A"),
#             "bodyShape": user_profile.get("bodyShape", "bình thường"),
#             "description": user_profile.get("description", "Duy trì sức khỏe"),
#             "health_conditions": user_profile.get("health_conditions") or "Không có",
#             "messages": state.get("messages", []),
#         }

#         if state.get("has_image") and state.get("vision_result"):
#             vision_result = state["vision_result"]
#             ingredients_str = (
#                 "\n".join(
#                     [
#                         f"  • {ing.name}: {ing.estimated_weight}g - "
#                         f"Calo: {ing.nutrition.calories if ing.nutrition else 'N/A'}"
#                         for ing in (vision_result.ingredients or [])
#                     ]
#                 )
#                 or "  Không có thông tin"
#             )

#             return {
#                 **common_input,
#                 "dish_name": vision_result.dish_name or "Không xác định",
#                 "calories": vision_result.total_estimated_calories or "N/A",
#                 "ingredients": ingredients_str,
#                 "additional_query": (
#                     f"\n{state.get('user_query', '')}"
#                     if state.get("user_query")
#                     else ""
#                 ),
#             }
#         else:
#             return {**common_input, "user_query": state.get("user_query", "")}

#     async def analyze_image(self, img_url: str) -> RecognitionWithSafety:
#         try:
#             logger.info(f"Starting image analysis for {img_url}")
#             initial_state: GraphState = {
#                 "messages": [],
#                 "image_url": img_url,
#                 "user_query": "Phân tích món ăn trong ảnh",
#                 "user_profile": {},  # Không cần profile cho vision
#                 "has_image": True,
#                 "vision_result": None,
#                 "error": None,
#             }

#             result_state = vision_node(initial_state)

#             if result_state.get("error"):
#                 logger.error(f"Image analysis error: {result_state['error']}")
#                 raise Exception(result_state["error"])
#             vision_result = result_state.get("vision_result")

#             if not vision_result:
#                 raise ValueError("Vision analys not return the result")

#             logger.info(f"Vision analyst succesful {vision_result.dish_name}")
#             return vision_result
#         except Exception:
#             logger.error("analyze image failed")
#             raise


# _service_instance = None


# def get_profile_service() -> UserProfileService:
#     """Dependency injection"""
#     global _service_instance
#     if _service_instance is None:
#         redis_client = RedisCache()
#         _service_instance = UserProfileService(redis_client)
#     return _service_instance

import asyncio
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Dict

from database.checkpointer import get_async_checkpointer
from langchain_core.messages import AIMessage, HumanMessage
from langgraph_flow.graph import build_workflow
from langgraph_flow.nodes import vision_node, vision_node_v2, nutrition_lookup_node
from langgraph_flow.state import GraphState
from models.factory import ModelFactory
from prompt.image_advisor_prompt import get_image_advisor_prompt
from prompt.text_advisor_prompt import get_text_advisor_prompt
from schema.recognition_food import RecognitionWithSafety
from schema.food_components import ComponentDetectionResult
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
        """
        ✅ FIXED: Handle V2 workflow with proper variable mapping
        """
        async with self._thread_lock(thread_id):
            try:
                graph = await self._get_graph()
                config = {"configurable": {"thread_id": thread_id}}

                initial_state: GraphState = {
                    "messages": [HumanMessage(content=user_query)],
                    "image_url": image_url,
                    "user_query": user_query,
                    "user_profile": user_profile,
                    "has_image": bool(image_url),
                    "component_detection": None,
                    "enriched_components": None,
                    "nutrition_totals": None,
                    "data_quality": None,
                    "vision_result": None,
                    "error": None,
                }

                yield {
                    "type": "progress",
                    "step": "processing",
                    "message": "Đang xử lý yêu cầu...",
                }

                # Track state for advisor
                final_state = None
                vision_emitted = False
                nutrition_emitted = False

                async for event in graph.astream(
                    initial_state, config, stream_mode="updates"
                ):
                    for node_name, state_update in event.items():
                        logger.info(f"📍 Node: {node_name}")
                        
                        # Store final state
                        final_state = state_update
                        
                        # Router
                        if node_name == "router":
                            yield {
                                "type": "progress",
                                "step": "routing",
                                "message": "Đang phân tích yêu cầu...",
                            }
                        
                        # Vision
                        elif node_name == "vision" and not vision_emitted:
                            if state_update.get("error"):
                                yield {"type": "error", "content": state_update["error"]}
                                return

                            if state_update.get("component_detection"):
                                detection = state_update["component_detection"]
                                yield {
                                    "type": "progress",
                                    "step": "vision_analyzing",
                                    "message": "Đã phát hiện thành phần...",
                                }
                                yield {
                                    "type": "vision_complete",
                                    "data": {
                                        "dish_name": detection.dish_name,
                                        "component_count": len(detection.components),
                                        "confidence": detection.safety_confidence,
                                    },
                                }
                                vision_emitted = True
                        
                        # Nutrition lookup
                        elif node_name == "nutrition_lookup" and not nutrition_emitted:
                            if state_update.get("error"):
                                yield {"type": "error", "content": state_update["error"]}
                                return
                            
                            if state_update.get("nutrition_totals"):
                                totals = state_update["nutrition_totals"]
                                quality = state_update.get("data_quality", 0)
                                
                                yield {
                                    "type": "progress",
                                    "step": "nutrition_complete",
                                    "message": f"Đã tra cứu dinh dưỡng (độ tin cậy: {quality:.0%})",
                                }
                                yield {
                                    "type": "nutrition_complete",
                                    "data": {
                                        "calories": round(totals.get("calories", 0)),
                                        "protein": round(totals.get("protein", 0), 1),
                                        "carbs": round(totals.get("carbs", 0), 1),
                                        "fat": round(totals.get("fat", 0), 1),
                                        "data_quality": round(quality * 100),
                                    },
                                }
                                nutrition_emitted = True
                        
                        # Image advisor (don't handle here, let node handle it)
                        elif node_name == "image_advisor":
                            # ✅ Node handles advisor internally
                            # Just emit progress
                            yield {
                                "type": "progress",
                                "step": "advisor_complete",
                                "message": "Tư vấn hoàn tất",
                            }
                        
                        # Text advisor
                        elif node_name == "text_advisor":
                            yield {
                                "type": "progress",
                                "step": "advisor_complete",
                                "message": "Tư vấn hoàn tất",
                            }

                # ✅ FIXED: Stream advisor response AFTER graph completes
                if final_state:
                    yield {"type": "advisor_start"}
                    
                    # Get last AI message from state
                    messages = final_state.get("messages", [])
                    
                    if messages:
                        last_message = messages[-1]
                        
                        if isinstance(last_message, AIMessage):
                            # Stream character by character
                            for char in last_message.content:
                                yield {"type": "token", "content": char}
                                await asyncio.sleep(0.01)

                yield {"type": "complete"}
                
            except Exception as e:
                import traceback
                logger.error(f"Stream error: {e}\n{traceback.format_exc()}")
                yield {
                    "type": "error",
                    "content": str(e),
                    "detail": traceback.format_exc(),
                }

    async def analyze_image(self, img_url: str) -> ComponentDetectionResult:
        """Legacy image analysis endpoint"""
        try:
            logger.info(f"Starting image analysis for {img_url}")
            
            initial_state: GraphState = {
                "messages": [],
                "image_url": img_url,
                "user_query": "Phân tích món ăn trong ảnh",
                "user_profile": {},
                "has_image": True,
                "component_detection": None,
                "enriched_components": None,
                "nutrition_totals": None,
                "data_quality": None,
                "vision_result": None,
                "error": None,
            }

            analyze_state = await vision_node_v2(initial_state)
            result_state = await nutrition_lookup_node(analyze_state)



            if result_state.get("error"):
                logger.error(f"Image analysis error: {result_state['error']}")
                raise Exception(result_state["error"])
            
            vision_result = result_state.get("component_detection")

            if not vision_result:
                raise ValueError("Vision analysis did not return result")

            logger.info(f"Vision analysis successful: {vision_result.dish_name}")
            return vision_result
            
        except Exception as e:
            logger.error(f"analyze_image failed: {e}")
            raise


_service_instance = None


def get_profile_service() -> UserProfileService:
    """Dependency injection"""
    global _service_instance
    if _service_instance is None:
        redis_client = RedisCache()
        _service_instance = UserProfileService(redis_client)
    return _service_instance
