from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.models import User
from api.user import get_current_user

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.get("/")
async def get_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all groups"""
    # Mock data
    groups = [
        {
            "id": 1,
            "name": "ЛЭТИ Студенты",
            "description": "Группа студентов ЛЭТИ",
            "member_count": 150,
            "is_member": True
        },
        {
            "id": 2,
            "name": "Бегуны Петербурга",
            "description": "Любители бега в СПб",
            "member_count": 85,
            "is_member": False
        },
        {
            "id": 3,
            "name": "IT Специалисты",
            "description": "Сообщество IT профессионалов",
            "member_count": 200,
            "is_member": True
        }
    ]
    return groups
