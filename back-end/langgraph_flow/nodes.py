import re

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from langgraph_flow.state import GraphState
from models.factory import ModelFactory
from prompt import image_advisor_prompt, text_advisor_prompt, vision_extract_prompt
from schema.recognition_food import RecognitionWithSafety
from utils.logger import setup_logger

# Factory Method : Gọi mô hình
vlm = ModelFactory.create_vlm()
llm = ModelFactory.create_llm()

logger = setup_logger(__name__)


def router_node(state: GraphState) -> GraphState:
    """
    Node 0: Quyết định workflow path

    Logic: Có image_url hợp lệ → vision path, không → text-only path
    """
    state["has_image"] = bool(state.get("image_url") and state["image_url"].strip())
    return state


def vision_node(state: GraphState):
    try:

        parser = PydanticOutputParser(pydantic_object=RecognitionWithSafety)
        format_instructions = (
            parser.get_format_instructions().replace("```json", "").replace("```", "")
        )

        # Build prompt template
        vision_prompt_template = vision_extract_prompt.get_vision_prompt(
            format_instructions
        )

        # Format the prompt with query
        prompt_text = vision_prompt_template.format(
            query="Phân tích các thành phần có trong món ăn ở trong ảnh này"
        )

        logger.info(f"Vision prompt (first 500 chars): {prompt_text[:500]}")

        # Create multimodal message
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {"type": "image_url", "image_url": {"url": state["image_url"]}},
            ]
        )

        # Invoke vào VLM
        raw = vlm.invoke([message])
        raw_text = raw if isinstance(raw, str) else getattr(raw, "content", str(raw))

        logger.info(f"VLM raw response type: {type(raw)}")
        logger.info(f"VLM raw_text (first 500 chars): {raw_text[:500]}")

        raw_text = re.sub(r"```json\s*|\s*```", "", raw_text).strip()

        try:
            result = parser.parse(raw_text)
        except OutputParserException:
            fix_prompt = f"""
            The following JSON is malformed. Fix it to match this schema:
            {format_instructions}
            Malformed JSON:
            {raw_text}
            Return ONLY the fixed JSON, no explanation, no markdown code blocks.
            """

            fixed_response = llm.invoke([HumanMessage(content=fix_prompt)])
            fixed_text = (
                fixed_response.content
                if hasattr(fixed_response, "content")
                else str(fixed_response)
            )
            fixed_text = re.sub(r"```json\s*|\s*```", "", fixed_text).strip()

            logger.info(f"🔧 Fixed JSON (first 300 chars): {fixed_text[:300]}")
            result = parser.parse(fixed_text)

        state["vision_result"] = result

        # Safety gating
        if (
            not result.safety.is_food
            or result.safety.is_potentially_poisonous
            or result.safety.confidence < 0.7
        ):
            state["error"] = f"{result.safety.reason}"

    except Exception as e:
        import traceback

        logger.error(f"vision_node error: {traceback.format_exc()}")
        state["error"] = f"Lỗi phân tích ảnh: {str(e)}"
    logger.info(f"Vision node completed with state: {state}")
    return state


def image_advisor_node(state: GraphState) -> GraphState:
    """
    Node 2a: LLM xử lý trực tiếp ảnh và sinh text tư vấn (bỏ qua vision node)
    """
    if state.get("error"):
        return state

    try:
        user_profile = state["user_profile"]
        image_url = state.get("image_url")
        user_query = state.get("user_query", "")

        # Build prompt với thông tin user profile
        prompt = image_advisor_prompt.get_image_advisor_prompt()

        # Format input cho prompt - không cần vision_result nữa
        advisor_input = {
            "age": user_profile.get("age", "N/A"),
            "weight": user_profile.get("weight", "N/A"),
            "bmi": user_profile.get("bmi", "N/A"),
            "bodyShape": user_profile.get("bodyShape", "bình thường"),
            "description": user_profile.get("description", "Duy trì sức khỏe"),
            "health_conditions": user_profile.get("health_conditions") or "Không có",
            "user_query": user_query,
            "messages": state["messages"],
        }

        # Format prompt thành text
        formatted_messages = prompt.format_messages(**advisor_input)

        # Tạo multimodal message: text prompt + ảnh
        final_messages = []
        for msg in formatted_messages:
            if hasattr(msg, "content"):
                # System/Human message với text
                final_messages.append(msg)

        # Thêm ảnh vào message cuối cùng (user message)
        if final_messages and image_url:
            last_msg = final_messages[-1]
            # Tạo multimodal content
            multimodal_content = [
                {
                    "type": "text",
                    "text": (
                        last_msg.content
                        if hasattr(last_msg, "content")
                        else str(last_msg)
                    ),
                },
                {"type": "image_url", "image_url": {"url": image_url}},
            ]
            final_messages[-1] = HumanMessage(content=multimodal_content)

        # Invoke LLM với ảnh và text
        response = llm.invoke(final_messages)

        return {"messages": [response]}

    except Exception as e:
        import traceback

        logger.error(f"image_advisor_node error: {traceback.format_exc()}")
        return {"messages": [AIMessage(content=f"Lỗi: {str(e)}")]}


def text_advisor_node(state: GraphState) -> GraphState:
    """
    Node 2b: Text-only Q&A
    """
    try:
        user_profile = state["user_profile"]

        # goal_map = {
        #     "lose_weight": "Giảm cân",
        #     "gain_muscle": "Tăng cơ",
        #     "maintain": "Duy trì",
        #     "diabetic": "Kiểm soát đường huyết"
        # }

        prompt = text_advisor_prompt.get_text_advisor_prompt()
        chain = prompt | llm

        response = chain.invoke(
            {
                "age": user_profile.get("age", "N/A"),
                "weight": user_profile.get("weight", "N/A"),
                "bmi": user_profile.get("bmi", "N/A"),
                "bodyShape": user_profile.get("bodyShape", "bình thường"),
                "description": user_profile.get("description", "Duy trì sức khỏe"),
                "health_conditions": user_profile.get("health_conditions")
                or "Không có",
                "messages": state["messages"],  # ← Chat history
            }
        )

        return {"messages": [response]}

    except Exception as e:
        return {"messages": [AIMessage(content=f"Lỗi: {str(e)}")]}
