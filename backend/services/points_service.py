"""Points calculation and leaderboard service"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.models import User, UserRating, PointsHistory, Activity
from datetime import datetime, timedelta
import json

class PointsService:
    """Service for managing user points and rankings"""
    
    @staticmethod
    def award_points(
        db: Session,
        user_id: int,
        points: int,
        reason: str,
        category: str = None
    ):
        """
        Award points to a user
        
        Args:
            db: Database session
            user_id: User ID
            points: Points to award
            reason: Reason for awarding points
            category: Activity category
        """
        # Create points history entry
        history = PointsHistory(
            user_id=user_id,
            points=points,
            reason=reason,
            category=category
        )
        db.add(history)
        
        # Update or create user rating
        rating = db.query(UserRating).filter(UserRating.user_id == user_id).first()
        
        if not rating:
            rating = UserRating(
                user_id=user_id,
                total_points=0,
                weekly_points=0,
                monthly_points=0,
                category_points=json.dumps({})
            )
            db.add(rating)
        
        # Update points
        rating.total_points += points
        rating.weekly_points += points
        rating.monthly_points += points
        
        # Update category points
        category_points = json.loads(rating.category_points) if rating.category_points else {}
        if category:
            category_points[category] = category_points.get(category, 0) + points
        rating.category_points = json.dumps(category_points)
        
        rating.last_updated = datetime.utcnow()
        
        db.commit()
        
        # Recalculate ranks
        PointsService.recalculate_ranks(db)
    
    @staticmethod
    def recalculate_ranks(db: Session):
        """Recalculate all user ranks based on total points"""
        ratings = db.query(UserRating).order_by(UserRating.total_points.desc()).all()
        
        for idx, rating in enumerate(ratings, start=1):
            rating.rank = idx
        
        db.commit()
    
    @staticmethod
    def reset_weekly_points(db: Session):
        """Reset weekly points for all users (run weekly)"""
        db.query(UserRating).update({UserRating.weekly_points: 0})
        db.commit()
    
    @staticmethod
    def reset_monthly_points(db: Session):
        """Reset monthly points for all users (run monthly)"""
        db.query(UserRating).update({UserRating.monthly_points: 0})
        db.commit()
    
    @staticmethod
    def calculate_activity_points(activity: Activity) -> int:
        """
        Calculate points for completing an activity
        
        Args:
            activity: Activity object
            
        Returns:
            Points to award
        """
        base_points = 25
        
        # Bonus for different categories
        category_bonus = {
            'education': 10,
            'health': 15,
            'career': 10,
            'social': 5,
            'leisure': 5,
            'household': 5
        }
        
        bonus = category_bonus.get(activity.category, 0)
        
        # Duration bonus (longer activities = more points)
        duration_hours = (activity.end_time - activity.start_time).total_seconds() / 3600
        duration_bonus = min(int(duration_hours * 5), 20)  # Max 20 bonus points
        
        return base_points + bonus + duration_bonus
    
    @staticmethod
    def get_user_rank(db: Session, user_id: int):
        """Get user's current rank"""
        rating = db.query(UserRating).filter(UserRating.user_id == user_id).first()
        return rating.rank if rating else None
    
    @staticmethod
    def get_leaderboard(
        db: Session,
        limit: int = 100,
        period: str = 'all'  # 'all', 'weekly', 'monthly'
    ):
        """
        Get leaderboard
        
        Args:
            db: Database session
            limit: Number of users to return
            period: Time period ('all', 'weekly', 'monthly')
            
        Returns:
            List of user ratings
        """
        query = db.query(UserRating, User).join(User)
        
        if period == 'weekly':
            query = query.order_by(UserRating.weekly_points.desc())
        elif period == 'monthly':
            query = query.order_by(UserRating.monthly_points.desc())
        else:
            query = query.order_by(UserRating.total_points.desc())
        
        return query.limit(limit).all()

points_service = PointsService()
