from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from models.models import User, Activity
from api.user import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
async def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics summary"""
    
    # Total activities
    total = db.query(Activity).filter(Activity.user_id == current_user.id).count()
    completed = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).count()
    
    # This week
    week_ago = datetime.now() - timedelta(days=7)
    week_completed = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True,
        Activity.created_at >= week_ago
    ).count()
    
    # By category
    categories = db.query(
        Activity.category,
        func.count(Activity.id).label('count')
    ).filter(
        Activity.user_id == current_user.id,
        Activity.completed == True
    ).group_by(Activity.category).all()
    
    category_stats = {cat: count for cat, count in categories}
    
    return {
        'total_activities': total,
        'completed_activities': completed,
        'completion_rate': round(completed / total * 100, 1) if total > 0 else 0,
        'week_completed': week_completed,
        'by_category': category_stats
    }

@router.get("/by-category")
async def get_category_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics by category"""
    
    categories = db.query(
        Activity.category,
        func.count(Activity.id).label('total'),
        func.sum(func.cast(Activity.completed, db.Integer)).label('completed')
    ).filter(
        Activity.user_id == current_user.id
    ).group_by(Activity.category).all()
    
    result = []
    for cat, total, completed in categories:
        result.append({
            'category': cat,
            'total': total,
            'completed': completed or 0,
            'completion_rate': round((completed or 0) / total * 100, 1) if total > 0 else 0
        })
    
    return result

@router.get("/trends")
async def get_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity trends"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    activities = db.query(
        func.date(Activity.created_at).label('date'),
        func.count(Activity.id).label('count')
    ).filter(
        Activity.user_id == current_user.id,
        Activity.created_at >= start_date
    ).group_by(func.date(Activity.created_at)).all()
    
    return [{'date': str(date), 'count': count} for date, count in activities]
