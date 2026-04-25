from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database.connection import get_db
from models.models import User, Priority
from models.schemas import UserResponse, PrioritiesUpdate, PriorityResponse
from services.auth import decode_access_token

router = APIRouter(prefix="/api/user", tags=["user"])

async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        roles=json.loads(current_user.roles),
        created_at=current_user.created_at
    )

@router.put("/priorities", response_model=List[PriorityResponse])
async def update_priorities(
    priorities_data: PrioritiesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user priorities"""
    
    # Validate sum = 100
    total = sum(p.value for p in priorities_data.priorities)
    if abs(total - 100.0) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Priorities must sum to 100, got {total}"
        )
    
    # Delete existing priorities
    db.query(Priority).filter(Priority.user_id == current_user.id).delete()
    
    # Create new priorities
    new_priorities = []
    for priority_data in priorities_data.priorities:
        priority = Priority(
            user_id=current_user.id,
            category=priority_data.category,
            value=priority_data.value
        )
        db.add(priority)
        new_priorities.append(priority)
    
    db.commit()
    
    for priority in new_priorities:
        db.refresh(priority)
    
    return new_priorities

@router.get("/priorities", response_model=List[PriorityResponse])
async def get_priorities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user priorities"""
    
    priorities = db.query(Priority).filter(Priority.user_id == current_user.id).all()
    return priorities
