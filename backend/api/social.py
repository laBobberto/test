from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.models import User, Friendship, Message
from api.user import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/social", tags=["social"])

@router.post("/friends/request")
async def send_friend_request(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send friend request"""
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
    
    # Check if already friends
    existing = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id))
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")
    
    friendship = Friendship(
        user_id=current_user.id,
        friend_id=friend_id,
        status='pending'
    )
    db.add(friendship)
    db.commit()
    
    return {"message": "Friend request sent"}

@router.post("/friends/accept/{friendship_id}")
async def accept_friend_request(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept friend request"""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        Friendship.friend_id == current_user.id,
        Friendship.status == 'pending'
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friendship.status = 'accepted'
    db.commit()
    
    return {"message": "Friend request accepted"}

@router.get("/friends/list")
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of friends"""
    friendships = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)),
        Friendship.status == 'accepted'
    ).all()
    
    friends = []
    for f in friendships:
        friend_id = f.friend_id if f.user_id == current_user.id else f.user_id
        friend = db.query(User).filter(User.id == friend_id).first()
        if friend:
            friends.append({
                'id': friend.id,
                'username': friend.username,
                'email': friend.email
            })
    
    return friends

@router.post("/messages/send")
async def send_message(
    to_user_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to user"""
    message = Message(
        from_user_id=current_user.id,
        to_user_id=to_user_id,
        content=content
    )
    db.add(message)
    db.commit()
    
    return {"message": "Message sent"}

@router.get("/messages/inbox")
async def get_inbox(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get inbox messages"""
    messages = db.query(Message).filter(
        Message.to_user_id == current_user.id
    ).order_by(Message.created_at.desc()).limit(50).all()
    
    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.from_user_id).first()
        result.append({
            'id': m.id,
            'from': sender.username if sender else 'Unknown',
            'content': m.content,
            'read': m.read_at is not None,
            'created_at': m.created_at.isoformat()
        })
    
    return result
