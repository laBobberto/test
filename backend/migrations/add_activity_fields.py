"""Add is_custom, recurrence, updated_at to activities table"""
from sqlalchemy import text
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import engine

def upgrade():
    """Add new columns to activities table"""
    with engine.connect() as conn:
        try:
            # Add is_custom column
            conn.execute(text("""
                ALTER TABLE activities 
                ADD COLUMN is_custom BOOLEAN DEFAULT 1
            """))
            print("Added is_custom column")
        except Exception as e:
            print(f"is_custom column might already exist: {e}")
        
        try:
            # Add recurrence column
            conn.execute(text("""
                ALTER TABLE activities 
                ADD COLUMN recurrence TEXT
            """))
            print("Added recurrence column")
        except Exception as e:
            print(f"recurrence column might already exist: {e}")
        
        try:
            # Add updated_at column
            conn.execute(text("""
                ALTER TABLE activities 
                ADD COLUMN updated_at TIMESTAMP
            """))
            print("Added updated_at column")
        except Exception as e:
            print(f"updated_at column might already exist: {e}")
        
        conn.commit()
        print("\nMigration completed successfully!")

def downgrade():
    """Remove added columns"""
    with engine.connect() as conn:
        # SQLite doesn't support DROP COLUMN easily, so we skip downgrade
        print("SQLite doesn't support DROP COLUMN. Manual migration required for downgrade.")

if __name__ == "__main__":
    print("Running migration: add_activity_fields")
    print("=" * 50)
    upgrade()
