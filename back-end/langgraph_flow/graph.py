from typing import Literal

from langgraph.graph import END, StateGraph
from langgraph_flow.nodes import (
    image_advisor_node,
    image_advisor_node_v2,
    router_node,
    text_advisor_node,
    vision_node,
    vision_node_v2,
    nutrition_lookup_node,
)
from langgraph_flow.state import GraphState
from utils.logger import setup_logger

logger = setup_logger(__name__)


# def route_after_router(state: GraphState) -> Literal["vision", "text_advisor"]:
#     """Conditional edge: có ảnh → vision, không → text"""
#     return "vision" if state["has_image"] else "text_advisor"


# def should_continue_after_vision(state: GraphState) -> Literal["image_advisor", "end"]:
#     """Conditional edge: có lỗi vision → dừng, không → advisor"""
#     return "end" if state.get("error") else "image_advisor"


# def build_workflow() -> StateGraph:
#     # workflow = StateGraph(GraphState)

#     # workflow.add_node("router", router_node)
#     # workflow.add_node("vision", vision_node)
#     # workflow.add_node("image_advisor", image_advisor_node)
#     # workflow.add_node("text_advisor", text_advisor_node)

#     # # Set entry point
#     # workflow.set_entry_point("router")

#     # # Add conditional edges
#     # workflow.add_conditional_edges(
#     #     "router",
#     #     route_after_router,
#     #     {"vision": "vision", "text_advisor": "text_advisor"},
#     # )

#     # workflow.add_conditional_edges(
#     #     "vision",
#     #     should_continue_after_vision,
#     #     {"image_advisor": "image_advisor", "end": END},
#     # )

#     # workflow.add_edge("image_advisor", END)
#     # workflow.add_edge("text_advisor", END)

#     # return workflow

#     workflow = StateGraph(GraphState)

#     # Add nodes
#     workflow.add_node("router", router_node)
#     workflow.add_node("vision", vision_node_v2)
#     workflow.add_node("nutrition_lookup", nutrition_lookup_node)
#     workflow.add_node("image_advisor", image_advisor_node_v2)
#     workflow.add_node("text_advisor", text_advisor_node)

#     # Entry point
#     workflow.set_entry_point("router")

#     # Conditional edges
#     workflow.add_conditional_edges(
#         "router",
#         route_after_router,
#         {"vision": "vision", "text_advisor": "text_advisor"},
#     )

#     workflow.add_conditional_edges(
#         "vision",
#         should_continue_after_vision,
#         {"nutrition_lookup": "nutrition_lookup", "end": END},
#     )

#     # New edge: nutrition_lookup → image_advisor
#     workflow.add_edge("nutrition_lookup", "image_advisor")
    
#     workflow.add_edge("image_advisor", END)
#     workflow.add_edge("text_advisor", END)
    
#     logger.info("✅ Workflow V2 compiled (Real USDA API integration)")
#     return workflow

def route_after_router(state: GraphState) -> Literal["vision", "text_advisor"]:
    """Has image → vision, no image → text advisor"""
    return "vision" if state["has_image"] else "text_advisor"


def route_after_vision(state: GraphState) -> Literal["nutrition_lookup", "end"]:
    """
    ✅ FIXED: Return values match edge mapping
    
    Vision error → end
    Vision success → nutrition_lookup
    """
    if state.get("error"):
        logger.error(f"Vision error: {state['error']}")
        return "end"
    
    if state.get("component_detection"):
        logger.info("✅ Vision complete → nutrition_lookup")
        return "nutrition_lookup"
    
    logger.warning("No component detection, ending")
    return "end"


def route_after_nutrition(state: GraphState) -> Literal["image_advisor", "end"]:
    """
    ✅ NEW: Route after nutrition lookup
    
    Nutrition error → end
    Nutrition success → image_advisor
    """
    if state.get("error"):
        logger.error(f"Nutrition error: {state['error']}")
        return "end"
    
    if state.get("enriched_components"):
        logger.info("✅ Nutrition complete → image_advisor")
        return "image_advisor"
    
    logger.warning("No enriched components, ending")
    return "end"


def build_workflow() -> StateGraph:
    """
    ✅ FIXED: Correct V2 workflow with proper routing
    
    Flow:
    router → vision_v2 → nutrition_lookup → image_advisor_v2 → END
           ↘ text_advisor → END
    """
    workflow = StateGraph(GraphState)

    # Add nodes
    workflow.add_node("router", router_node)
    workflow.add_node("vision", vision_node_v2)
    workflow.add_node("nutrition_lookup", nutrition_lookup_node)
    workflow.add_node("image_advisor", image_advisor_node_v2)
    workflow.add_node("text_advisor", text_advisor_node)

    # Entry point
    workflow.set_entry_point("router")

    # Router → vision or text_advisor
    workflow.add_conditional_edges(
        "router",
        route_after_router,
        {
            "vision": "vision",
            "text_advisor": "text_advisor"
        },
    )

    # ✅ FIXED: Vision → nutrition_lookup (not image_advisor)
    workflow.add_conditional_edges(
        "vision",
        route_after_vision,
        {
            "nutrition_lookup": "nutrition_lookup",
            "end": END
        },
    )

    # ✅ NEW: Nutrition → image_advisor
    workflow.add_conditional_edges(
        "nutrition_lookup",
        route_after_nutrition,
        {
            "image_advisor": "image_advisor",
            "end": END
        },
    )
    
    # Terminal edges
    workflow.add_edge("image_advisor", END)
    workflow.add_edge("text_advisor", END)
    
    logger.info("✅ Workflow V2 compiled with correct routing")
    return workflow