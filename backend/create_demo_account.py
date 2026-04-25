"""
Create demo account with full data for screencast demonstration
"""
from datetime import datetime, timedelta
from database.connection import SessionLocal, engine
from models.models import (
    Base, User, Priority, Activity, Achievement, UserAchievement,
    Friendship, UserRating, PointsHistory
)
from services.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def create_demo_data():
    db = SessionLocal()

    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@vpotoke.ru").first()
        if demo_user:
            print("Demo user already exists. Deleting old data...")
            # Delete related data
            db.query(UserAchievement).filter(UserAchievement.user_id == demo_user.id).delete()
            db.query(Activity).filter(Activity.user_id == demo_user.id).delete()
            db.query(Priority).filter(Priority.user_id == demo_user.id).delete()
            db.query(Friendship).filter(
                (Friendship.user_id == demo_user.id) | (Friendship.friend_id == demo_user.id)
            ).delete()
            db.query(UserRating).filter(UserRating.user_id == demo_user.id).delete()
            db.query(PointsHistory).filter(PointsHistory.user_id == demo_user.id).delete()
            db.delete(demo_user)
            db.commit()

        # Delete old friend accounts
        friend_emails = ["anna@vpotoke.ru", "dmitry@vpotoke.ru", "elena@vpotoke.ru",
                        "mikhail@vpotoke.ru", "olga@vpotoke.ru"]
        for email in friend_emails:
            friend = db.query(User).filter(User.email == email).first()
            if friend:
                db.query(UserRating).filter(UserRating.user_id == friend.id).delete()
                db.query(Friendship).filter(
                    (Friendship.user_id == friend.id) | (Friendship.friend_id == friend.id)
                ).delete()
                db.delete(friend)
        db.commit()

        # Create demo user
        demo_user = User(
            email="demo@vpotoke.ru",
            username="Демо Пользователь",
            hashed_password=get_password_hash("demo2026"),
            roles='["student", "resident"]',
            home_address="Санкт-Петербург, Невский проспект, 1",
            max_travel_time=30
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        print(f"✓ Created demo user: {demo_user.email} / demo2026")

        # Create priorities
        priorities = [
            Priority(user_id=demo_user.id, category="education", value=9),
            Priority(user_id=demo_user.id, category="career", value=7),
            Priority(user_id=demo_user.id, category="health", value=8),
            Priority(user_id=demo_user.id, category="leisure", value=6),
            Priority(user_id=demo_user.id, category="social", value=8),
            Priority(user_id=demo_user.id, category="household", value=5),
        ]
        db.add_all(priorities)
        print("✓ Created priorities")

        # Create friends
        friends = []
        friend_names = [
            ("Анна Смирнова", "anna@vpotoke.ru"),
            ("Дмитрий Иванов", "dmitry@vpotoke.ru"),
            ("Елена Петрова", "elena@vpotoke.ru"),
            ("Михаил Козлов", "mikhail@vpotoke.ru"),
            ("Ольга Новикова", "olga@vpotoke.ru"),
        ]

        for name, email in friend_names:
            friend = User(
                email=email,
                username=name,
                hashed_password=get_password_hash("demo2026"),
                roles='["student"]'
            )
            db.add(friend)
            friends.append(friend)

        db.commit()

        # Create friendships
        for friend in friends:
            db.refresh(friend)
            friendship = Friendship(
                user_id=demo_user.id,
                friend_id=friend.id,
                status="accepted"
            )
            db.add(friendship)

        db.commit()
        print(f"✓ Created {len(friends)} friends")

        # Create activities for demo user
        today = datetime.now()
        activities = [
            # Today's activities
            ("Лекция по математике", "education", today.replace(hour=9, minute=0), today.replace(hour=10, minute=30), True, 50),
            ("Обед", "household", today.replace(hour=13, minute=0), today.replace(hour=14, minute=0), True, 20),
            ("Работа над проектом", "career", today.replace(hour=15, minute=0), today.replace(hour=17, minute=0), False, 100),
            ("Тренировка", "health", today.replace(hour=18, minute=0), today.replace(hour=19, minute=30), False, 80),

            # Yesterday's activities
            ("Утренняя зарядка", "health", today - timedelta(days=1, hours=-7), today - timedelta(days=1, hours=-6, minutes=-30), True, 30),
            ("Лекция по программированию", "education", today - timedelta(days=1, hours=-10), today - timedelta(days=1, hours=-8, minutes=-30), True, 50),
            ("Встреча с друзьями", "social", today - timedelta(days=1, hours=-19), today - timedelta(days=1, hours=-21), True, 60),
        ]

        for title, category, start, end, completed, points in activities:
            activity = Activity(
                user_id=demo_user.id,
                title=title,
                category=category,
                start_time=start,
                end_time=end,
                completed=completed,
                points_earned=points if completed else 0
            )
            db.add(activity)

        db.commit()
        print(f"✓ Created {len(activities)} activities")

        # Create achievements
        achievements_data = [
            ("Первые шаги", "Завершите первую активность", 50),
            ("Неделя в потоке", "Поддерживайте серию 7 дней", 100),
            ("Социальная бабочка", "Добавьте 5 друзей", 50),
            ("Покоритель вершин", "Достигните 10 уровня", 200),
            ("Марафонец", "Завершите 100 активностей", 300),
        ]

        for name, desc, points in achievements_data:
            achievement = Achievement(
                name=name,
                description=desc,
                points=points
            )
            db.add(achievement)
            db.commit()
            db.refresh(achievement)

            # Award first 3 achievements to demo user
            if achievements_data.index((name, desc, points)) < 3:
                user_achievement = UserAchievement(
                    user_id=demo_user.id,
                    achievement_id=achievement.id
                )
                db.add(user_achievement)

        db.commit()
        print(f"✓ Created {len(achievements_data)} achievements")

        # Create leaderboard entries
        all_users = [demo_user] + friends
        points_list = [2850, 3200, 2100, 2950, 1800, 3500]
        for i, user in enumerate(all_users):
            rating = UserRating(
                user_id=user.id,
                total_points=points_list[i],
                weekly_points=points_list[i] // 4,
                monthly_points=points_list[i] // 2,
                rank=0
            )
            db.add(rating)

        db.commit()
        print(f"✓ Created leaderboard entries")

        # Create points history
        for i in range(15):
            date = today - timedelta(days=i)
            history = PointsHistory(
                user_id=demo_user.id,
                points=150 + (i % 100),
                reason="Completed activities",
                created_at=date
            )
            db.add(history)

        db.commit()
        print(f"✓ Created points history")

        print("\n✅ Demo account created successfully!")
        print(f"\nLogin credentials:")
        print(f"Email: demo@vpotoke.ru")
        print(f"Password: demo2026")
        print(f"\nUser stats:")
        print(f"- Friends: {len(friends)}")
        print(f"- Activities: {len(activities)}")
        print(f"- Achievements: 3 earned")
        print(f"- Points (from leaderboard): 2850")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()
