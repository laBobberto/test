# LifeBalance SPb - Backend

FastAPI backend для персонального городского ассистента.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env`:
```bash
copy .env.example .env
```

4. Настройте PostgreSQL (или используйте SQLite для разработки):
```bash
# Для SQLite измените в .env:
DATABASE_URL=sqlite:///./lifebalance.db
```

5. Инициализируйте базу данных:
```bash
python init_db.py
```

## Запуск

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API будет доступен на http://localhost:8000

Документация: http://localhost:8000/docs

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Пользователь
- `GET /api/user/profile` - Профиль
- `PUT /api/user/priorities` - Обновить приоритеты
- `GET /api/user/priorities` - Получить приоритеты

### Планирование
- `POST /api/plan/generate` - Сгенерировать план с AI
- `GET /api/plan/daily` - Получить план дня
- `POST /api/plan/chat` - Чат с AI

### События
- `GET /api/events/` - Список событий
- `GET /api/events/{id}` - Детали события

### Активности
- `POST /api/activities/` - Создать активность
- `GET /api/activities/` - Список активностей
- `POST /api/activities/complete` - Отметить выполнение
- `GET /api/activities/achievements` - Достижения
- `GET /api/activities/stats` - Статистика

## Структура

```
backend/
├── api/              # API endpoints
├── database/         # Database connection
├── integrations/     # External APIs
├── models/           # SQLAlchemy models & Pydantic schemas
├── services/         # Business logic
├── config.py         # Configuration
├── main.py           # FastAPI app
└── init_db.py        # Database initialization
```
