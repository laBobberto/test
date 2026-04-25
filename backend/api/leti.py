from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database.connection import get_db
from models.models import User, Activity
from models.schemas import ActivityResponse
from api.user import get_current_user
from integrations.external_apis import leti_client

router = APIRouter(prefix="/api/leti", tags=["leti"])


@router.get("/schedule/{group_number}")
async def get_schedule(group_number: str):
    """Get schedule for a group from LETI API"""
    schedule = await leti_client.get_schedule(group_number)

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found for this group")

    return {"schedule": schedule}


@router.get("/groups")
async def get_groups():
    """Get list of all groups from LETI API"""
    groups = await leti_client.get_groups()

    return {"groups": groups}


@router.post("/import-schedule", response_model=dict)
async def import_schedule(
    group_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import schedule from LETI and create activities for current week"""

    # Get schedule from LETI API
    schedule = await leti_client.get_schedule(group_number)

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found for this group")

    # Get current week start (Monday)
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())

    # Map day names to dates
    day_mapping = {
        "ПОНЕДЕЛЬНИК": 0,
        "ВТОРНИК": 1,
        "СРЕДА": 2,
        "ЧЕТВЕРГ": 3,
        "ПЯТНИЦА": 4,
        "СУББОТА": 5,
        "ВОСКРЕСЕНЬЕ": 6,
    }

    imported_count = 0

    # Group lessons by time slot to handle ДВС (multiple lessons at same time)
    time_slots = {}

    for item in schedule:
        day_name = item["day"]
        if day_name not in day_mapping:
            continue

        # Calculate date for this lesson
        day_offset = day_mapping[day_name]
        lesson_date = week_start + timedelta(days=day_offset)

        # Parse time
        start_time_str = item["start_time"]
        end_time_str = item["end_time"]

        try:
            start_hour, start_min = map(int, start_time_str.split(":"))
            end_hour, end_min = map(int, end_time_str.split(":"))

            start_time = lesson_date.replace(hour=start_hour, minute=start_min, second=0)
            end_time = lesson_date.replace(hour=end_hour, minute=end_min, second=0)

            # Create time slot key
            time_key = f"{day_name}_{start_time_str}_{end_time_str}"

            if time_key not in time_slots:
                time_slots[time_key] = {
                    "lessons": [],
                    "start_time": start_time,
                    "end_time": end_time,
                    "day": day_name
                }

            time_slots[time_key]["lessons"].append(item)

        except (ValueError, AttributeError) as e:
            print(f"Error parsing time for lesson: {e}")
            continue

    # Delete existing LETI activities for this week
    db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.source == "leti",
        Activity.start_time >= week_start,
        Activity.start_time < week_start + timedelta(days=7)
    ).delete()

    # Create activities from time slots
    for time_key, slot_data in time_slots.items():
        lessons = slot_data["lessons"]

        if len(lessons) > 1:
            # Multiple lessons at same time - create ДВС activity
            lesson_titles = " / ".join([lesson["title"] for lesson in lessons])
            lesson_teachers = " / ".join([lesson["teacher"] for lesson in lessons])

            activity = Activity(
                user_id=current_user.id,
                title=f"ДВС: {lesson_titles}",
                description=f"Преподаватели: {lesson_teachers}",
                category="education",
                start_time=slot_data["start_time"],
                end_time=slot_data["end_time"],
                location="ЛЭТИ",
                source="leti",
                external_id=f"{group_number}_{time_key}",
            )
        else:
            # Single lesson
            lesson = lessons[0]
            activity = Activity(
                user_id=current_user.id,
                title=lesson["title"],
                description=f"{lesson['type']} - {lesson['teacher']}",
                category="education",
                start_time=slot_data["start_time"],
                end_time=slot_data["end_time"],
                location=f"ЛЭТИ, ауд. {lesson['room']}",
                source="leti",
                external_id=f"{group_number}_{time_key}",
            )

        db.add(activity)
        imported_count += 1

    db.commit()

    return {
        "message": f"Imported {imported_count} lessons from schedule",
        "count": imported_count
    }
