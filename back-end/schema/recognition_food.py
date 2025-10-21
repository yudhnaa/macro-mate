from typing import List, Optional

from pydantic import BaseModel, Field
from schema.food_ingredients import FoodIngredient
from schema.safety_check import SafetyCheck


class RecognitionWithSafety(BaseModel):
    safety: SafetyCheck
    dish_name: Optional[str] = Field(
        None, description="Tên món ăn nếu và chỉ nếu ảnh là món ăn an toàn"
    )
    total_estimated_calories: Optional[float] = Field(
        None, description="Tổng calo ước tính của món"
    )
    ingredients: List[FoodIngredient] = Field(
        default_factory=list, description="Danh sách thành phần"
    )
