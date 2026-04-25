from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import json

from database.connection import get_db
from models.models import User, Activity, Priority, Event
from models.schemas import DailyPlanRequest, DailyPlanResponse, ActivityResponse, ChatRequest, ChatResponse
from services.ai_service import ai_service
from api.user import get_current_user
from integrations.external_apis import events_client

router = APIRouter(prefix="/api/plan", tags=["plan"])

@router.post("/generate", response_model=ChatResponse)
async def generate_plan(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate daily plan using AI"""
    
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
    
    # Prepare context for AI
    user_data = {
        "priorities": priorities_dict,
        "schedule": schedule_data,
        "events": events,
        "user_message": request.message
    }
    
    # Generate plan with AI
    ai_response = await ai_service.generate_plan(user_data)
    
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
    """Chat with AI assistant"""
    
    # Get user context
    priorities = db.query(Priority).filter(Priority.user_id == current_user.id).all()
    priorities_dict = {p.category: p.value for p in priorities}
    
    context = request.context or {}
    context["priorities"] = priorities_dict
    context["user_roles"] = json.loads(current_user.roles)
    
    # Get AI response
    ai_response = await ai_service.chat(request.message, context)
    
    return ChatResponse(
        response=ai_response,
        suggestions=[]
    )
