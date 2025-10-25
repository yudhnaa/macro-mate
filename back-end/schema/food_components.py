from pydantic import BaseModel, Field
from typing import List, Optional


class FoodComponent(BaseModel):
    name_vi: str = Field(..., description="Tên tiếng Việt (e.g., 'thịt lợn nướng')")
    name_en: str = Field(..., description="Generic English name for USDA (e.g., 'grilled pork')")
    estimated_weight: float = Field(..., description="Estimated weight in grams", ge=0)
    cooking_method: Optional[str] = Field(None, description="raw/boiled/fried/grilled/steamed")
    confidence: float = Field(..., description="Detection confidence 0-1", ge=0, le=1)

class ComponentDetectionResult(BaseModel):
    is_food: bool = Field(..., description="Is this actually food?")
    is_safe: bool = Field(..., description="Safe to eat? (no mold/poison)")
    safety_confidence: float = Field(..., ge=0, le=1)
    warnings: Optional[str] = None

    dish_name: Optional[str] = Field(None, description="Overall dish name")
    components: List[FoodComponent] = Field(default_factory=list)