from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database.connection import get_db
from models.models import User, UserRating
from models.schemas import LeaderboardResponse, UserRankResponse
from api.user import get_current_user
from services.points_service import points_service
import json

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/global", response_model=LeaderboardResponse)
async def get_global_leaderboard(
    limit: int = Query(100, ge=1, le=500),
    period: str = Query('all', regex='^(all|weekly|monthly)$'),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get global leaderboard
    
    Args:
        limit: Number of users to return (1-500)
        period: Time period (all, weekly, monthly)
        
    Returns:
        Leaderboard with top users and current user's rank
    """
    # Get leaderboard
    results = points_service.get_leaderboard(db, limit, period)
    
    users = []
    for rating, user in results:
        users.append(UserRankResponse(
            user_id=user.id,
            username=user.username,
            total_points=rating.total_points,
            rank=rating.rank,
            weekly_points=rating.weekly_points,
            monthly_points=rating.monthly_points
        ))
    
    # Get current user's rank
    my_rating = db.query(UserRating).filter(UserRating.user_id == current_user.id).first()
    my_rank = None
    if my_rating:
        my_rank = UserRankResponse(
            user_id=current_user.id,
            username=current_user.username,
            total_points=my_rating.total_points,
            rank=my_rating.rank,
            weekly_points=my_rating.weekly_points,
            monthly_points=my_rating.monthly_points
        )
    
    total_users = db.query(UserRating).count()
    
    return LeaderboardResponse(
        users=users,
        my_rank=my_rank,
        total_users=total_users
    )

@router.get("/by-role/{role}", response_model=LeaderboardResponse)
async def get_leaderboard_by_role(
    role: str,
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard filtered by user role
    
    Args:
        role: User role (student, resident, tourist)
        limit: Number of users to return
        
    Returns:
        Leaderboard for specific role
    """
    # Get users with specific role
    query = db.query(UserRating, User).join(User).filter(
        User.roles.contains(role)
    ).order_by(UserRating.total_points.desc()).limit(limit)
    
    results = query.all()
    
    users = []
    for rating, user in results:
        users.append(UserRankResponse(
            user_id=user.id,
            username=user.username,
            total_points=rating.total_points,
            rank=rating.rank,
            weekly_points=rating.weekly_points,
            monthly_points=rating.monthly_points
        ))
    
    # Get current user's rank in this role
    my_rating = db.query(UserRating).filter(UserRating.user_id == current_user.id).first()
    my_rank = None
    if my_rating and role in json.loads(current_user.roles):
        my_rank = UserRankResponse(
            user_id=current_user.id,
            username=current_user.username,
            total_points=my_rating.total_points,
            rank=my_rating.rank,
            weekly_points=my_rating.weekly_points,
            monthly_points=my_rating.monthly_points
        )
    
    total_users = db.query(User).filter(User.roles.contains(role)).count()
    
    return LeaderboardResponse(
        users=users,
        my_rank=my_rank,
        total_users=total_users
    )

@router.get("/weekly", response_model=LeaderboardResponse)
async def get_weekly_leaderboard(
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly leaderboard"""
    return await get_global_leaderboard(limit, 'weekly', current_user, db)

@router.get("/monthly", response_model=LeaderboardResponse)
async def get_monthly_leaderboard(
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly leaderboard"""
    return await get_global_leaderboard(limit, 'monthly', current_user, db)

@router.get("/me", response_model=UserRankResponse)
async def get_my_rank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's rank"""
    rating = db.query(UserRating).filter(UserRating.user_id == current_user.id).first()
    
    if not rating:
        # Create initial rating
        rating = UserRating(
            user_id=current_user.id,
            total_points=0,
            rank=0,
            weekly_points=0,
            monthly_points=0,
            category_points=json.dumps({})
        )
        db.add(rating)
        db.commit()
        db.refresh(rating)
    
    return UserRankResponse(
        user_id=current_user.id,
        username=current_user.username,
        total_points=rating.total_points,
        rank=rating.rank,
        weekly_points=rating.weekly_points,
        monthly_points=rating.monthly_points
    )
