from typing import Optional

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
