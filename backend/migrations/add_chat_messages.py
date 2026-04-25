"""
Migration: Add chat_messages table for conversation history
"""

import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'lifebalance.db')

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("Created 'chat_messages' table")

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
            ON chat_messages(user_id)
        """)
        print("Created index on user_id")

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
            ON chat_messages(created_at)
        """)
        print("Created index on created_at")

    except sqlite3.Error as e:
        print(f"Error: {e}")
        raise

    conn.commit()
    conn.close()

    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
