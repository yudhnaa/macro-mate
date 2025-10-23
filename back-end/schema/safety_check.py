from pydantic import BaseModel, Field


class SafetyCheck(BaseModel):
    is_food: bool = Field(
        ...,
        description=(
            "Ảnh có phải là món ăn đã chế biến và an toàn để ăn không? "
            "Nó có phải là một vật thể liên quan đến đồ ăn hay không ?"
        ),
    )
    is_potentially_poisonous: bool = Field(
        ..., description="Có khả năng là lá/hoa/nấm độc hoặc không xác định an toàn"
    )
    confidence: float = Field(..., ge=0, le=1, description="Độ tự tin của nhận diện")
    reason: str = Field(..., description="Lý do ngắn gọn cho quyết định")
