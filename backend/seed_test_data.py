import sys
sys.path.append('.')

from database.connection import SessionLocal
from models.models import User, Priority, Activity, UserAchievement
from datetime import datetime, timedelta
import json

db = SessionLocal()

try:
    # Get test user
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        print("Test user not found!")
        exit(1)
    
    print(f"Found user: {user.username} (ID: {user.id})")
    
    # Create priorities
    print("\nCreating priorities...")
    priorities_data = [
        {"category": "education", "value": 25},
        {"category": "career", "value": 20},
        {"category": "health", "value": 20},
        {"category": "leisure", "value": 15},
        {"category": "social", "value": 10},
        {"category": "household", "value": 10}
    ]
    
    # Delete existing priorities
    db.query(Priority).filter(Priority.user_id == user.id).delete()
    
    for p_data in priorities_data:
        priority = Priority(
            user_id=user.id,
            category=p_data["category"],
            value=p_data["value"]
        )
        db.add(priority)
    
    print(f"Created {len(priorities_data)} priorities")
    
    # Create activities
    print("\nCreating activities...")
    now = datetime.now()
    activities_data = [
        {
            "title": "Лекция по математике",
            "description": "Высшая математика, тема: Интегралы",
            "category": "education",
            "start_time": now.replace(hour=9, minute=0),
            "end_time": now.replace(hour=10, minute=30),
            "location": "ЛЭТИ, ауд. 301",
            "completed": True,
            "points_earned": 50
        },
        {
            "title": "Тренировка в зале",
            "description": "Силовая тренировка",
            "category": "health",
            "start_time": now.replace(hour=18, minute=0),
            "end_time": now.replace(hour=19, minute=30),
            "location": "Фитнес-центр",
            "completed": False,
            "points_earned": 0
        },
        {
            "title": "Встреча с друзьями",
            "description": "Кофе в центре",
            "category": "social",
            "start_time": now.replace(hour=20, minute=0),
            "end_time": now.replace(hour=21, minute=30),
            "location": "Кофейня на Невском",
            "completed": False,
            "points_earned": 0
        }
    ]
    
    # Delete existing activities
    db.query(Activity).filter(Activity.user_id == user.id).delete()
    
    for a_data in activities_data:
        activity = Activity(
            user_id=user.id,
            title=a_data["title"],
            description=a_data["description"],
            category=a_data["category"],
            start_time=a_data["start_time"],
            end_time=a_data["end_time"],
            location=a_data["location"],
            completed=a_data["completed"],
            points_earned=a_data["points_earned"]
        )
        db.add(activity)
    
    print(f"Created {len(activities_data)} activities")
    
    # Update user stats
    print("\nUpdating user stats...")
    user.total_points = 150
    user.current_streak = 3
    user.balance_score = 0.75
    
    db.commit()
    
    print("\n✅ Seed data created successfully!")
    print(f"User: {user.username}")
    print(f"Total points: {user.total_points}")
    print(f"Current streak: {user.current_streak}")
    print(f"Priorities: {len(priorities_data)}")
    print(f"Activities: {len(activities_data)}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
