import sys
sys.path.append('.')

from database.connection import SessionLocal, engine
from models.models import User, Base
from services.auth import get_password_hash
import json

# Create tables
Base.metadata.create_all(bind=engine)

# Create session
db = SessionLocal()

try:
    # Check if user exists
    existing = db.query(User).filter(User.email == "test@example.com").first()
    if existing:
        print("User already exists, deleting...")
        db.delete(existing)
        db.commit()
    
    # Create user
    print("Creating user...")
    hashed_password = get_password_hash("testpass123")
    
    new_user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hashed_password,
        roles=json.dumps(["student", "resident"])
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"User created successfully!")
    print(f"ID: {new_user.id}")
    print(f"Email: {new_user.email}")
    print(f"Username: {new_user.username}")
    print(f"Roles: {new_user.roles}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
