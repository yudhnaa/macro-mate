from database.connection import Base
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
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
