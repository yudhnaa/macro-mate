from typing import Literal

from distlib import logger
from langgraph.graph import END, StateGraph
from langgraph_flow.nodes import (
    image_advisor_node,
    router_node,
    text_advisor_node,
    vision_node,
)
from langgraph_flow.state import GraphState
from pygments.lexer import words
from routers.auth import login
from utils.logger import setup_logger

logger = setup_logger(__name__)


def route_after_router(state: GraphState) -> Literal["vision", "text_advisor"]:
    """Conditional edge: có ảnh → vision, không → text"""
    return "vision" if state["has_image"] else "text_advisor"


def should_continue_after_vision(state: GraphState) -> Literal["image_advisor", "end"]:
    """Conditional edge: có lỗi vision → dừng, không → advisor"""
    return "end" if state.get("error") else "image_advisor"


def build_workflow() -> StateGraph:
    workflow = StateGraph(GraphState)

    workflow.add_node("router", router_node)
    workflow.add_node("vision", vision_node)
    workflow.add_node("image_advisor", image_advisor_node)
    workflow.add_node("text_advisor", text_advisor_node)

    # Set entry point
    workflow.set_entry_point("router")

    # Add conditional edges
    workflow.add_conditional_edges(
        "router",
        route_after_router,
        {"vision": "vision", "text_advisor": "text_advisor"},
    )

    workflow.add_conditional_edges(
        "vision",
        should_continue_after_vision,
        {"image_advisor": "image_advisor", "end": END},
    )

    workflow.add_edge("image_advisor", END)
    workflow.add_edge("text_advisor", END)

    return workflow
