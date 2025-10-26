from pydantic import BaseModel, Field
from typing import List, Optional
from schema.nutrition_info import NutritionInfo


class FoodComponent(BaseModel):
    name_vi: str = Field(..., description="Tên tiếng Việt (e.g., 'thịt lợn nướng')")
    name_en: str = Field(..., description="Generic foundation food in English name for USDA foundation food searching (e.g: 'Bread' instead of 'burger bun')")
    estimated_weight: float = Field(..., description="Estimated weight in grams", ge=0)
    cooking_method: Optional[str] = Field(None, description="raw/boiled/fried/grilled/steamed")
    confidence: float = Field(..., description="Detection confidence 0-1", ge=0, le=1)
    estimated_nutrition: Optional[NutritionInfo] = Field(None, description="Gemini's nutrition estimate (fallback when USDA not available)")


class ComponentDetectionResult(BaseModel):
    is_food: bool = Field(..., description="Is this actually food?")
    is_safe: bool = Field(..., description="Safe to eat? (no mold/poison)")
    safety_confidence: float = Field(..., ge=0, le=1)
    warnings: Optional[str] = None

    dish_name: Optional[str] = Field(None, description="Overall dish name")
    components: List[FoodComponent] = Field(default_factory=list)
