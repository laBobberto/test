from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database.connection import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    RESIDENT = "resident"
    TOURIST = "tourist"

class PriorityCategory(str, enum.Enum):
    EDUCATION = "education"
    CAREER = "career"
    HEALTH = "health"
    LEISURE = "leisure"
    SOCIAL = "social"
    HOUSEHOLD = "household"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    roles = Column(String, nullable=False)  # JSON string of roles
    created_at = Column(DateTime, default=datetime.utcnow)
    
    priorities = relationship("Priority", back_populates="user")
    activities = relationship("Activity", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")

class Priority(Base):
    __tablename__ = "priorities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    value = Column(Float, nullable=False)  # 0-100
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="priorities")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String)
    completed = Column(Boolean, default=False)
    points_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # New fields for v2.0
    is_custom = Column(Boolean, default=True)  # True = user-created, False = AI-generated
    recurrence = Column(Text)  # JSON: {"type": "daily/weekly/monthly", "days": [1,2,3], "end_date": "2026-12-31"}
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="activities")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String)
    source_url = Column(String)
    cached_at = Column(DateTime, default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    points = Column(Integer, default=0)
    category = Column(String)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_number = Column(String)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String)
    teacher = Column(String)
    cached_at = Column(DateTime, default=datetime.utcnow)

class UserRating(Base):
    __tablename__ = "user_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_points = Column(Integer, default=0)
    rank = Column(Integer, default=0)
    weekly_points = Column(Integer, default=0)
    monthly_points = Column(Integer, default=0)
    category_points = Column(Text)  # JSON: {"education": 100, "health": 50, ...}
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="rating")

class PointsHistory(Base):
    __tablename__ = "points_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="points_history")

class PlanTemplate(Base):
    __tablename__ = "plan_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    activities_template = Column(Text)  # JSON
    is_public = Column(Boolean, default=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", backref="plan_templates")

class PlanningSession(Base):
    __tablename__ = "planning_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, unique=True, index=True)
    state = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="planning_sessions")
