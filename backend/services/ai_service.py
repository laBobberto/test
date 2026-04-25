import httpx
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import settings
from sqlalchemy.orm import Session


class OmnirouteAIService:
    def __init__(self):
        self.api_url = settings.OMNIROUTE_API_URL
        self.api_key = settings.OMNIROUTE_API_KEY
        self.model = settings.OMNIROUTE_MODEL

        # Define tools for schedule management
        self.tools = [
            {
                "name": "get_schedule",
                "description": "Get user's schedule for a specific date range. Returns all activities with details.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "start_date": {
                            "type": "string",
                            "description": "Start date in ISO format (YYYY-MM-DD)"
                        },
                        "end_date": {
                            "type": "string",
                            "description": "End date in ISO format (YYYY-MM-DD)"
                        }
                    },
                    "required": ["start_date", "end_date"]
                }
            },
            {
                "name": "create_activity",
                "description": "Create a new activity in user's schedule",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Activity title"},
                        "start_time": {"type": "string", "description": "Start time in ISO format"},
                        "end_time": {"type": "string", "description": "End time in ISO format"},
                        "category": {"type": "string", "description": "Category: education, career, health, leisure, social, household"},
                        "description": {"type": "string", "description": "Activity description"},
                        "location": {"type": "string", "description": "Location"}
                    },
                    "required": ["title", "start_time", "end_time", "category"]
                }
            },
            {
                "name": "update_activity",
                "description": "Update existing activity in schedule",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "activity_id": {"type": "integer", "description": "Activity ID to update"},
                        "title": {"type": "string"},
                        "start_time": {"type": "string"},
                        "end_time": {"type": "string"},
                        "description": {"type": "string"},
                        "location": {"type": "string"},
                        "completed": {"type": "boolean"}
                    },
                    "required": ["activity_id"]
                }
            },
            {
                "name": "delete_activity",
                "description": "Delete activity from schedule",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "activity_id": {"type": "integer", "description": "Activity ID to delete"}
                    },
                    "required": ["activity_id"]
                }
            },
            {
                "name": "find_free_slots",
                "description": "Find free time slots in user's schedule for a specific date",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "Date in ISO format (YYYY-MM-DD)"},
                        "duration_minutes": {"type": "integer", "description": "Minimum duration in minutes"}
                    },
                    "required": ["date"]
                }
            },
            {
                "name": "get_schedule_summary",
                "description": "Get schedule statistics and summary for analysis",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"}
                    },
                    "required": ["start_date", "end_date"]
                }
            }
        ]

    async def generate_plan(self, user_data: Dict[str, Any], db: Session) -> str:
        """Generate daily plan with tool calling support"""

        prompt = self._build_plan_prompt(user_data)
        response = await self._call_api_with_tools(prompt, user_data, db)
        return response

    async def chat(self, message: str, user_data: Dict[str, Any], db: Session) -> str:
        """Chat with AI assistant with schedule access and conversation history"""

        system_prompt = """Ты - персональный городской ассистент LifeBalance SPb.
У тебя есть полный доступ к расписанию пользователя через инструменты.
Ты можешь читать, создавать, изменять и удалять активности в расписании.
Помогай пользователю планировать день, находить свободное время и балансировать разные аспекты жизни.

ВАЖНО: Ты помнишь всю историю разговора с пользователем. Используй контекст предыдущих сообщений."""

        # Build messages with history
        conversation_history = user_data.get('conversation_history', [])

        # Start with system prompt and history
        prompt_parts = [system_prompt]

        if conversation_history:
            prompt_parts.append("\n\nИстория разговора:")
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                role_label = "Пользователь" if msg['role'] == 'user' else "Ассистент"
                prompt_parts.append(f"{role_label}: {msg['content']}")

        prompt_parts.append(f"\n\nПользователь: {message}")

        prompt = "\n".join(prompt_parts)

        response = await self._call_api_with_tools(prompt, user_data, db)
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

    async def _call_api_with_tools(
        self,
        prompt: str,
        user_data: Dict[str, Any],
        db: Session,
        max_iterations: int = 5
    ) -> str:
        """Call API with tool calling support"""

        from services.ai_schedule_service import ai_schedule_service

        user_id = user_data.get('user_id')
        messages = [{"role": "user", "content": prompt}]

        for iteration in range(max_iterations):
            headers = {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }

            payload = {
                "model": self.model,
                "max_tokens": 4000,
                "messages": messages,
                "tools": self.tools
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload
                )

                # Check response status
                if response.status_code != 200:
                    print(f"API error: {response.status_code}")
                    return f"Ошибка API: {response.status_code}"

                # Parse SSE response and collect all content blocks
                content_blocks = []
                current_block = None
                stop_reason = None

                for line in response.text.split('\n'):
                    if line.startswith('data: '):
                        data_str = line[6:]
                        if data_str == '[DONE]':
                            break
                        try:
                            data = json.loads(data_str)

                            # Start of new content block
                            if data.get('type') == 'content_block_start':
                                current_block = data.get('content_block', {})
                                if current_block.get('type') == 'text':
                                    current_block['text'] = ''
                                elif current_block.get('type') == 'tool_use':
                                    current_block['input'] = {}

                            # Delta updates to current block
                            elif data.get('type') == 'content_block_delta':
                                delta = data.get('delta', {})
                                if delta.get('type') == 'text_delta' and current_block:
                                    current_block['text'] = current_block.get('text', '') + delta.get('text', '')
                                elif delta.get('type') == 'input_json_delta' and current_block:
                                    # Accumulate JSON input for tool
                                    if 'partial_json' not in current_block:
                                        current_block['partial_json'] = ''
                                    current_block['partial_json'] += delta.get('partial_json', '')

                            # End of content block
                            elif data.get('type') == 'content_block_stop':
                                if current_block:
                                    # Parse tool input if it's a tool_use block
                                    if current_block.get('type') == 'tool_use' and 'partial_json' in current_block:
                                        try:
                                            current_block['input'] = json.loads(current_block['partial_json'])
                                            del current_block['partial_json']
                                        except:
                                            pass
                                    content_blocks.append(current_block)
                                    current_block = None

                            # Get stop reason
                            elif data.get('type') == 'message_delta':
                                delta = data.get('delta', {})
                                if delta.get('stop_reason'):
                                    stop_reason = delta['stop_reason']

                        except json.JSONDecodeError:
                            continue

                # Build result object
                result = {
                    'content': content_blocks,
                    'stop_reason': stop_reason or 'end_turn'
                }

                # Check if model wants to use tools
                if result.get('stop_reason') == 'tool_use':
                    content = result.get('content', [])

                    # Execute tool calls
                    tool_results = []
                    for block in content:
                        if block.get('type') == 'tool_use':
                            tool_name = block.get('name')
                            tool_input = block.get('input', {})
                            tool_id = block.get('id')

                            # Execute tool
                            tool_result = await self._execute_tool(
                                tool_name,
                                tool_input,
                                user_id,
                                db,
                                ai_schedule_service
                            )

                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_id,
                                "content": json.dumps(tool_result, ensure_ascii=False)
                            })

                    # Add assistant response and tool results to messages
                    messages.append({"role": "assistant", "content": content})
                    messages.append({"role": "user", "content": tool_results})

                else:
                    # Final response
                    content = result.get('content', [])
                    text_content = ""
                    for block in content:
                        if block.get('type') == 'text':
                            text_content += block.get('text', '')

                    return text_content

        return "Превышено максимальное количество итераций"

    async def _execute_tool(
        self,
        tool_name: str,
        tool_input: Dict,
        user_id: int,
        db: Session,
        schedule_service
    ) -> Dict:
        """Execute tool function"""

        try:
            if tool_name == "get_schedule":
                start_date = datetime.fromisoformat(tool_input['start_date'])
                end_date = datetime.fromisoformat(tool_input['end_date'])
                return schedule_service.get_user_schedule(db, user_id, start_date, end_date)

            elif tool_name == "create_activity":
                start_time = datetime.fromisoformat(tool_input['start_time'])
                end_time = datetime.fromisoformat(tool_input['end_time'])
                return schedule_service.create_activity(
                    db, user_id,
                    title=tool_input['title'],
                    start_time=start_time,
                    end_time=end_time,
                    category=tool_input.get('category', 'other'),
                    description=tool_input.get('description', ''),
                    location=tool_input.get('location', '')
                )

            elif tool_name == "update_activity":
                updates = {k: v for k, v in tool_input.items() if k != 'activity_id'}
                if 'start_time' in updates:
                    updates['start_time'] = datetime.fromisoformat(updates['start_time'])
                if 'end_time' in updates:
                    updates['end_time'] = datetime.fromisoformat(updates['end_time'])

                return schedule_service.update_activity(
                    db, user_id,
                    tool_input['activity_id'],
                    **updates
                )

            elif tool_name == "delete_activity":
                return schedule_service.delete_activity(
                    db, user_id,
                    tool_input['activity_id']
                )

            elif tool_name == "find_free_slots":
                date = datetime.fromisoformat(tool_input['date'])
                duration = tool_input.get('duration_minutes', 60)
                return schedule_service.find_free_slots(db, user_id, date, duration)

            elif tool_name == "get_schedule_summary":
                start_date = datetime.fromisoformat(tool_input['start_date'])
                end_date = datetime.fromisoformat(tool_input['end_date'])
                return schedule_service.get_schedule_summary(db, user_id, start_date, end_date)

            else:
                return {"error": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"error": str(e)}

ai_service = OmnirouteAIService()
