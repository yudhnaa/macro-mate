from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileBase(BaseModel):
    """Base profile fields that can be updated"""

    full_name: Optional[str] = Field(None, max_length=255, description="Họ và tên")
    age: Optional[int] = Field(None, ge=0, le=150, description="Tuổi")
    gender: Optional[str] = Field(None, description="Giới tính: male, female, other")
    weight: Optional[float] = Field(None, ge=0, le=500, description="Cân nặng (kg)")
    height: Optional[float] = Field(None, ge=0, le=300, description="Chiều cao (cm)")
    body_shape: Optional[str] = Field(
        None, description="Dáng người: gầy, bình thường, mập, béo phì"
    )
    health_conditions: Optional[str] = Field(None, description="Các bệnh lý hiện có")
    fitness_goal: Optional[str] = Field(
        None, description="Mục tiêu: giảm cân, tăng cân, tăng cơ, duy trì sức khỏe"
    )
    dietary_restrictions: Optional[str] = Field(None, description="Hạn chế chế độ ăn")
    allergies: Optional[str] = Field(None, description="Dị ứng thực phẩm")
    activity_level: Optional[str] = Field(
        None,
        description="Mức độ hoạt động: sedentary, light, moderate, active, very_active",
    )


class UserProfileCreate(UserProfileBase):
    """Schema for creating user profile"""

    pass


class UserProfileUpdate(UserProfileBase):
    """Schema for updating user profile - all fields optional"""

    pass


class UserProfile(UserProfileBase):
    """Complete user profile with computed fields"""

    id: int
    email: EmailStr
    username: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    bmi: Optional[float] = Field(None, description="Body Mass Index (tự động tính)")

    model_config = ConfigDict(from_attributes=True)


class User(UserBase):
    id: int
    username: str
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
