# LifeBalance SPb

Персональный городской ассистент для Санкт-Петербурга с AI-планированием, геймификацией и интеграцией городских сервисов.

## 🎯 Описание

LifeBalance SPb помогает пользователям балансировать разные аспекты жизни в Петербурге через:
- 🤖 AI-персонализацию и рекомендации
- 🗺️ Умную навигацию и маршруты
- 🎮 Геймификацию и достижения
- 📊 Настраиваемые приоритеты

## 🏗️ Архитектура

```
DigitalSPB/
├── backend/          # FastAPI backend
│   ├── api/         # REST API endpoints
│   ├── services/    # Бизнес-логика (AI, геймификация)
│   ├── models/      # SQLAlchemy модели
│   ├── integrations/# Внешние API (ЛЭТИ, События)
│   └── database/    # База данных
│
├── frontend/        # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/   # Страницы приложения
│   │   ├── services/# API клиенты
│   │   ├── store/   # State management
│   │   └── types/   # TypeScript типы
│   └── public/
│
└── docs/            # Документация проекта
```

## 🚀 Быстрый старт

### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте `.env` файл:
```bash
copy .env.example .env
```

5. Для разработки можно использовать SQLite (измените в .env):
```
DATABASE_URL=sqlite:///./lifebalance.db
```

6. Инициализируйте базу данных:
```bash
python init_db.py
```

7. Запустите сервер:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на http://localhost:8000
API документация: http://localhost:8000/docs

### Frontend

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev сервер:
```bash
npm run dev
```

Frontend будет доступен на http://localhost:5173

## 🔑 Основные функции

### Для пользователей

- **Онбординг**: Выбор роли (студент/житель/турист) и настройка приоритетов
- **AI-планирование**: Генерация персонализированного плана дня
- **Карта событий**: Интерактивная карта с событиями города
- **AI-чат**: Общение с ассистентом для корректировки планов
- **Геймификация**: Баллы, достижения, стрики за выполнение активностей
- **Статистика**: Отслеживание прогресса и баланса приоритетов

### Интеграции

- **Omniroute AI**: Локальная LLM для генерации планов
- **ЛЭТИ API**: Импорт расписания занятий
- **События СПб**: Актуальные события города
- **Leaflet Maps**: Интерактивные карты

## 🛠️ Технологии

### Backend
- FastAPI
- SQLAlchemy + PostgreSQL/SQLite
- Pydantic
- JWT Authentication
- Httpx (async HTTP)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- TanStack Query
- Leaflet (карты)
- Axios

## 📱 Скриншоты

### Онбординг
Выбор роли и настройка приоритетов

### Dashboard
Главная страница с планом дня и статистикой

### AI Чат
Общение с персональным ассистентом

### Карта событий
Интерактивная карта с событиями города

## 🎮 Геймификация

- **Баллы**: За выполнение активностей
- **Стрики**: Серии дней с выполненными целями
- **Достижения**: Бейджи за разные активности
- **Баланс**: Оценка соблюдения приоритетов

## 🔐 Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- CORS настройки
- Валидация данных с Pydantic

## 📊 API Endpoints

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
- `GET /api/activities/stats` - Статистика

## 🧪 Тестирование

Playwright тесты для E2E тестирования всех флоу приложения.

```bash
cd frontend
npm run test:e2e
```

## 👥 Команда

Проект создан для хакатона "Цифровой Петербург" 2026

## 📄 Лицензия

MIT

## 🤝 Вклад

Приветствуются pull requests и issues!

## 📞 Контакты

- GitHub: [DigitalSPB](https://github.com/yourusername/DigitalSPB)
- Email: team@lifebalance-spb.ru

---

**Сделано с ❤️ для Санкт-Петербурга**
