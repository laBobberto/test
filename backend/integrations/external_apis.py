import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from config import settings

class LetiAPIClient:
    def __init__(self):
        self.base_url = settings.LETI_API_URL

    async def get_schedule(self, group_number: str) -> List[Dict[str, Any]]:
        """Get schedule for a specific group"""

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                url = f"{self.base_url}/mobile/schedule"
                params = {"groupNumber": group_number}

                response = await client.get(url, params=params)
                response.raise_for_status()

                data = response.json()

                # Parse schedule data
                schedule_items = []

                if group_number in data:
                    group_data = data[group_number]
                    days = group_data.get("days", {})

                    for day_key, day_data in days.items():
                        day_name = day_data.get("name", "")
                        lessons = day_data.get("lessons", [])

                        for lesson in lessons:
                            schedule_items.append({
                                "day": day_name,
                                "title": lesson.get("name", ""),
                                "teacher": lesson.get("teacher", ""),
                                "type": lesson.get("subjectType", ""),
                                "start_time": lesson.get("start_time", ""),
                                "end_time": lesson.get("end_time", ""),
                                "room": lesson.get("room", ""),
                                "week": lesson.get("week", ""),
                            })

                return schedule_items

            except Exception as e:
                print(f"Error fetching LETI schedule: {e}")
                return []

    async def get_groups(self) -> List[Dict[str, Any]]:
        """Get list of all groups"""

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                url = f"{self.base_url}/mobile/groups"
                response = await client.get(url)
                response.raise_for_status()

                return response.json()

            except Exception as e:
                print(f"Error fetching LETI groups: {e}")
                return []

class EventsAPIClient:
    def __init__(self):
        self.base_url = settings.EVENTS_API_URL
    
    async def get_events(
        self,
        category: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get events from Petersburg API - fetch newest events from last pages"""

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                # First request to get total count
                response = await client.get(self.base_url, params={"limit": 1})
                response.raise_for_status()
                data = response.json()

                total_count = data.get('count', 0)
                page_size = 10  # API default page size
                last_page = (total_count + page_size - 1) // page_size

                # Collect events from last pages until we have enough
                all_events = []
                current_page = last_page

                while len(all_events) < limit and current_page > 0:
                    params = {"page": current_page}
                    if category:
                        params["category"] = category

                    response = await client.get(self.base_url, params=params)
                    response.raise_for_status()
                    data = response.json()

                    # Парсим ответ в зависимости от структуры API
                    if isinstance(data, dict) and 'results' in data:
                        raw_events = data['results']
                    elif isinstance(data, list):
                        raw_events = data
                    else:
                        raw_events = []

                    # Преобразуем в нужный формат
                    for event in raw_events:
                        # Извлекаем даты из periods
                        periods = event.get('periods', [])
                        start_date = None
                        end_date = None
                        if periods and len(periods) > 0:
                            start_date = periods[0].get('lower')
                            end_date = periods[0].get('upper')

                        # Извлекаем координаты
                        coords = event.get('coordinates', [])
                        latitude = float(coords[0]) if coords and len(coords) > 0 else None
                        longitude = float(coords[1]) if coords and len(coords) > 1 else None

                        # Формируем URL изображения
                        cover = event.get('cover')
                        image_url = None
                        if cover and cover.get('url'):
                            image_url = f"https://researchinspb.ru{cover['url']}"

                        all_events.append({
                            'id': event.get('id'),
                            'title': event.get('title', 'Без названия'),
                            'description': event.get('type', {}).get('name', ''),
                            'category': event.get('type', {}).get('name', ''),
                            'start_date': start_date,
                            'end_date': end_date,
                            'location': event.get('location', ''),
                            'latitude': latitude,
                            'longitude': longitude,
                            'image_url': image_url,
                            'source_url': f"https://researchinspb.ru/event/{event.get('id')}"
                        })

                    current_page -= 1

                # Сортируем по дате начала (новые первыми) и ограничиваем
                all_events.sort(key=lambda x: x.get('start_date') or '', reverse=True)
                return all_events[:limit]
            except Exception as e:
                print(f"Error fetching events: {e}")
                import traceback
                traceback.print_exc()
                return []

leti_client = LetiAPIClient()
events_client = EventsAPIClient()
