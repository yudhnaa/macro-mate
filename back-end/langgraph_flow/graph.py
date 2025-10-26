from typing import Literal

from langgraph.graph import END, StateGraph
from langgraph_flow.nodes import (
    image_advisor_node,
    router_node,
    text_advisor_node,
)
from langgraph_flow.state import GraphState
from utils.logger import setup_logger

logger = setup_logger(__name__)


def route_after_router(state: GraphState) -> Literal["image_advisor", "text_advisor"]:
    """Conditional edge: có ảnh → image_advisor (LLM xử lý ảnh trực tiếp), không → text_advisor"""
    return "image_advisor" if state["has_image"] else "text_advisor"


def build_workflow() -> StateGraph:
    workflow = StateGraph(GraphState)

    workflow.add_node("router", router_node)
    workflow.add_node("image_advisor", image_advisor_node)
    workflow.add_node("text_advisor", text_advisor_node)

    # Set entry point
    workflow.set_entry_point("router")

    # Add conditional edges - router quyết định đi image hay text advisor
    workflow.add_conditional_edges(
        "router",
        route_after_router,
        {"image_advisor": "image_advisor", "text_advisor": "text_advisor"},
    )

    workflow.add_edge("image_advisor", END)
    workflow.add_edge("text_advisor", END)

    return workflow
