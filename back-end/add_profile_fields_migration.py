"""
Migration script to add user profile fields to existing users table.

Run this script after updating the database models to add profile columns.

Usage:
    python add_profile_fields_migration.py
"""

from database.connection import SessionLocal, engine
from sqlalchemy import text


def run_migration():
    """Add profile fields to users table"""
    
    migration_sql = """
    -- Add profile fields to users table
    ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS weight FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS height FLOAT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS body_shape VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS health_conditions TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS fitness_goal VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50);
    """
    
    db = SessionLocal()
    try:
        # Execute migration
        for statement in migration_sql.strip().split(';'):
            if statement.strip():
                db.execute(text(statement))
        
        db.commit()
        print("✅ Migration completed successfully!")
        print("   Added profile fields to users table")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting migration: Adding user profile fields...")
    run_migration()
