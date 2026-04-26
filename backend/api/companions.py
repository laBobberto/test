from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/companions", tags=["companions"])


@router.get("/")
async def get_companions(
    category: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all companion posts"""
    # Mock data
    all_companions = [
        {
            "id": 1,
            "title": "Ищу попутчика на концерт",
            "description": "Иду на концерт в А2 в субботу, есть лишний билет",
            "category": "leisure",
            "datetime": "2026-04-30T19:00:00Z",
            "location": "А2 Green Concert",
            "author": {
                "id": 2,
                "username": "Анна Смирнова"
            },
            "max_participants": 2,
            "current_participants": 1,
            "participants": [
                {"id": 2, "username": "Анна Смирнова"}
            ],
            "created_at": "2026-04-25T10:00:00Z"
        },
        {
            "id": 2,
            "title": "Бег по набережной",
            "description": "Бегаю каждое утро в 7:00 по Дворцовой набережной, присоединяйтесь!",
            "category": "health",
            "datetime": "2026-04-26T07:00:00Z",
            "location": "Дворцовая набережная",
            "author": {
                "id": 3,
                "username": "Дмитрий Иванов"
            },
            "max_participants": 5,
            "current_participants": 2,
            "participants": [
                {"id": 3, "username": "Дмитрий Иванов"},
                {"id": 4, "username": "Елена Петрова"}
            ],
            "created_at": "2026-04-24T20:00:00Z"
        },
        {
            "id": 3,
            "title": "Поход в Эрмитаж",
            "description": "Планирую сходить в Эрмитаж в воскресенье, кто со мной?",
            "category": "leisure",
            "datetime": "2026-04-27T11:00:00Z",
            "location": "Эрмитаж",
            "author": {
                "id": 1,
                "username": "Демо Пользователь"
            },
            "max_participants": 5,
            "current_participants": 1,
            "participants": [
                {"id": 1, "username": "Демо Пользователь"}
            ],
            "created_at": "2026-04-25T15:00:00Z"
        },
        {
            "id": 4,
            "title": "Учёба в библиотеке",
            "description": "Готовлюсь к экзаменам в РНБ, можно вместе",
            "category": "education",
            "datetime": "2026-04-26T14:00:00Z",
            "location": "Российская национальная библиотека",
            "author": {
                "id": 4,
                "username": "Елена Петрова"
            },
            "max_participants": 4,
            "current_participants": 2,
            "participants": [
                {"id": 4, "username": "Елена Петрова"},
                {"id": 5, "username": "Михаил Козлов"}
            ],
            "created_at": "2026-04-25T12:00:00Z"
        }
    ]

    # Filter by category if provided
    if category:
        companions = [c for c in all_companions if c["category"] == category]
    else:
        companions = all_companions

    return companions


@router.post("/")
async def create_companion(
    title: str,
    description: str,
    category: str,
    datetime_str: str,
    location: str,
    max_participants: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new companion post"""
    return {
        "message": "Companion post created",
        "id": 5
    }


@router.post("/{companion_id}/join")
async def join_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a companion activity"""
    return {
        "message": "Successfully joined",
        "companion_id": companion_id
    }


@router.delete("/{companion_id}/leave")
async def leave_companion(
    companion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a companion activity"""
    return {
        "message": "Successfully left",
        "companion_id": companion_id
    }
