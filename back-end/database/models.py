from enum import Enum

from database.connection import Base
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import (
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    # Profile fields
    full_name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    body_shape = Column(String(50), nullable=True)
    health_conditions = Column(Text, nullable=True)
    fitness_goal = Column(String(255), nullable=True)
    dietary_restrictions = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    activity_level = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )


class FoodDB(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    raw_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)

    is_breakfast = Column(Boolean, default=False)
    is_lunch = Column(Boolean, default=False)
    is_dinner = Column(Boolean, default=False)
    is_snack = Column(Boolean, default=False)
    is_dessert = Column(Boolean, default=False)

    needs_blender = Column(Boolean, default=False)
    needs_oven = Column(Boolean, default=False)
    needs_stove = Column(Boolean, default=False)
    needs_slow_cooker = Column(Boolean, default=False)
    needs_toaster = Column(Boolean, default=False)
    needs_food_processor = Column(Boolean, default=False)
    needs_microwave = Column(Boolean, default=False)
    needs_grill = Column(Boolean, default=False)

    complexity = Column(Integer, nullable=True)
    cook_time = Column(String(50), nullable=True)
    prep_time = Column(String(50), nullable=True)
    wait_time = Column(String(50), nullable=True)
    total_time = Column(String(50), nullable=True)

    grams = Column(Float, nullable=True)
    grams_per_unit = Column(Float, nullable=True)
    default_unit = Column(String(50), nullable=True)
    unit_amount = Column(Float, nullable=True)

    image_url = Column(Text, nullable=True)

    # Relationship
    direction = relationship(
        "DirectionDB", back_populates="food", cascade="all, delete-orphan"
    )


class DirectionDB(Base):
    __tablename__ = "direction"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, nullable=False)
    direction = Column(Text, nullable=False)
    food_id = Column(
        Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Relationship
    food = relationship("FoodDB", back_populates="direction")


class MealTypeDB(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class AnalysisStatusDB(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class UserMealDB(Base):
    __tablename__ = "user_meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    meal_name = Column(String(255), nullable=True)
    meal_type = Column(SQLEnum(MealTypeDB, name="meal_type_enum"), nullable=False)
    meal_time = Column(DateTime(timezone=True), server_default=func.now())

    image_url = Column(Text, nullable=True)

    analysis_status = Column(
        SQLEnum(AnalysisStatusDB, name="analysis_status_enum"),
        default=AnalysisStatusDB.PENDING,
        nullable=False,
    )

    total_calories = Column(Float, nullable=True)
    total_protein = Column(Float, nullable=True)
    total_fat = Column(Float, nullable=True)
    total_carbs = Column(Float, nullable=True)
    total_fiber = Column(Float, nullable=True)
    total_sodium = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("UserDB", backref="meals")
    items = relationship(
        "MealItemDB", back_populates="meal", cascade="all, delete-orphan"
    )
    analysis_logs = relationship(
        "NutritionAnalysisLogDB", back_populates="meal", cascade="all, delete-orphan"
    )


class MealItemDB(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(
        Integer,
        ForeignKey("user_meals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=True)
    estimated_weight = Column(Float, nullable=True)

    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)

    nutrition_json = Column(JSON, nullable=True)
    embedding_vector = Column(Vector(3072), nullable=True)

    # Relationships
    meal = relationship("UserMealDB", back_populates="items")


class NutritionEmbeddingDB(Base):
    __tablename__ = "nutrition_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    ref_type = Column(String(50), nullable=False)  # 'food', 'meal', 'ingredient'
    ref_id = Column(Integer, nullable=False, index=True)

    vector = Column(Vector(3072), nullable=True)
    extra_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NutritionAnalysisLogDB(Base):
    __tablename__ = "nutrition_analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(
        Integer,
        ForeignKey("user_meals.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    model_name = Column(String(100), nullable=True)
    raw_response = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    meal = relationship("UserMealDB", back_populates="analysis_logs")
