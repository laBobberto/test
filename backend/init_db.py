from database.connection import Base, engine
from models.models import User, Priority, Activity, Event, Achievement, UserAchievement, Schedule

def init_db():
    """Initialize database with tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def seed_achievements():
    """Seed initial achievements"""
    from database.connection import SessionLocal
    
    db = SessionLocal()
    
    # Check if achievements already exist
    existing = db.query(Achievement).first()
    if existing:
        print("Achievements already seeded")
        db.close()
        return
    
    achievements = [
        Achievement(
            name="Первый шаг",
            description="Завершите первую активность",
            icon="🎯",
            points=10,
            category="general"
        ),
        Achievement(
            name="Культурный гуру",
            description="Посетите 5 культурных событий",
            icon="🎭",
            points=50,
            category="leisure"
        ),
        Achievement(
            name="Спортсмен",
            description="Выполните 10 спортивных активностей",
            icon="💪",
            points=100,
            category="health"
        ),
        Achievement(
            name="Карьерист",
            description="Посетите 3 карьерных мероприятия",
            icon="💼",
            points=75,
            category="career"
        ),
        Achievement(
            name="Неделя баланса",
            description="Соблюдайте баланс приоритетов 7 дней подряд",
            icon="⚖️",
            points=150,
            category="general"
        ),
    ]
    
    for achievement in achievements:
        db.add(achievement)
    
    db.commit()
    print(f"Seeded {len(achievements)} achievements")
    db.close()

if __name__ == "__main__":
    init_db()
    seed_achievements()
