from pydantic import BaseModel
from pydantic import Field
from typing import List, Optional

class NutritionInfo(BaseModel):
    calories: Optional[float] = Field(None, description="Lượng calo ước tính")
    protein: Optional[float] = Field(None, description="Protein (g)")
    fat: Optional[float] = Field(None, description="Chất béo (g)")
    carbs: Optional[float] = Field(None, description="Carbohydrate (g)")
    fiber: Optional[float] = Field(None, description="Chất xơ (g)")
    sodium: Optional[float] = Field(None, description="Natri (mg)")