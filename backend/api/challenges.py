from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


@router.get("/")
async def get_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all challenges with user progress"""
    # Mock data
    challenges = [
        {
            "id": 1,
            "title": "Утренняя зарядка",
            "description": "Делай зарядку каждое утро в течение недели",
            "category": "health",
            "target_count": 7,
            "reward_points": 200,
            "start_date": (datetime.now() - timedelta(days=5)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=10)).isoformat(),
            "status": "active",
            "progress": 3
        },
        {
            "id": 2,
            "title": "Читай каждый день",
            "description": "Читай минимум 30 минут каждый день",
            "category": "leisure",
            "target_count": 14,
            "reward_points": 300,
            "start_date": (datetime.now() - timedelta(days=5)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=10)).isoformat(),
            "status": "active",
            "progress": 8
        },
        {
            "id": 3,
            "title": "Неделя без фастфуда",
            "description": "Не ешь фастфуд целую неделю",
            "category": "health",
            "target_count": 7,
            "reward_points": 250,
            "start_date": (datetime.now() - timedelta(days=10)).isoformat(),
            "end_date": (datetime.now() - timedelta(days=1)).isoformat(),
            "status": "completed",
            "progress": 7,
            "completed_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "id": 4,
            "title": "5 новых мест",
            "description": "Посети 5 новых мест в городе",
            "category": "leisure",
            "target_count": 5,
            "reward_points": 400,
            "start_date": (datetime.now() - timedelta(days=30)).isoformat(),
            "end_date": (datetime.now() - timedelta(days=1)).isoformat(),
            "status": "completed",
            "progress": 5,
            "completed_at": (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            "id": 5,
            "title": "Марафон продуктивности",
            "description": "Выполни все запланированные задачи 5 дней подряд",
            "category": "career",
            "target_count": 5,
            "reward_points": 500,
            "start_date": None,
            "end_date": None,
            "status": "available",
            "progress": 0
        },
        {
            "id": 6,
            "title": "Социальная бабочка",
            "description": "Встреться с 3 друзьями на этой неделе",
            "category": "social",
            "target_count": 3,
            "reward_points": 150,
            "start_date": None,
            "end_date": None,
            "status": "available",
            "progress": 0
        },
        {
            "id": 7,
            "title": "Ранняя пташка",
            "description": "Просыпайся до 7 утра 10 дней подряд",
            "category": "health",
            "target_count": 10,
            "reward_points": 350,
            "start_date": None,
            "end_date": None,
            "status": "available",
            "progress": 0
        }
    ]

    return challenges


@router.post("/{challenge_id}/join")
async def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a challenge"""
    return {
        "message": "Successfully joined challenge",
        "challenge_id": challenge_id,
        "status": "active"
    }


@router.post("/{challenge_id}/accept")
async def accept_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept/join a challenge"""
    return {
        "id": challenge_id,
        "status": "active",
        "progress": 0,
        "message": "Challenge accepted"
    }


@router.post("/{challenge_id}/complete")
async def complete_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark challenge as completed"""
    return {
        "id": challenge_id,
        "status": "completed",
        "message": "Challenge completed",
        "reward_points": 200
    }


@router.post("/{challenge_id}/progress")
async def update_challenge_progress(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update challenge progress"""
    return {
        "message": "Progress updated",
        "challenge_id": challenge_id
    }
