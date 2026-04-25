# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeBalance SPb is a personal urban assistant for Saint Petersburg with AI-powered planning, gamification, and city services integration. The application helps users balance different life aspects through personalized recommendations, activity tracking, and social features.

**Tech Stack:**
- Backend: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- AI: Omniroute AI (local LLM) for plan generation and chat
- Maps: Leaflet with Yandex Maps integration
- State: Zustand + TanStack Query

## Development Commands

### Backend

```bash
cd backend

# Setup
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Database initialization
python init_db.py

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# or
python main.py

# Create test user
python create_test_user.py

# Seed test data
python seed_test_data.py
```

Backend runs on http://localhost:8000
API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Setup
npm install

# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing
npm test             # Run all Playwright tests
npm run test:ui      # Run tests with Playwright UI
npm run test:headed  # Run tests in headed mode
npm run test:report  # Show test report
```

### Quick Start (PowerShell)

```powershell
.\start-services.ps1  # Start both backend and frontend
```

## Architecture

### Backend Structure

```
backend/
├── api/              # FastAPI route handlers
│   ├── auth.py      # Authentication (register, login)
│   ├── user.py      # User profile and priorities
│   ├── plan.py      # AI plan generation and chat
│   ├── activities.py # Activity CRUD and completion
│   ├── events.py    # City events
│   ├── maps.py      # Yandex Maps integration
│   ├── social.py    # Social features (friends, posts)
│   ├── analytics.py # User analytics and insights
│   ├── leaderboard.py # Gamification leaderboard
│   └── weather.py   # Weather data
├── services/        # Business logic
│   ├── ai_service.py              # Omniroute AI integration
│   ├── enhanced_planning_service.py # Plan generation logic
│   ├── points_service.py          # Gamification points
│   └── auth.py                    # JWT token handling
├── models/
│   ├── models.py    # SQLAlchemy ORM models
│   └── schemas.py   # Pydantic request/response schemas
├── integrations/    # External API clients
│   ├── external_apis.py  # LETI API, Events API
│   ├── weather_api.py    # OpenWeather integration
│   └── yandex_maps.py    # Yandex Maps geocoding
├── database/
│   └── connection.py # SQLAlchemy setup
├── config.py        # Settings (loads from .env)
└── main.py          # FastAPI app entry point
```

**Key Models:**
- `User`: email, username, roles (student/resident/tourist)
- `Priority`: user priorities by category (education, career, health, leisure, social, household)
- `Activity`: scheduled activities with completion tracking, points, recurrence
- `Event`: cached city events with location data
- `Achievement`: gamification achievements
- `UserAchievement`: earned achievements

**Authentication:** JWT tokens with Bearer scheme. All protected endpoints require `Authorization: Bearer <token>` header.

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/           # Route components
│   │   ├── AuthPage.tsx        # Login/Register
│   │   ├── OnboardingPage.tsx  # Role selection
│   │   ├── PrioritiesPage.tsx  # Priority configuration
│   │   ├── DashboardPage.tsx   # Main page with daily plan
│   │   ├── ChatPage.tsx        # AI assistant chat
│   │   ├── MapPage.tsx         # City events map
│   │   ├── SocialPage.tsx      # Social feed
│   │   ├── AnalyticsPage.tsx   # User analytics
│   │   ├── LeaderboardPage.tsx # Gamification leaderboard
│   │   └── ProfilePage.tsx     # User profile
│   ├── components/      # Reusable components
│   │   ├── ActivityCard.tsx
│   │   ├── ActivityCreateForm.tsx
│   │   ├── ActivityEditModal.tsx
│   │   ├── ActivityDeleteConfirm.tsx
│   │   ├── ActivityRescheduleModal.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── YandexMap.tsx
│   ├── services/
│   │   └── api.ts       # Axios API client with auth interceptors
│   ├── store/           # Zustand stores (auth, user state)
│   └── App.tsx          # Router setup with protected routes
└── tests/               # Playwright E2E tests
```

