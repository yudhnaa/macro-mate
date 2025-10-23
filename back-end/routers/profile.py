from typing import Optional

from database.connection import get_db
from database.crud import create_user_profile, get_user_by_email
from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserProfile, UserProfileCreate, UserProfileUpdate
from sqlalchemy.orm import Session
from utils.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["User Profile"])


def calculate_bmi(weight: Optional[float], height: Optional[float]) -> Optional[float]:
    """Calculate BMI from weight (kg) and height (cm)"""
    if weight and height and height > 0:
        height_m = height / 100  # Convert cm to meters
        bmi = weight / (height_m**2)
        return round(bmi, 2)
    return None


def add_computed_fields(user_db) -> dict:
    """Add computed fields like BMI to user data"""
    user_dict = {
        "id": user_db.id,
        "email": user_db.email,
        "username": user_db.username,
        "is_active": user_db.is_active,
        "full_name": user_db.full_name,
        "age": user_db.age,
        "gender": user_db.gender,
        "weight": user_db.weight,
        "height": user_db.height,
        "body_shape": user_db.body_shape,
        "health_conditions": user_db.health_conditions,
        "fitness_goal": user_db.fitness_goal,
        "dietary_restrictions": user_db.dietary_restrictions,
        "allergies": user_db.allergies,
        "activity_level": user_db.activity_level,
        "created_at": user_db.created_at,
        "updated_at": user_db.updated_at,
        "bmi": calculate_bmi(user_db.weight, user_db.height),
    }
    return user_dict


@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user_email: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Get current user's profile with computed fields

    Returns:
    - All profile information
    - BMI (automatically calculated from weight and height)
    """
    user = get_user_by_email(db, current_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return add_computed_fields(user)


@router.post("/me", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    profile: UserProfileCreate,
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create/Update user profile

    This endpoint can be used for both creating and updating profile.
    All fields are optional - only provided fields will be updated.

    Body parameters:
    - full_name: Họ và tên
    - age: Tuổi
    - gender: Giới tính (male, female, other)
    - weight: Cân nặng (kg)
    - height: Chiều cao (cm)
    - body_shape: Dáng người (gầy, bình thường, mập, béo phì)
    - health_conditions: Các bệnh lý hiện có
    - fitness_goal: Mục tiêu (giảm cân, tăng cân, tăng cơ, duy trì sức khỏe)
    - dietary_restrictions: Hạn chế chế độ ăn
    - allergies: Dị ứng thực phẩm
    - activity_level: Mức độ hoạt động (sedentary, light, moderate, active, very_active)
    """
    user = get_user_by_email(db, current_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Convert to dict and remove None values
    profile_data = profile.model_dump(exclude_unset=True)

    updated_user = create_user_profile(db, user.id, profile_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create/update profile",
        )

    return add_computed_fields(updated_user)


@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    profile: UserProfileUpdate,
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update user profile

    All fields are optional - only provided fields will be updated.
    This is the same as POST /profile/me but follows REST conventions.

    Body parameters:
    - full_name: Họ và tên
    - age: Tuổi
    - gender: Giới tính (male, female, other)
    - weight: Cân nặng (kg)
    - height: Chiều cao (cm)
    - body_shape: Dáng người (gầy, bình thường, mập, béo phì)
    - health_conditions: Các bệnh lý hiện có
    - fitness_goal: Mục tiêu (giảm cân, tăng cân, tăng cơ, duy trì sức khỏe)
    - dietary_restrictions: Hạn chế chế độ ăn
    - allergies: Dị ứng thực phẩm
    - activity_level: Mức độ hoạt động (sedentary, light, moderate, active, very_active)
    """
    user = get_user_by_email(db, current_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Convert to dict and remove None values
    profile_data = profile.model_dump(exclude_unset=True)

    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )

    updated_user = create_user_profile(db, user.id, profile_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )

    return add_computed_fields(updated_user)


@router.patch("/me", response_model=UserProfile)
async def partial_update_my_profile(
    profile: UserProfileUpdate,
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Partially update user profile (same as PUT but semantically more correct)

    All fields are optional - only provided fields will be updated.
    """
    user = get_user_by_email(db, current_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Convert to dict and remove None values
    profile_data = profile.model_dump(exclude_unset=True)

    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )

    updated_user = create_user_profile(db, user.id, profile_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )

    return add_computed_fields(updated_user)
