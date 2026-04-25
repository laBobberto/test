# 🔧 IMPLEMENTATION NOTES - LifeBalance SPb

Технические заметки и решения по реализации проекта

---

## 📅 2026-04-25: Начало разработки v2.0

### Этап 0: Подготовка

#### Удаление лишних файлов
Удалены 11 MD файлов:
- FINAL_REPORT.md
- FINAL_SUMMARY.md
- FINAL_TEST_REPORT.md
- TEST_REPORT.md
- TEST_RESULTS.md
- USAGE_GUIDE.md
- TESTING_GUIDE.md
- CHECKLIST.md
- PROJECT_SUMMARY.md
- GETTING_STARTED.md
- START_HERE.md

Оставлены только:
- README.md (корень, backend, frontend)
- info/* (все файлы проекта)
- docs/PLANNNN.txt

#### API Ключи
Получены и добавлены в конфигурацию:
- **OpenWeatherMap:** `5814a429e169590c4ac15e1d08d0ebb5`
- **Яндекс.Карты:** `5a5c211d-0ae2-46ec-b0d9-da08e89ebddf` (JavaScript API + HTTP Geocoder)
- **Omniroute AI:** `sk-547afbc81b7e4079-f3578f-f1712278`

---

## 🏗️ Архитектурные решения

### База данных
- **Разработка:** SQLite (./lifebalance.db)
- **Production:** PostgreSQL (будет настроено позже)
- **Миграции:** Ручные SQL скрипты (простота для MVP)

### State Management (Frontend)
- **Zustand** для глобального состояния
- **React Query** для серверного состояния и кэширования
- Разделение на store: auth, priorities, activities, stats

### API Integration
- **Axios** для HTTP запросов
- Interceptor для автоматического добавления JWT токена
- Централизованная обработка ошибок

### Styling
- **Tailwind CSS v3** - utility-first подход
- Темная тема (slate-900, slate-800)
- Responsive дизайн (mobile-first)

---

## 🔄 Паттерны разработки

### Backend Structure
```
backend/
├── api/              # API endpoints (роутеры)
├── services/         # Бизнес-логика
├── models/           # SQLAlchemy модели + Pydantic схемы
├── integrations/     # Внешние API клиенты
├── database/         # Подключение к БД
└── tests/            # Unit тесты
```

### Frontend Structure
```
frontend/src/
├── pages/            # Страницы приложения
├── components/       # Переиспользуемые компоненты
├── services/         # API клиенты
├── store/            # Zustand stores
├── types/            # TypeScript типы
└── tests/            # E2E тесты (Playwright)
```

### Naming Conventions
- **Backend:** snake_case (Python стандарт)
- **Frontend:** camelCase для переменных, PascalCase для компонентов
- **API endpoints:** kebab-case в URL
- **Database:** snake_case для таблиц и колонок

---

## 🧪 Тестирование

### Backend (Pytest)
- Unit тесты для каждого API endpoint
- Fixtures для тестовой БД
- Mock внешних API
- Цель: 80%+ покрытие

### Frontend (Playwright)
- E2E тесты для критических сценариев
- Page Object Model паттерн
- Параллельное выполнение тестов
- Цель: 95%+ покрытие пользовательских сценариев

### Test Data
- `backend/seed_test_data.py` - заполнение тестовыми данными
- `frontend/tests/helpers.ts` - утилиты для тестов
- `frontend/tests/global-setup.ts` - глобальная настройка

---

## 🔐 Безопасность

### Authentication
- JWT токены (HS256)
- Срок действия: 30 минут
- Хранение: localStorage (frontend)
- Refresh tokens: TODO в v2.1

### Password Hashing
- bcrypt с автоматической генерацией salt
- Исправлена проблема с encoding/decoding в auth.py

### CORS
- Разрешены origins: localhost:5173, localhost:3000
- Credentials: true
- Все методы и заголовки

---

## 🐛 Известные проблемы и решения

### Проблема 1: bcrypt encoding
**Проблема:** Ошибка при хешировании паролей  
**Решение:** Добавлен `.encode('utf-8')` и `.decode('utf-8')`  
**Файл:** `backend/services/auth.py`

### Проблема 2: Tailwind CSS v4 несовместимость
**Проблема:** Tailwind v4 alpha не работает с Vite  
**Решение:** Откат на Tailwind v3.4.19  
**Файл:** `frontend/package.json`

### Проблема 3: react-leaflet типы
**Проблема:** Отсутствие типов для react-leaflet  
**Решение:** Установка @types/leaflet  
**Файл:** `frontend/package.json`

---

## 📦 Зависимости

### Backend (requirements.txt)
```
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.25
pydantic>=2.6.0
pydantic-settings>=2.1.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
httpx>=0.26.0
python-dotenv>=1.0.0
alembic>=1.13.1
pytest>=8.0.0
redis>=5.0.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^7.14.2",
    "axios": "^1.15.2",
    "zustand": "^5.0.12",
    "@tanstack/react-query": "^5.100.3",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.0.10",
    "tailwindcss": "^3.4.19",
    "@playwright/test": "^1.59.1"
  }
}
```

---

## 🚀 Deployment Notes

### Environment Variables
Все чувствительные данные в `.env`:
- Database URL
- JWT Secret Key
- API Keys (OpenWeather, Yandex, Omniroute)
- Redis URL

### Production Checklist
- [ ] Переключить на PostgreSQL
- [ ] Настроить Redis для WebSocket
- [ ] Включить HTTPS
- [ ] Настроить rate limiting
- [ ] Добавить логирование (Sentry)
- [ ] Настроить CI/CD
- [ ] Backup стратегия для БД

---

## 💡 Идеи для будущих версий

### v2.1
- Refresh tokens
- Email верификация
- Password reset
- 2FA authentication

### v2.2
- Mobile приложение (React Native)
- Offline mode
- Push notifications (FCM)
- Dark/Light theme toggle

### v3.0
- Микросервисная архитектура
- GraphQL API
- Machine Learning рекомендации
- Интеграция с календарями (Google, Outlook)

---

## 📚 Полезные ссылки

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)
- [Яндекс.Карты API](https://yandex.ru/dev/maps/)
- [OpenWeatherMap API](https://openweathermap.org/api)

---

**Последнее обновление:** 2026-04-25
