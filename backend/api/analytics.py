from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict
from datetime import datetime, timedelta
import json

from database.connection import get_db
from models.models import User, Activity, PointsHistory, UserRating
from api.user import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics overview for current user"""
    
    # Total activities
    total_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).count()
    
    # Completed activities
    completed_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).count()
    
    # Total points
    rating = db.query(UserRating).filter(
        UserRating.user_id == current_user.id
    ).first()
    
    total_points = rating.total_points if rating else 0
    
    # Completion rate
    completion_rate = (completed_activities / total_activities * 100) if total_activities > 0 else 0
    
    # Activities by category
    category_stats = db.query(
        Activity.category,
        func.count(Activity.id).label('count')
    ).filter(
        Activity.user_id == current_user.id
    ).group_by(Activity.category).all()
    
    categories = {cat: count for cat, count in category_stats}
    
    return {
        "total_activities": total_activities,
        "completed_activities": completed_activities,
        "total_points": total_points,
        "completion_rate": round(completion_rate, 1),
        "categories": categories
    }

@router.get("/activities/weekly")
def get_weekly_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activities count by day for last 7 days"""
    
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    activities = db.query(
        func.date(Activity.start_time).label('date'),
        func.count(Activity.id).label('count')
    ).filter(
        Activity.user_id == current_user.id,
        Activity.start_time >= week_ago
    ).group_by(func.date(Activity.start_time)).all()
    
    # Fill missing days with 0
    result = []
    for i in range(7):
        day = today - timedelta(days=6-i)
        count = next((a.count for a in activities if a.date == day), 0)
        result.append({
            "date": day.isoformat(),
            "count": count
        })
    
    return {"data": result}

@router.get("/activities/monthly")
def get_monthly_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activities count by day for last 30 days"""
    
    today = datetime.utcnow().date()
    month_ago = today - timedelta(days=30)
    
    activities = db.query(
        func.date(Activity.start_time).label('date'),
        func.count(Activity.id).label('count')
    ).filter(
        Activity.user_id == current_user.id,
        Activity.start_time >= month_ago
    ).group_by(func.date(Activity.start_time)).all()
    
    # Fill missing days with 0
    result = []
    for i in range(30):
        day = today - timedelta(days=29-i)
        count = next((a.count for a in activities if a.date == day), 0)
        result.append({
            "date": day.isoformat(),
            "count": count
        })
    
    return {"data": result}

@router.get("/points/history")
def get_points_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get points history for last N days"""
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    history = db.query(PointsHistory).filter(
        PointsHistory.user_id == current_user.id,
        PointsHistory.created_at >= cutoff_date
    ).order_by(PointsHistory.created_at.desc()).all()
    
    return {
        "history": [
            {
                "id": h.id,
                "points": h.points,
                "reason": h.reason,
                "category": h.category,
                "created_at": h.created_at
            }
            for h in history
        ]
    }

@router.get("/categories/breakdown")
def get_category_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activities breakdown by category"""
    
    # Activities by category
    activities = db.query(
        Activity.category,
        func.count(Activity.id).label('total'),
        func.sum(func.cast(Activity.completed, func.Integer)).label('completed')
    ).filter(
        Activity.user_id == current_user.id
    ).group_by(Activity.category).all()
    
    result = []
    for cat, total, completed in activities:
        completed = completed or 0
        result.append({
            "category": cat,
            "total": total,
            "completed": completed,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0
        })
    
    return {"categories": result}

@router.get("/time/distribution")
def get_time_distribution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get time spent by category"""
    
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).all()
    
    category_time = {}
    for activity in activities:
        duration = (activity.end_time - activity.start_time).total_seconds() / 3600  # hours
        category = activity.category
        category_time[category] = category_time.get(category, 0) + duration
    
    result = [
        {"category": cat, "hours": round(hours, 1)}
        for cat, hours in category_time.items()
    ]
    
    return {"distribution": result}

@router.get("/streaks")
def get_activity_streaks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity streaks (consecutive days with completed activities)"""
    
    # Get all completed activities ordered by date
    activities = db.query(
        func.date(Activity.start_time).label('date')
    ).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).distinct().order_by(func.date(Activity.start_time).desc()).all()
    
    if not activities:
        return {"current_streak": 0, "longest_streak": 0}
    
    dates = [a.date for a in activities]
    
    # Calculate current streak
    current_streak = 0
    today = datetime.utcnow().date()
    
    for i, date in enumerate(dates):
        expected_date = today - timedelta(days=i)
        if date == expected_date:
            current_streak += 1
        else:
            break
    
    # Calculate longest streak
    longest_streak = 1
    temp_streak = 1
    
    for i in range(1, len(dates)):
        if dates[i-1] - dates[i] == timedelta(days=1):
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }

@router.get("/export")
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all user data as JSON"""
    
    # Get all user activities
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).all()
    
    # Get points history
    points = db.query(PointsHistory).filter(
        PointsHistory.user_id == current_user.id
    ).all()
    
    # Get rating
    rating = db.query(UserRating).filter(
        UserRating.user_id == current_user.id
    ).first()
    
    export_data = {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat()
        },
        "activities": [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "category": a.category,
                "start_time": a.start_time.isoformat(),
                "end_time": a.end_time.isoformat(),
                "location": a.location,
                "completed": a.completed,
                "points_earned": a.points_earned
            }
            for a in activities
        ],
        "points_history": [
            {
                "points": p.points,
                "reason": p.reason,
                "category": p.category,
                "created_at": p.created_at.isoformat()
            }
            for p in points
        ],
        "rating": {
            "total_points": rating.total_points if rating else 0,
            "rank": rating.rank if rating else 0,
            "weekly_points": rating.weekly_points if rating else 0,
            "monthly_points": rating.monthly_points if rating else 0
        } if rating else None
    }
    
    return export_data
