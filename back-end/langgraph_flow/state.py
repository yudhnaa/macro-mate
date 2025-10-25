from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langgraph.graph import add_messages
from schema.food_components import ComponentDetectionResult
from schema.recognition_food import RecognitionWithSafety


class GraphState(TypedDict):
    """
    State được truyền qua các nodes trong LangGraph
    """

    messages: Annotated[list, add_messages]  # LangGraph sẽ tự động thêm message vào đây
    # Input
    image_url: str
    user_query: str
    user_profile: dict

    # Internal state
    has_image: bool
    vision_result: Optional[RecognitionWithSafety]
    component_detection: Optional[ComponentDetectionResult]

    enriched_components: Optional[List[Dict]]  # 🆕 NEW
    nutrition_totals: Optional[Dict]  # 🆕 NEW
    data_quality: Optional[float]  # 🆕 NEW (0-1)
    # Output
    error: Optional[str]
