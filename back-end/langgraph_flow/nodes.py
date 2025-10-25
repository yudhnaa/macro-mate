import re
import traceback

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from langgraph_flow.state import GraphState
from models.factory import ModelFactory
from prompt import image_advisor_prompt, text_advisor_prompt, vision_extract_prompt
from prompt.advisor_prompt import get_image_advisor_prompt_v2
from prompt.vision_prompt_v2 import get_component_detection_prompt
from schema.food_components import ComponentDetectionResult
from schema.recognition_food import RecognitionWithSafety
from services.usda_service import get_usda_service
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
    Node 2a: Generate advice dựa trên vision result
    """
    if state.get("error"):
        return state

    try:
        vision_result = state["vision_result"]
        user_profile = state["user_profile"]

        # Format ingredients
        ingredients_str = (
            "\n".join(
                [
                    f"  • {ing.name}: {ing.estimated_weight}g - "
                    f"Calo: {ing.nutrition.calories if ing.nutrition else 'N/A'}, "
                    f"Protein: {ing.nutrition.protein if ing.nutrition else 'N/A'}g"
                    for ing in (vision_result.ingredients or [])
                ]
            )
            or "  Không có thông tin chi tiết"
        )

        # Build chain
        prompt = image_advisor_prompt.get_image_advisor_prompt()
        chain = prompt | llm

        # Invoke - trả về AIMessage (có thể stream)
        response = chain.invoke(
            {
                "dish_name": vision_result.dish_name or "Không xác định",
                "calories": vision_result.total_estimated_calories or "N/A",
                "ingredients": ingredients_str,
                "age": user_profile.get("age", "N/A"),
                "weight": user_profile.get("weight", "N/A"),
                "bmi": user_profile.get("bmi", "N/A"),
                "bodyShape": user_profile.get("bodyShape", "bình thường"),
                "description": user_profile.get("description", "Duy trì sức khỏe"),
                "health_conditions": user_profile.get("health_conditions")
                or "Không có",
                "additional_query": (
                    f"\n{state.get('user_query', '')}"
                    if state.get("user_query")
                    else ""
                ),
                "messages": state["messages"],
            }
        )

        return {"messages": [response]}

    except Exception as e:
        import traceback

        logger.error(f"text_advisor_node error: {traceback.format_exc()}")
        return {"messages": [AIMessage(content=f"Lỗi: {str(e)}")]}


async def vision_node_v2(state: GraphState) -> GraphState:
    """
    🔄 V2: Component detection ONLY (no nutrition calculation)
    
    Input: state["image_url"] (base64 data URI or URL)
    Output: state["component_detection"]
    """
    try:
        parser = PydanticOutputParser(pydantic_object=ComponentDetectionResult)
        format_instructions = parser.get_format_instructions().replace("```json", "").replace("```", "")
        
        vision_prompt = get_component_detection_prompt(format_instructions)
        prompt_text = vision_prompt.format(
            query="Phân tích các thành phần có trong món ăn. CHỈ detect components, KHÔNG tính nutrition."
        )
        
        # Multimodal message
        message = HumanMessage(content=[
            {"type": "text", "text": prompt_text},
            {"type": "image_url", "image_url": {"url": state["image_url"]}}
        ])
        
        logger.info("🚀 Calling Gemini VLM for component detection...")
        
        # Call Gemini
        raw_response = vlm.invoke([message])
        raw_text = raw_response.content if hasattr(raw_response, 'content') else str(raw_response)
        raw_text = re.sub(r"```json\s*|\s*```", "", raw_text).strip()
        
        # Parse result
        try:
            result: ComponentDetectionResult = parser.parse(raw_text)
        except OutputParserException:
            # Self-healing
            fix_prompt = f"""Fix this malformed JSON to match schema:
            {format_instructions}
            
            Malformed JSON:
            {raw_text}
            
            Return ONLY valid JSON, no explanation."""
            
            fixed = vlm.invoke([HumanMessage(content=fix_prompt)])
            fixed_text = re.sub(r"```json\s*|\s*```", "", 
                              fixed.content if hasattr(fixed, 'content') else str(fixed)).strip()
            result = parser.parse(fixed_text)
        
        # Safety check
        if not result.is_food or not result.is_safe or result.safety_confidence < 0.7:
            state["error"] = result.warnings or "Không thể phân tích ảnh này"
            return state
        
        # Store result
        state["component_detection"] = result
        logger.info(f"✅ Detected {len(result.components)} components")
        
        return state
        
    except Exception as e:
        logger.error(f"vision_node_v2 error: {traceback.format_exc()}")
        state["error"] = f"Lỗi phân tích ảnh: {str(e)}"
        return state

async def image_advisor_node_v2(state: GraphState) -> GraphState:
    """
    ✅ FIXED: Image advisor with proper variable mapping
    
    Called AFTER nutrition_lookup completes
    """
    try:
        logger.info("🤖 Image advisor V2: Generating nutrition advice...")
        
        # Get data from state
        component_detection = state.get("component_detection")
        enriched_components = state.get("enriched_components", [])
        nutrition_totals = state.get("nutrition_totals", {})
        user_profile = state.get("user_profile", {})
        
        # ✅ FIXED: Format ingredients from enriched_components
        ingredients_str = "Không có thông tin"
        if enriched_components:
            ingredients_list = []
            for item in enriched_components:
                comp = item.get("component", {})
                nutrition = item.get("scaled_nutrition", {})
                
                ingredients_list.append(
                    f"  • {comp.get('name_vi', 'N/A')}: "
                    f"{comp.get('estimated_weight', 0)}g - "
                    f"Calo: {nutrition.get('calories', 0):.0f} kcal"
                )
            
            ingredients_str = "\n".join(ingredients_list)
        
        # ✅ FIXED: Provide ALL required variables
        advisor_input = {
            "age": user_profile.get("age", "N/A"),
            "weight": user_profile.get("weight", "N/A"),
            "bmi": user_profile.get("bmi", "N/A"),
            "bodyShape": user_profile.get("bodyShape", "bình thường"),
            "description": user_profile.get("description", "Duy trì sức khỏe"),
            "health_conditions": user_profile.get("health_conditions") or "Không có",
            
            # ✅ NEW: Missing variables
            "dish_name": component_detection.dish_name if component_detection else "Món ăn",
            "calories": nutrition_totals.get("calories", 0),
            "ingredients": ingredients_str,
            "additional_query": state.get("user_query", ""),
            
            "messages": state.get("messages", []),
        }
        
        # Get prompt and generate
        prompt = image_advisor_prompt.get_image_advisor_prompt()
        llm = ModelFactory.create_llm()
        chain = prompt | llm
        
        response = await chain.ainvoke(advisor_input)
        advice_text = response.content if hasattr(response, "content") else str(response)
        
        # Update state
        messages = list(state.get("messages", []))
        messages.append(AIMessage(content=advice_text))
        
        logger.info("✅ Image advisor V2 complete")
        
        return {
            **state,
            "messages": messages,
        }
        
    except Exception as e:
        logger.error(f"❌ Image advisor V2 error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {**state, "error": f"Lỗi tư vấn: {str(e)}"}


async def nutrition_lookup_node(state: GraphState) -> GraphState:
    """
    🔥 NEW: Real USDA API calls for nutrition data
    
    Input: state["component_detection"]
    Output: state["enriched_components"], state["nutrition_totals"], state["data_quality"]
    """
    try:
        detection: ComponentDetectionResult = state.get("component_detection")
        
        if not detection or not detection.components:
            state["error"] = "No components detected"
            return state
        
        # Get USDA service
        usda_service = get_usda_service()
        
        logger.info(f"🔍 USDA lookup: {len(detection.components)} components")
        
        # Prepare for batch search
        components_data = [
            {
                "name_en": comp.name_en,
                "cooking_method": comp.cooking_method,
                "estimated_weight": comp.estimated_weight,
                "name_vi": comp.name_vi,
                "confidence": comp.confidence
            }
            for comp in detection.components
        ]
        
        # Parallel USDA API calls
        usda_results = await usda_service.batch_search(components_data)
        
        # Enrich components
        enriched = []
        usda_match_count = 0
        
        for comp_data, usda_data in zip(components_data, usda_results):
            if usda_data:
                usda_match_count += 1
                
                # Scale nutrition to portion
                scale_factor = comp_data["estimated_weight"] / 100
                scaled_nutrition = {
                    nutrient: value * scale_factor
                    for nutrient, value in usda_data["nutrients_per_100g"].items()
                }
                
                enriched.append({
                    "component": comp_data,
                    "usda_match": usda_data,
                    "scaled_nutrition": scaled_nutrition,
                    "data_source": "USDA_API",
                    "match_quality": usda_data.get("match_score", 0)
                })
                
                logger.info(
                    f"✅ {comp_data['name_vi']}: {scaled_nutrition['calories']:.0f} kcal "
                    f"(USDA: {usda_data['name']})"
                )
            else:
                logger.warning(f"⚠️ No USDA data: {comp_data['name_vi']}")
                
                enriched.append({
                    "component": comp_data,
                    "usda_match": None,
                    "scaled_nutrition": None,
                    "data_source": "NO_DATA",
                    "match_quality": 0
                })
        
        # Calculate totals
        totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0}
        
        for item in enriched:
            if item["scaled_nutrition"]:
                for nutrient in totals.keys():
                    totals[nutrient] += item["scaled_nutrition"].get(nutrient, 0)
        
        # Data quality
        data_quality = usda_match_count / len(detection.components) if detection.components else 0
        
        # Store results
        state["enriched_components"] = enriched
        state["nutrition_totals"] = totals
        state["data_quality"] = data_quality
        
        logger.info(
            f"✅ Nutrition lookup: {usda_match_count}/{len(detection.components)} matches "
            f"(quality: {data_quality:.0%})"
        )
        
        return state
        
    except Exception as e:
        logger.error(f"❌ nutrition_lookup_node error: {traceback.format_exc()}")
        state["error"] = f"Lỗi tra cứu USDA: {str(e)}"
        return state


def image_advisor_node_v2(state: GraphState) -> GraphState:
    """
    🔄 V2: Generate advice với REAL USDA data
    """
    if state.get("error"):
        return state
    
    try:
        enriched = state.get("enriched_components", [])
        totals = state.get("nutrition_totals", {})
        quality = state.get("data_quality", 0)
        user_profile = state["user_profile"]
        
        # Format components breakdown
        components_lines = []
        
        for item in enriched:
            comp = item["component"]
            
            if item["data_source"] == "USDA_API":
                usda_match = item["usda_match"]
                nutrition = item["scaled_nutrition"]
                
                components_lines.append(
                    f"• **{comp['name_vi']}** ({comp['estimated_weight']:.0f}g):\n"
                    f"  - USDA match: {usda_match['name']}\n"
                    f"  - Match quality: {usda_match['match_score']:.0%}\n"
                    f"  - Calories: {nutrition['calories']:.0f} kcal\n"
                    f"  - Protein: {nutrition['protein']:.1f}g, "
                    f"Carbs: {nutrition['carbs']:.1f}g, "
                    f"Fat: {nutrition['fat']:.1f}g"
                )
            else:
                components_lines.append(
                    f"• **{comp['name_vi']}** ({comp['estimated_weight']:.0f}g):\n"
                    f"  - ⚠️ **KHÔNG TÌM THẤY USDA DATA**\n"
                    f"  - Không tính vào tổng"
                )
        
        components_breakdown = "\n\n".join(components_lines)
        
        # Disclaimers
        disclaimers = []
        
        if quality < 1.0:
            missing = len([i for i in enriched if i["data_source"] == "NO_DATA"])
            disclaimers.append(
                f"⚠️ {missing} thành phần thiếu USDA data - "
                f"có thể thiếu {missing * 50}-{missing * 100} kcal"
            )
        
        if quality < 0.6:
            disclaimers.append("⚠️ Độ tin cậy thấp - nên tham khảo chuyên gia")
        
        if not disclaimers:
            disclaimers.append("✅ Tất cả thành phần có USDA verified data")
        
        # Generate advice
        prompt = get_image_advisor_prompt_v2()
        chain = prompt | llm
        
        response = chain.invoke({
            "dish_name": state["component_detection"].dish_name or "Không xác định",
            "components_breakdown": components_breakdown,
            "total_calories": round(totals.get("calories", 0)),
            "total_protein": round(totals.get("protein", 0), 1),
            "total_carbs": round(totals.get("carbs", 0), 1),
            "total_fat": round(totals.get("fat", 0), 1),
            "total_fiber": round(totals.get("fiber", 0), 1),
            "data_quality_percent": round(quality * 100),
            "data_disclaimers": "\n".join(disclaimers),
            "age": user_profile.get("age", "N/A"),
            "weight": user_profile.get("weight", "N/A"),
            "bmi": user_profile.get("bmi", "N/A"),
            "bodyShape": user_profile.get("bodyShape", "bình thường"),
            "description": user_profile.get("description", "Duy trì sức khỏe"),
            "health_conditions": user_profile.get("health_conditions") or "Không có",
            "additional_query": f"\n{state.get('user_query', '')}" if state.get('user_query') else "",
            "messages": state["messages"]
        })
        
        logger.info("✅ Advice generated with REAL USDA data")
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"image_advisor_node_v2 error: {traceback.format_exc()}")
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
