from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json

from database.connection import get_db
from models.models import User, Activity, Priority, Event, ChatMessage
from models.schemas import DailyPlanRequest, DailyPlanResponse, ActivityResponse, ChatRequest, ChatResponse
from services.ai_service import ai_service
from services.enhanced_planning_service import enhanced_planning_service
from api.user import get_current_user
from integrations.external_apis import events_client
from integrations.weather_api import weather_api

router = APIRouter(prefix="/api/plan", tags=["plan"])

@router.post("/generate", response_model=ChatResponse)
async def generate_plan(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate daily plan using AI with schedule access"""

    # Get user priorities
    priorities = db.query(Priority).filter(Priority.user_id == current_user.id).all()
    priorities_dict = {p.category: p.value for p in priorities}

    # Get user's schedule for today
    today = datetime.now().date()
    schedule = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.start_time >= today,
        Activity.start_time < today + timedelta(days=1)
    ).all()

    schedule_data = [
        {
            "title": s.title,
            "start_time": s.start_time.isoformat(),
            "end_time": s.end_time.isoformat(),
            "location": s.location
        }
        for s in schedule
    ]

    # Get available events
    events = await events_client.get_events(limit=10)

    # Get weather
    weather = await weather_api.get_current_weather('Saint Petersburg')

    # Prepare context for AI
    user_data = {
        "user_id": current_user.id,
        "priorities": priorities_dict,
        "schedule": schedule_data,
        "events": events,
        "weather": weather,
        "user_message": request.message
    }

    # Generate plan with AI (now with schedule access)
    ai_response = await ai_service.generate_plan(user_data, db)

    return ChatResponse(
        response=ai_response,
        suggestions=["Добавить спортивную активность", "Посмотреть события на выходные"]
    )

@router.get("/daily", response_model=DailyPlanResponse)
async def get_daily_plan(
    date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily plan"""
    
    if not date:
        target_date = datetime.now().date()
    else:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    
    # Get activities for the day
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.start_time >= target_date,
        Activity.start_time < target_date + timedelta(days=1)
    ).order_by(Activity.start_time).all()
    
    # Calculate balance score
    priorities = db.query(Priority).filter(Priority.user_id == current_user.id).all()
    balance_score = 75.0  # Placeholder calculation
    
    return DailyPlanResponse(
        date=target_date.isoformat(),
        activities=activities,
        suggestions=["Отличный баланс!", "Не забудь про перерывы"],
        balance_score=balance_score
    )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI assistant with full schedule access and conversation history"""

    # Load recent chat history (last 20 messages)
    history = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.desc()).limit(20).all()

    # Reverse to get chronological order
    history = list(reversed(history))

    # Build conversation context
    conversation_history = []
    for msg in history:
        conversation_history.append({
            "role": msg.role,
            "content": msg.content
        })

    # Get user context
    priorities = db.query(Priority).filter(Priority.user_id == current_user.id).all()
    priorities_dict = {p.category: p.value for p in priorities}

    user_data = {
        "user_id": current_user.id,
        "priorities": priorities_dict,
        "user_roles": json.loads(current_user.roles),
        "conversation_history": conversation_history
    }

    # Save user message to history
    user_message = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()

    # Get AI response with schedule access and history
    ai_response = await ai_service.chat(request.message, user_data, db)

    # Save assistant response to history
    assistant_message = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_response
    )
    db.add(assistant_message)
    db.commit()

    return ChatResponse(
        response=ai_response,
        suggestions=[]
    )
