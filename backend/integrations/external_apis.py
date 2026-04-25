import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from config import settings

class LetiAPIClient:
    def __init__(self):
        self.base_url = settings.LETI_API_URL
    
    async def get_schedule(self, group_number: str, date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get schedule for a group"""
        
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                # Примерный endpoint - нужно уточнить по документации
                response = await client.get(
                    f"{self.base_url}/schedule",
                    params={"group": group_number, "date": date}
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error fetching LETI schedule: {e}")
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
        """Get events from Petersburg API"""
        
        if not date_from:
            date_from = datetime.now().strftime("%Y-%m-%d")
        if not date_to:
            date_to = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                params = {
                    "date_from": date_from,
                    "date_to": date_to,
                    "limit": limit
                }
                if category:
                    params["category"] = category
                
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Парсим ответ в зависимости от структуры API
                if isinstance(data, dict) and 'results' in data:
                    return data['results']
                elif isinstance(data, list):
                    return data
                else:
                    return []
            except Exception as e:
                print(f"Error fetching events: {e}")
                return []

leti_client = LetiAPIClient()
events_client = EventsAPIClient()
