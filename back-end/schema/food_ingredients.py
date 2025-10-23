from typing import Optional

from pydantic import BaseModel, Field
from schema.nutrition_info import NutritionInfo


class FoodIngredient(BaseModel):
    name: str = Field(
        ..., description="Tên thành phần, ví dụ: thịt gà nướng, rau xà lách"
    )
    estimated_weight: Optional[float] = Field(
        None, description="Khối lượng ước tính (g)"
    )
    nutrition: Optional[NutritionInfo] = Field(
        None, description="Thông tin dinh dưỡng ước tính cho thành phần"
    )
