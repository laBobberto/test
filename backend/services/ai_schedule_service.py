"""
AI Schedule Service - provides AI agent with full access to user's schedule
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import Activity, User


class AIScheduleService:
    """Service for AI agent to interact with user's schedule"""

    @staticmethod
    def get_user_schedule(
        db: Session,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Get user's schedule for AI analysis

        Returns structured schedule data with all activities
        """
        query = db.query(Activity).filter(Activity.user_id == user_id)

        if start_date:
            query = query.filter(Activity.start_time >= start_date)
        if end_date:
            # Add one day to end_date to include activities on that day
            query = query.filter(Activity.start_time < end_date + timedelta(days=1))

        activities = query.order_by(Activity.start_time).all()

        print(f"DEBUG get_user_schedule: user_id={user_id}, start={start_date}, end={end_date}, found={len(activities)}")

        schedule = []
        for activity in activities:
            schedule.append({
                "id": activity.id,
                "title": activity.title,
                "description": activity.description,
                "category": activity.category,
                "start_time": activity.start_time.isoformat(),
                "end_time": activity.end_time.isoformat(),
                "location": activity.location,
                "completed": activity.completed,
                "source": activity.source,
                "is_custom": activity.is_custom,
                "recurrence": activity.recurrence,
            })

        return schedule

    @staticmethod
    def create_activity(
        db: Session,
        user_id: int,
        title: str,
        start_time: datetime,
        end_time: datetime,
        category: str = "other",
        description: str = "",
        location: str = "",
        source: str = "ai"
    ) -> Dict:
        """
        Create new activity in user's schedule

        Used by AI to add activities based on recommendations
        """
        activity = Activity(
            user_id=user_id,
            title=title,
            description=description,
            category=category,
            start_time=start_time,
            end_time=end_time,
            location=location,
            source=source,
            is_custom=False  # AI-generated
        )

        db.add(activity)
        db.commit()
        db.refresh(activity)

        return {
            "id": activity.id,
            "title": activity.title,
            "start_time": activity.start_time.isoformat(),
            "end_time": activity.end_time.isoformat(),
            "message": "Activity created successfully"
        }

    @staticmethod
    def update_activity(
        db: Session,
        user_id: int,
        activity_id: int,
        **updates
    ) -> Dict:
        """
        Update existing activity

        AI can modify title, description, times, location, etc.
        """
        activity = db.query(Activity).filter(
            Activity.id == activity_id,
            Activity.user_id == user_id
        ).first()

        if not activity:
            return {"error": "Activity not found"}

        # Update allowed fields
        allowed_fields = [
            "title", "description", "category", "start_time",
            "end_time", "location", "completed"
        ]

        for field, value in updates.items():
            if field in allowed_fields and value is not None:
                setattr(activity, field, value)

        activity.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(activity)

        return {
            "id": activity.id,
            "title": activity.title,
            "message": "Activity updated successfully"
        }

    @staticmethod
    def delete_activity(
        db: Session,
        user_id: int,
        activity_id: int
    ) -> Dict:
        """
        Delete activity from schedule

        AI can remove activities if needed
        """
        activity = db.query(Activity).filter(
            Activity.id == activity_id,
            Activity.user_id == user_id
        ).first()

        if not activity:
            return {"error": "Activity not found"}

        db.delete(activity)
        db.commit()

        return {"message": "Activity deleted successfully"}

    @staticmethod
    def find_free_slots(
        db: Session,
        user_id: int,
        date: datetime,
        duration_minutes: int = 60
    ) -> List[Dict]:
        """
        Find free time slots in user's schedule

        Helps AI suggest optimal times for new activities
        """
        start_of_day = date.replace(hour=8, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=22, minute=0, second=0, microsecond=0)

        # Get all activities for the day
        activities = db.query(Activity).filter(
            Activity.user_id == user_id,
            Activity.start_time >= start_of_day,
            Activity.start_time < end_of_day
        ).order_by(Activity.start_time).all()

        free_slots = []
        current_time = start_of_day

        for activity in activities:
            # Check if there's a gap before this activity
            if activity.start_time > current_time:
                gap_duration = (activity.start_time - current_time).total_seconds() / 60

                if gap_duration >= duration_minutes:
                    free_slots.append({
                        "start": current_time.isoformat(),
                        "end": activity.start_time.isoformat(),
                        "duration_minutes": int(gap_duration)
                    })

            current_time = max(current_time, activity.end_time)

        # Check if there's time after last activity
        if current_time < end_of_day:
            gap_duration = (end_of_day - current_time).total_seconds() / 60
            if gap_duration >= duration_minutes:
                free_slots.append({
                    "start": current_time.isoformat(),
                    "end": end_of_day.isoformat(),
                    "duration_minutes": int(gap_duration)
                })

        return free_slots

    @staticmethod
    def get_schedule_summary(
        db: Session,
        user_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Get schedule summary for AI analysis

        Provides statistics and insights about user's schedule
        """
        activities = db.query(Activity).filter(
            Activity.user_id == user_id,
            Activity.start_time >= start_date,
            Activity.start_time <= end_date
        ).all()

        # Calculate statistics
        total_activities = len(activities)
        completed_activities = sum(1 for a in activities if a.completed)

        # Category breakdown
        category_counts = {}
        category_hours = {}

        for activity in activities:
            cat = activity.category
            duration = (activity.end_time - activity.start_time).total_seconds() / 3600

            category_counts[cat] = category_counts.get(cat, 0) + 1
            category_hours[cat] = category_hours.get(cat, 0) + duration

        # Source breakdown
        source_counts = {}
        for activity in activities:
            src = activity.source or "manual"
            source_counts[src] = source_counts.get(src, 0) + 1

        return {
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "total_activities": total_activities,
            "completed_activities": completed_activities,
            "completion_rate": completed_activities / total_activities if total_activities > 0 else 0,
            "category_breakdown": {
                "counts": category_counts,
                "hours": category_hours
            },
            "source_breakdown": source_counts
        }


# Global instance
ai_schedule_service = AIScheduleService()
