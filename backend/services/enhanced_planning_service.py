"""Enhanced AI planning service with templates and interactive mode"""
from sqlalchemy.orm import Session
from models.models import PlanTemplate, PlanningSession, User
from services.ai_service import ai_service
from datetime import datetime
import json
import uuid

class EnhancedPlanningService:
    """Service for enhanced AI planning with templates"""
    
    @staticmethod
    def create_template(
        db: Session,
        name: str,
        description: str,
        category: str,
        activities_template: dict,
        creator_id: int,
        is_public: bool = True
    ) -> PlanTemplate:
        """Create a new plan template"""
        template = PlanTemplate(
            name=name,
            description=description,
            category=category,
            activities_template=json.dumps(activities_template),
            creator_id=creator_id,
            is_public=is_public
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        return template
    
    @staticmethod
    def get_templates(db: Session, category: str = None, limit: int = 20):
        """Get available templates"""
        query = db.query(PlanTemplate).filter(PlanTemplate.is_public == True)
        
        if category:
            query = query.filter(PlanTemplate.category == category)
        
        return query.order_by(PlanTemplate.usage_count.desc()).limit(limit).all()
    
    @staticmethod
    def start_interactive_session(db: Session, user_id: int) -> str:
        """Start interactive planning session"""
        session_id = str(uuid.uuid4())
        
        session = PlanningSession(
            user_id=user_id,
            session_id=session_id,
            state=json.dumps({
                'step': 'initial',
                'messages': [],
                'preferences': {}
            })
        )
        db.add(session)
        db.commit()
        
        return session_id
    
    @staticmethod
    async def process_interactive_message(
        db: Session,
        session_id: str,
        message: str
    ) -> dict:
        """Process message in interactive session"""
        session = db.query(PlanningSession).filter(
            PlanningSession.session_id == session_id
        ).first()
        
        if not session:
            return {'error': 'Session not found'}
        
        state = json.loads(session.state)
        state['messages'].append({'role': 'user', 'content': message})
        
        # Get AI response
        context = {
            'step': state['step'],
            'preferences': state['preferences'],
            'history': state['messages']
        }
        
        ai_response = await ai_service.chat(message, context)
        
        state['messages'].append({'role': 'assistant', 'content': ai_response})
        
        # Update session
        session.state = json.dumps(state)
        session.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            'response': ai_response,
            'session_id': session_id,
            'step': state['step']
        }
    
    @staticmethod
    def get_predefined_templates():
        """Get predefined templates"""
        return [
            {
                'name': 'Продуктивный день студента',
                'description': 'Сбалансированный день с учебой, спортом и отдыхом',
                'category': 'student',
                'activities': [
                    {'title': 'Утренняя зарядка', 'category': 'health', 'duration': 30},
                    {'title': 'Лекции в университете', 'category': 'education', 'duration': 240},
                    {'title': 'Обед', 'category': 'household', 'duration': 60},
                    {'title': 'Самостоятельная работа', 'category': 'education', 'duration': 120},
                    {'title': 'Прогулка по городу', 'category': 'leisure', 'duration': 90},
                    {'title': 'Ужин с друзьями', 'category': 'social', 'duration': 120}
                ]
            },
            {
                'name': 'Выходной с культурной программой',
                'description': 'Насыщенный день с посещением музеев и достопримечательностей',
                'category': 'leisure',
                'activities': [
                    {'title': 'Завтрак в кафе', 'category': 'leisure', 'duration': 60},
                    {'title': 'Эрмитаж', 'category': 'leisure', 'duration': 180},
                    {'title': 'Обед', 'category': 'household', 'duration': 90},
                    {'title': 'Прогулка по Невскому', 'category': 'leisure', 'duration': 120},
                    {'title': 'Театр или концерт', 'category': 'leisure', 'duration': 150}
                ]
            },
            {
                'name': 'День здоровья и спорта',
                'description': 'Активный день с фокусом на здоровье',
                'category': 'health',
                'activities': [
                    {'title': 'Утренняя пробежка', 'category': 'health', 'duration': 45},
                    {'title': 'Здоровый завтрак', 'category': 'health', 'duration': 30},
                    {'title': 'Тренажерный зал', 'category': 'health', 'duration': 90},
                    {'title': 'Обед', 'category': 'household', 'duration': 60},
                    {'title': 'Йога или растяжка', 'category': 'health', 'duration': 60},
                    {'title': 'Прогулка в парке', 'category': 'health', 'duration': 90}
                ]
            }
        ]

enhanced_planning_service = EnhancedPlanningService()
