from database.connection import Base
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
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
    direction = relationship("DirectionDB", back_populates="food", cascade="all, delete-orphan")


class DirectionDB(Base):
    __tablename__ = "direction"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, nullable=False)
    direction = Column(Text, nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relationship
    food = relationship("FoodDB", back_populates="direction")
