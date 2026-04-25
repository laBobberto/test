import httpx
import json
from typing import List, Dict, Any
from config import settings

class OmnirouteAIService:
    def __init__(self):
        self.api_url = settings.OMNIROUTE_API_URL
        self.api_key = settings.OMNIROUTE_API_KEY
        self.model = settings.OMNIROUTE_MODEL
    
    async def generate_plan(self, user_data: Dict[str, Any]) -> str:
        """Generate daily plan based on user priorities and schedule"""
        
        prompt = self._build_plan_prompt(user_data)
        
        response = await self._call_api(prompt)
        return response
    
    async def chat(self, message: str, context: Dict[str, Any] = None) -> str:
        """Chat with AI assistant"""
        
        prompt = message
        if context:
            prompt = f"Context: {json.dumps(context)}\n\nUser: {message}"
        
        response = await self._call_api(prompt)
        return response
    
    def _build_plan_prompt(self, user_data: Dict[str, Any]) -> str:
        """Build prompt for daily plan generation"""
        
        priorities = user_data.get('priorities', {})
        schedule = user_data.get('schedule', [])
        events = user_data.get('events', [])
        
        prompt = f"""Ты - персональный городской ассистент LifeBalance SPb. 
Создай оптимальный план дня для пользователя на основе следующих данных:

Приоритеты пользователя:
{json.dumps(priorities, ensure_ascii=False, indent=2)}

Расписание занятий:
{json.dumps(schedule, ensure_ascii=False, indent=2)}

Доступные события в городе:
{json.dumps(events[:5], ensure_ascii=False, indent=2)}

Создай детальный план дня, который:
1. Учитывает приоритеты пользователя
2. Включает фиксированные занятия из расписания
3. Предлагает активности в свободное время
4. Балансирует разные аспекты жизни
5. Включает конкретное время и места

Формат ответа: JSON с полями activities (список активностей) и suggestions (рекомендации)."""

        return prompt
    
    async def _call_api(self, prompt: str, max_tokens: int = 2000) -> str:
        """Call Omniroute API"""
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.api_url,
                headers=headers,
                json=payload
            )
            
            # Parse SSE response
            content = ""
            for line in response.text.split('\n'):
                if line.startswith('data: '):
                    data_str = line[6:]
                    if data_str == '[DONE]':
                        break
                    try:
                        data = json.loads(data_str)
                        if data.get('type') == 'content_block_delta':
                            delta = data.get('delta', {})
                            if delta.get('type') == 'text_delta':
                                content += delta.get('text', '')
                    except json.JSONDecodeError:
                        continue
            
            return content

ai_service = OmnirouteAIService()
