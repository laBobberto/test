from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database.connection import get_db
from models.models import User, Friendship, Message
from models.schemas import FriendshipCreate, FriendshipResponse, MessageCreate, MessageResponse
from api.user import get_current_user

router = APIRouter(prefix="/api/social", tags=["social"])

# ============= FRIENDSHIPS =============

@router.post("/friends/request", response_model=FriendshipResponse)
def send_friend_request(
    friend_username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send friend request"""
    friend = db.query(User).filter(User.username == friend_username).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    
    if friend.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
    
    # Check if already friends or pending
    existing = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend.id)) |
        ((Friendship.user_id == friend.id) & (Friendship.friend_id == current_user.id))
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Friend request already exists")
    
    friendship = Friendship(
        user_id=current_user.id,
        friend_id=friend.id,
        status='pending'
    )
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    
    return {
        "id": friendship.id,
        "user_id": friendship.user_id,
        "friend_id": friendship.friend_id,
        "friend_username": friend.username,
        "status": friendship.status,
        "created_at": friendship.created_at
    }

@router.post("/friends/accept/{friendship_id}")
def accept_friend_request(
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

@router.delete("/friends/{friendship_id}")
def remove_friend(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove friend or reject request"""
    friendship = db.query(Friendship).filter(
        Friendship.id == friendship_id,
        ((Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id))
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    db.delete(friendship)
    db.commit()
    
    return {"message": "Friend removed"}

@router.get("/friends", response_model=List[FriendshipResponse])
def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all friends"""
    friendships = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)),
        Friendship.status == 'accepted'
    ).all()
    
    result = []
    for f in friendships:
        friend_id = f.friend_id if f.user_id == current_user.id else f.user_id
        friend = db.query(User).filter(User.id == friend_id).first()
        result.append({
            "id": f.id,
            "user_id": f.user_id,
            "friend_id": friend_id,
            "friend_username": friend.username if friend else "Unknown",
            "status": f.status,
            "created_at": f.created_at
        })
    
    return result

@router.get("/friends/requests", response_model=List[FriendshipResponse])
def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending friend requests"""
    requests = db.query(Friendship).filter(
        Friendship.friend_id == current_user.id,
        Friendship.status == 'pending'
    ).all()
    
    result = []
    for r in requests:
        sender = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "friend_id": r.friend_id,
            "friend_username": sender.username if sender else "Unknown",
            "status": r.status,
            "created_at": r.created_at
        })
    
    return result

# ============= MESSAGES =============

@router.post("/messages", response_model=MessageResponse)
def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to friend"""
    # Check if users are friends
    friendship = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == message.to_user_id)) |
        ((Friendship.user_id == message.to_user_id) & (Friendship.friend_id == current_user.id)),
        Friendship.status == 'accepted'
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=403, detail="Can only message friends")
    
    new_message = Message(
        from_user_id=current_user.id,
        to_user_id=message.to_user_id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "id": new_message.id,
        "from_user_id": new_message.from_user_id,
        "to_user_id": new_message.to_user_id,
        "content": new_message.content,
        "read_at": new_message.read_at,
        "created_at": new_message.created_at
    }

@router.get("/messages/{friend_id}", response_model=List[MessageResponse])
def get_messages(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get message history with friend"""
    messages = db.query(Message).filter(
        ((Message.from_user_id == current_user.id) & (Message.to_user_id == friend_id)) |
        ((Message.from_user_id == friend_id) & (Message.to_user_id == current_user.id))
    ).order_by(Message.created_at.desc()).limit(100).all()
    
    # Mark messages as read
    for msg in messages:
        if msg.to_user_id == current_user.id and not msg.read_at:
            msg.read_at = datetime.utcnow()
    db.commit()
    
    return [
        {
            "id": m.id,
            "from_user_id": m.from_user_id,
            "to_user_id": m.to_user_id,
            "content": m.content,
            "read_at": m.read_at,
            "created_at": m.created_at
        }
        for m in messages
    ]

@router.get("/messages/unread/count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread messages count"""
    count = db.query(Message).filter(
        Message.to_user_id == current_user.id,
        Message.read_at == None
    ).count()
    
    return {"unread_count": count}
