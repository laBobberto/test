"""
Migration: Add source and external_id fields to activities table
"""

import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'lifebalance.db')

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add source column
        cursor.execute("""
            ALTER TABLE activities ADD COLUMN source TEXT
        """)
        print("Added 'source' column to activities table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'source' already exists")
        else:
            raise

    try:
        # Add external_id column
        cursor.execute("""
            ALTER TABLE activities ADD COLUMN external_id TEXT
        """)
        print("Added 'external_id' column to activities table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'external_id' already exists")
        else:
            raise

    conn.commit()
    conn.close()

    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
