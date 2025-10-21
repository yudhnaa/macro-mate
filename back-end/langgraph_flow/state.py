from typing import Annotated, TypedDict, Optional
from schema.recognition_food import RecognitionWithSafety
from langgraph.graph import add_messages


class GraphState(TypedDict):
    """
    State được truyền qua các nodes trong LangGraph
    """
    messages: Annotated[list, add_messages] # LangGraph sẽ tự động thêm message vào đây
    # Input
    image_url: str
    user_query: str
    user_profile: dict

    # Internal state
    has_image: bool
    vision_result: Optional[RecognitionWithSafety]

    # Output
    error: Optional[str]

