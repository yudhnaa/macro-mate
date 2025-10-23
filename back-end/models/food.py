from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class Direction(BaseModel):
    """Direction step schema"""

    id: int
    order: int
    direction: str
    food_id: int

    model_config = ConfigDict(from_attributes=True)


class FoodBase(BaseModel):
    """Base Food schema"""

    name: str
    raw_id: int
    is_breakfast: bool = False
    is_lunch: bool = False
    is_dinner: bool = False
    is_snack: bool = False
    is_dessert: bool = False
    needs_blender: bool = False
    needs_oven: bool = False
    needs_stove: bool = False
    needs_slow_cooker: bool = False
    needs_toaster: bool = False
    needs_food_processor: bool = False
    needs_microwave: bool = False
    needs_grill: bool = False
    complexity: Optional[int] = None
    cook_time: Optional[float] = None
    prep_time: Optional[float] = None
    wait_time: Optional[float] = None
    total_time: Optional[float] = None
    grams: Optional[float] = None
    grams_per_unit: Optional[float] = None
    default_unit: Optional[str] = None
    unit_amount: Optional[float] = None
    image_url: Optional[str] = None


class FoodCreate(FoodBase):
    """Schema for creating a new food"""

    pass


class FoodUpdate(BaseModel):
    """Schema for updating food - all fields optional"""

    name: Optional[str] = None
    raw_id: Optional[int] = None
    is_breakfast: Optional[bool] = None
    is_lunch: Optional[bool] = None
    is_dinner: Optional[bool] = None
    is_snack: Optional[bool] = None
    is_dessert: Optional[bool] = None
    needs_blender: Optional[bool] = None
    needs_oven: Optional[bool] = None
    needs_stove: Optional[bool] = None
    needs_slow_cooker: Optional[bool] = None
    needs_toaster: Optional[bool] = None
    needs_food_processor: Optional[bool] = None
    needs_microwave: Optional[bool] = None
    needs_grill: Optional[bool] = None
    complexity: Optional[int] = None
    cook_time: Optional[float] = None
    prep_time: Optional[float] = None
    wait_time: Optional[float] = None
    total_time: Optional[float] = None
    grams: Optional[float] = None
    grams_per_unit: Optional[float] = None
    default_unit: Optional[str] = None
    unit_amount: Optional[float] = None
    image_url: Optional[str] = None


class Food(FoodBase):
    """Schema for Food response"""

    id: int
    direction: List[Direction] = []

    model_config = ConfigDict(from_attributes=True)
