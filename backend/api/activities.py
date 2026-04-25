from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database.connection import get_db
from models.models import User, Activity, Achievement, UserAchievement
from models.schemas import (
    ActivityCreate, ActivityUpdate, ActivityReschedule,
    ActivityResponse, ActivityComplete, 
    AchievementResponse, UserStatsResponse
)
from api.user import get_current_user

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.post("/", response_model=ActivityResponse)
async def create_activity(
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new activity"""
    
    activity = Activity(
        user_id=current_user.id,
        title=activity_data.title,
        description=activity_data.description,
        category=activity_data.category,
        start_time=activity_data.start_time,
        end_time=activity_data.end_time,
        location=activity_data.location
    )
    
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    return activity

@router.get("/", response_model=List[ActivityResponse])
async def get_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user activities"""
    
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(Activity.start_time.desc()).all()
    
    return activities

@router.post("/complete", response_model=ActivityResponse)
async def complete_activity(
    data: ActivityComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark activity as completed and award points"""
    
    activity = db.query(Activity).filter(
        Activity.id == data.activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    if activity.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activity already completed"
        )
    
    # Mark as completed and award points
    activity.completed = True
    activity.points_earned = 25  # Base points
    
    db.commit()
    db.refresh(activity)
    
    return activity

@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(db: Session = Depends(get_db)):
    """Get all available achievements"""
    
    achievements = db.query(Achievement).all()
    return achievements

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    
    # Calculate stats
    completed_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).count()
    
    total_points = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).with_entities(Activity.points_earned).all()
    
    total_points_sum = sum(p[0] for p in total_points if p[0])
    
    achievements_count = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).count()
    
    return UserStatsResponse(
        total_points=total_points_sum,
        current_streak=3,  # Placeholder
        completed_activities=completed_activities,
        achievements_count=achievements_count,
        balance_score=75.0  # Placeholder
    )

@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single activity by ID"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    return activity

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    activity_data: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update activity"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    # Update fields
    update_data = activity_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    
    activity.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(activity)
    
    return activity

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete activity"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    db.delete(activity)
    db.commit()
    
    return None

@router.patch("/{activity_id}/reschedule", response_model=ActivityResponse)
async def reschedule_activity(
    activity_id: int,
    reschedule_data: ActivityReschedule,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reschedule activity to new time"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    activity.start_time = reschedule_data.start_time
    activity.end_time = reschedule_data.end_time
    activity.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(activity)
    
    return activity
