from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from dateutil import parser

from database.connection import get_db
from models.models import Event
from models.schemas import EventResponse
from integrations.external_apis import events_client

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("/", response_model=List[EventResponse])
async def get_events(
    category: Optional[str] = None,
    date: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get events from cache or fetch from API"""
    
    # Try to get from cache first
    query = db.query(Event)
    
    if category:
        query = query.filter(Event.category == category)
    
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        query = query.filter(Event.start_date >= target_date)
    
    cached_events = query.limit(limit).all()

    print(f"DEBUG: cached_events count = {len(cached_events)}")

    # If cache is empty or old, fetch from API
    if not cached_events:
        print("DEBUG: Fetching from API...")
        api_events = await events_client.get_events(category=category, limit=limit)
        print(f"DEBUG: Got {len(api_events)} events from API")

        # Save to cache
        for event_data in api_events:
            # Parse date strings to datetime objects
            start_date = None
            end_date = None
            if event_data.get('start_date'):
                try:
                    start_date = parser.parse(event_data['start_date'])
                except:
                    pass
            if event_data.get('end_date'):
                try:
                    end_date = parser.parse(event_data['end_date'])
                except:
                    pass

            event = Event(
                external_id=str(event_data.get('id', '')),
                title=event_data.get('title', ''),
                description=event_data.get('description', ''),
                category=event_data.get('category', ''),
                start_date=start_date,
                end_date=end_date,
                location=event_data.get('location', ''),
                latitude=event_data.get('latitude'),
                longitude=event_data.get('longitude'),
                image_url=event_data.get('image_url', ''),
                source_url=event_data.get('source_url', '')
            )
            db.add(event)

        db.commit()

        # Query again with fresh query
        query = db.query(Event)
        if category:
            query = query.filter(Event.category == category)
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d")
            query = query.filter(Event.start_date >= target_date)

        cached_events = query.limit(limit).all()

    return cached_events

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get single event by ID"""
    
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event
