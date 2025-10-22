from typing import Dict, List, Optional

from database.models import DirectionDB, FoodDB, UserDB
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
    search: Optional[str] = None
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
            query = query.filter(FoodDB.is_breakfast == True)
        elif meal_type == "lunch":
            query = query.filter(FoodDB.is_lunch == True)
        elif meal_type == "dinner":
            query = query.filter(FoodDB.is_dinner == True)
        elif meal_type == "snack":
            query = query.filter(FoodDB.is_snack == True)
        elif meal_type == "dessert":
            query = query.filter(FoodDB.is_dessert == True)
    
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
            query = query.filter(equipment_map[equipment] == True)
    
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