**Routing:**
- `/` - Auth page (login/register)
- `/onboarding` - Role selection
- `/priorities` - Priority configuration
- `/dashboard` - Main dashboard (protected)
- `/chat` - AI chat (protected)
- `/map` - Events map (protected)
- `/social` - Social feed (protected)
- `/analytics` - Analytics (protected)
- `/leaderboard` - Leaderboard (protected)
- `/profile` - User profile (protected)

**State Management:**
- Zustand for auth state and user data
- TanStack Query for server state caching
- API client in `services/api.ts` handles token injection

## Configuration

### Backend Environment (.env)

Required variables:
```bash
DATABASE_URL=sqlite:///./lifebalance.db  # or PostgreSQL URL
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Omniroute AI (local LLM)
OMNIROUTE_API_URL=http://127.0.0.1:20128/v1/messages
OMNIROUTE_API_KEY=your-api-key
OMNIROUTE_MODEL=kr/claude-sonnet-4.5

# External APIs
LETI_API_URL=https://digital.etu.ru/api
EVENTS_API_URL=https://researchinspb.ru/api/v1/public/event/
OPENWEATHER_API_KEY=your-key
YANDEX_MAPS_API_KEY=your-key
```

Copy `.env.example` to `.env` and configure. For development, SQLite is sufficient.

### Frontend Configuration

Backend API URL is hardcoded in `services/api.ts` as `http://localhost:8000/api`. Update if backend runs on different host/port.

## Key Features

### AI Planning
- Uses Omniroute AI (local LLM) to generate personalized daily plans
- Considers user priorities, schedule, and city events
- Chat interface for plan adjustments
- Implementation in `backend/services/ai_service.py` and `backend/api/plan.py`

### Gamification
- Points system for completed activities
- Achievements and badges
- Streak tracking
- Leaderboard with friends
- Implementation in `backend/services/points_service.py`

### Activity Management
- Create, edit, delete, reschedule activities
- Mark activities as complete
- Recurring activities support
- Custom and AI-generated activities
- Activity categories match priority categories

### Social Features
- Friend system
- Activity sharing
- Social feed with posts
- Leaderboard comparison

### External Integrations
- **LETI API**: Import university schedule for students
- **Events API**: Fetch Saint Petersburg city events
- **Yandex Maps**: Geocoding and location services
- **OpenWeather**: Weather data for planning

## Testing

Comprehensive E2E test suite with Playwright (280+ tests):
- Authentication flows
- Onboarding and priority setup
- Dashboard and activity management
- Social features
- Analytics and leaderboard
- Map interactions
- Accessibility (axe-core)
- Performance metrics

Run tests with backend and frontend running:
```bash
cd frontend
npm test                    # All tests
npm test auth.spec.ts       # Specific test file
npm run test:ui             # Interactive UI mode
```

## Database

SQLAlchemy ORM with automatic table creation on startup (`main.py` calls `Base.metadata.create_all`).

For migrations, use `backend/migrations/` directory. Example: `add_activity_fields.py` adds new columns to activities table.

To reset database:
```bash
cd backend
rm lifebalance.db  # if using SQLite
python init_db.py
```

## Common Patterns

### Adding a New API Endpoint

1. Define Pydantic schemas in `backend/models/schemas.py`
2. Create route handler in appropriate `backend/api/*.py` file
3. Add router to `backend/main.py` if new module
4. Update frontend API client in `frontend/src/services/api.ts`
5. Add TypeScript types if needed

### Adding a New Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Wrap with `ProtectedRoute` if authentication required
4. Add navigation links in relevant components

### Working with AI Service

The AI service (`backend/services/ai_service.py`) uses Omniroute AI API. Prompts are in Russian for Saint Petersburg context. When modifying prompts:
- Keep context about user priorities and schedule
- Include city events for recommendations
- Format responses as structured JSON when needed

## Notes

- All user-facing text is in Russian (Saint Petersburg audience)
- Code, comments, and commit messages are in English
- Dark theme with gradients is the design system
- Mobile-first responsive design
- JWT tokens stored in Zustand persist middleware
