"""
Migration: Add home_address and max_travel_time to users table
"""

import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'lifebalance.db')

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add home_address column
        cursor.execute("""
            ALTER TABLE users ADD COLUMN home_address TEXT
        """)
        print("Added 'home_address' column to users table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'home_address' already exists")
        else:
            raise

    try:
        # Add max_travel_time column
        cursor.execute("""
            ALTER TABLE users ADD COLUMN max_travel_time INTEGER DEFAULT 30
        """)
        print("Added 'max_travel_time' column to users table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'max_travel_time' already exists")
        else:
            raise

    conn.commit()
    conn.close()

    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
