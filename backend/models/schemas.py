from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    roles: List[str]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    roles: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Priority schemas
class PriorityBase(BaseModel):
    category: str
    value: float

class PriorityCreate(PriorityBase):
    pass

class PriorityResponse(PriorityBase):
    id: int
    user_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PrioritiesUpdate(BaseModel):
    priorities: List[PriorityBase]

# Activity schemas
class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    is_custom: Optional[bool] = True
    recurrence: Optional[dict] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    recurrence: Optional[dict] = None

class ActivityReschedule(BaseModel):
    start_time: datetime
    end_time: datetime

class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    completed: bool
    points_earned: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ActivityComplete(BaseModel):
    activity_id: int

# Event schemas
class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    image_url: Optional[str]
    source_url: Optional[str]
    
    class Config:
        from_attributes = True

# AI Chat schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: Optional[List[str]] = None

# Plan schemas
class DailyPlanRequest(BaseModel):
    date: Optional[str] = None

class DailyPlanResponse(BaseModel):
    date: str
    activities: List[ActivityResponse]
    suggestions: List[str]
    balance_score: float

# Achievement schemas
class AchievementResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    points: int
    category: Optional[str]
    
    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    total_points: int
    current_streak: int
    completed_activities: int
    achievements_count: int
    balance_score: float

# Leaderboard schemas
class UserRankResponse(BaseModel):
    user_id: int
    username: str
    total_points: int
    rank: int
    weekly_points: int
    monthly_points: int
    
class LeaderboardResponse(BaseModel):
    users: List[UserRankResponse]
    my_rank: Optional[UserRankResponse] = None
    total_users: int
