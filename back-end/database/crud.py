from datetime import datetime
from typing import Dict, List, Optional

from database.models import (
    AnalysisStatusDB,
    FoodDB,
    MealItemDB,
    MealTypeDB,
    NutritionAnalysisLogDB,
    UserDB,
    UserMealDB,
)
from sqlalchemy.orm import Session, joinedload


def get_user_by_email(db: Session, email: str) -> Optional[UserDB]:
    """Get user by email"""
    return db.query(UserDB).filter(UserDB.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[UserDB]:
    """Get user by ID"""
    return db.query(UserDB).filter(UserDB.id == user_id).first()


def create_user(db: Session, email: str, hashed_password: str) -> UserDB:
    """Create new user - username tự động lấy từ email"""
    username = email.split("@")[0]

    db_user = UserDB(
        email=email, username=username, hashed_password=hashed_password, is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get list of users"""
    return db.query(UserDB).offset(skip).limit(limit).all()


def update_user_profile(
    db: Session, user_id: int, profile_data: Dict
) -> Optional[UserDB]:
    """Update user profile"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    # Update only provided fields
    for key, value in profile_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def create_user_profile(
    db: Session, user_id: int, profile_data: Dict
) -> Optional[UserDB]:
    """Create/Update user profile - alias for update_user_profile"""
    return update_user_profile(db, user_id, profile_data)


# ============= Food CRUD Operations =============


def get_foods(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    meal_type: Optional[str] = None,
    equipment: Optional[str] = None,
    max_complexity: Optional[int] = None,
    search: Optional[str] = None,
) -> List[FoodDB]:
    """
    Get list of foods with optional filters

    Args:
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        meal_type: Filter by meal type (breakfast, lunch, dinner, snack, dessert)
        equipment: Filter by required equipment
        max_complexity: Filter by maximum complexity level
        search: Search by food name
    """
    query = db.query(FoodDB)

    # Filter by meal type
    if meal_type:
        if meal_type == "breakfast":
            query = query.filter(FoodDB.is_breakfast)
        elif meal_type == "lunch":
            query = query.filter(FoodDB.is_lunch)
        elif meal_type == "dinner":
            query = query.filter(FoodDB.is_dinner)
        elif meal_type == "snack":
            query = query.filter(FoodDB.is_snack)
        elif meal_type == "dessert":
            query = query.filter(FoodDB.is_dessert)

    # Filter by equipment
    if equipment:
        equipment_map = {
            "blender": FoodDB.needs_blender,
            "oven": FoodDB.needs_oven,
            "stove": FoodDB.needs_stove,
            "slow_cooker": FoodDB.needs_slow_cooker,
            "toaster": FoodDB.needs_toaster,
            "food_processor": FoodDB.needs_food_processor,
            "microwave": FoodDB.needs_microwave,
            "grill": FoodDB.needs_grill,
        }
        if equipment in equipment_map:
            query = query.filter(equipment_map[equipment])

    # Filter by complexity
    if max_complexity is not None:
        query = query.filter(FoodDB.complexity <= max_complexity)

    # Search by name
    if search:
        query = query.filter(FoodDB.name.ilike(f"%{search}%"))

    # Eager load directions and order them by 'order' field
    query = query.options(joinedload(FoodDB.direction))

    return query.offset(skip).limit(limit).all()


def get_food_by_id(db: Session, food_id: int) -> Optional[FoodDB]:
    """Get food by ID with directions"""
    return (
        db.query(FoodDB)
        .options(joinedload(FoodDB.direction))
        .filter(FoodDB.id == food_id)
        .first()
    )


def get_food_by_raw_id(db: Session, raw_id: int) -> Optional[FoodDB]:
    """Get food by raw_id"""
    return db.query(FoodDB).filter(FoodDB.raw_id == raw_id).first()


def create_food(db: Session, food_data: Dict) -> FoodDB:
    """Create new food"""
    db_food = FoodDB(**food_data)
    db.add(db_food)
    db.commit()
    db.refresh(db_food)
    return db_food


def update_food(db: Session, food_id: int, food_data: Dict) -> Optional[FoodDB]:
    """Update food"""
    food = get_food_by_id(db, food_id)
    if not food:
        return None

    # Update only provided fields
    for key, value in food_data.items():
        if hasattr(food, key) and value is not None:
            setattr(food, key, value)

    db.commit()
    db.refresh(food)
    return food


def delete_food(db: Session, food_id: int) -> bool:
    """Delete food"""
    food = get_food_by_id(db, food_id)
    if not food:
        return False

    db.delete(food)
    db.commit()
    return True


# ============= User Meal CRUD Operations =============


def create_user_meal(
    db: Session,
    user_id: int,
    image_url: str,
    meal_type: MealTypeDB = MealTypeDB.SNACK,
    meal_name: Optional[str] = None,
    meal_time: Optional[datetime] = None,
) -> UserMealDB:
    """
    Create a new user meal record

    Args:
        db: Database session
        user_id: User ID
        image_url: URL of the uploaded image
        meal_type: Type of meal (breakfast, lunch, dinner, snack)
        meal_name: Optional name of the meal
        meal_time: Optional datetime of the meal;\
            defaults to current time if not provided
    """
    db_meal = UserMealDB(
        user_id=user_id,
        image_url=image_url,
        meal_type=meal_type,
        meal_time=meal_time,
        meal_name=meal_name,
        analysis_status=AnalysisStatusDB.PENDING,
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal


def update_meal_analysis(
    db: Session,
    meal_id: int,
    analysis_data: Dict,
    model_name: Optional[str] = None,
) -> Optional[UserMealDB]:
    """
    Update meal with analysis results

    Args:
        db: Database session
        meal_id: Meal ID
        analysis_data: Analysis result containing dish_name, ingredients, etc.
        model_name: Name of the model used for analysis
    """
    meal = db.query(UserMealDB).filter(UserMealDB.id == meal_id).first()
    if not meal:
        return None

    # Update meal name if available
    if "dish_name" in analysis_data and analysis_data["dish_name"]:
        meal.meal_name = analysis_data["dish_name"]

    # Calculate total nutrition from ingredients
    total_calories = 0.0
    total_protein = 0.0
    total_fat = 0.0
    total_carbs = 0.0
    total_fiber = 0.0
    total_sodium = 0.0

    ingredients = analysis_data.get("ingredients", [])

    # Create meal items from ingredients
    for ingredient in ingredients:
        nutrition = ingredient.get("nutrition", {})

        # Add to totals
        total_calories += nutrition.get("calories", 0) or 0
        total_protein += nutrition.get("protein", 0) or 0
        total_fat += nutrition.get("fat", 0) or 0
        total_carbs += nutrition.get("carbs", 0) or 0
        total_fiber += nutrition.get("fiber", 0) or 0
        total_sodium += nutrition.get("sodium", 0) or 0

        # Create meal item
        meal_item = MealItemDB(
            meal_id=meal_id,
            name=ingredient.get("name"),
            estimated_weight=ingredient.get("estimated_weight"),
            calories=nutrition.get("calories"),
            protein=nutrition.get("protein"),
            fat=nutrition.get("fat"),
            carbs=nutrition.get("carbs"),
            fiber=nutrition.get("fiber"),
            sodium=nutrition.get("sodium"),
            nutrition_json=nutrition,
        )
        db.add(meal_item)

    # Update meal totals
    meal.total_calories = total_calories
    meal.total_protein = total_protein
    meal.total_fat = total_fat
    meal.total_carbs = total_carbs
    meal.total_fiber = total_fiber
    meal.total_sodium = total_sodium
    meal.analysis_status = AnalysisStatusDB.SUCCESS

    # Create analysis log
    analysis_log = NutritionAnalysisLogDB(
        meal_id=meal_id,
        model_name=model_name,
        raw_response=analysis_data,
        confidence=analysis_data.get("confidence"),
    )
    db.add(analysis_log)

    db.commit()
    db.refresh(meal)
    return meal


def get_user_meal_by_id(db: Session, meal_id: int) -> Optional[UserMealDB]:
    """Get user meal by ID with all related data"""
    return (
        db.query(UserMealDB)
        .options(joinedload(UserMealDB.items))
        .filter(UserMealDB.id == meal_id)
        .first()
    )


def update_meal_image_url(
    db: Session, meal_id: int, image_url: str
) -> Optional[UserMealDB]:
    """
    Update meal's image_url after async Cloudinary upload completes

    Args:
        db: Database session
        meal_id: Meal ID
        image_url: Cloudinary secure_url

    Returns:
        Updated meal record or None if not found
    """
    meal = db.query(UserMealDB).filter(UserMealDB.id == meal_id).first()
    if not meal:
        return None

    meal.image_url = image_url
    db.commit()
    db.refresh(meal)
    return meal


def get_user_meals(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    meal_type: Optional[MealTypeDB] = None,
) -> List[UserMealDB]:
    """
    Get list of user meals

    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        meal_type: Optional filter by meal type
    """
    query = (
        db.query(UserMealDB)
        .options(joinedload(UserMealDB.items))
        .filter(UserMealDB.user_id == user_id)
    )

    if meal_type:
        query = query.filter(UserMealDB.meal_type == meal_type)

    return query.order_by(UserMealDB.meal_time.desc()).offset(skip).limit(limit).all()


def mark_meal_failed(
    db: Session, meal_id: int, error_message: str
) -> Optional[UserMealDB]:
    """Mark meal analysis as failed"""
    meal = db.query(UserMealDB).filter(UserMealDB.id == meal_id).first()
    if not meal:
        return None

    meal.analysis_status = AnalysisStatusDB.FAILED

    # Create analysis log with error
    analysis_log = NutritionAnalysisLogDB(
        meal_id=meal_id,
        raw_response={"error": error_message},
    )
    db.add(analysis_log)

    db.commit()
    db.refresh(meal)
    return meal


def get_user_meals_by_date_range(
    db: Session,
    user_id: int,
    start_date: datetime,
    end_date: datetime,
    meal_type: Optional[MealTypeDB] = None,
) -> List[UserMealDB]:
    """
    Get user meals within a date range

    Args:
        db: Database session
        user_id: User ID
        start_date: Start date (inclusive)
        end_date: End date (inclusive)
        meal_type: Optional filter by meal type

    Returns:
        List of UserMealDB objects with their items loaded
    """
    query = (
        db.query(UserMealDB)
        .options(joinedload(UserMealDB.items))
        .filter(UserMealDB.user_id == user_id)
        .filter(UserMealDB.meal_time >= start_date)
        .filter(UserMealDB.meal_time <= end_date)
        .filter(UserMealDB.analysis_status == AnalysisStatusDB.SUCCESS)
    )

    if meal_type:
        query = query.filter(UserMealDB.meal_type == meal_type)

    return query.order_by(UserMealDB.meal_time.asc()).all()
