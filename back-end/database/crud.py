from typing import Dict, Optional

from database.models import UserDB
from sqlalchemy.orm import Session


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
