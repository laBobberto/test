# В Потоке

**Персональный городской ассистент для Санкт-Петербурга**

Умное приложение для балансировки жизненных приоритетов с AI-планированием, геймификацией и интеграцией городских сервисов.

[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://github.com/laBobberto/test)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## О проекте

В Потоке помогает жителям и гостям Санкт-Петербурга эффективно планировать свой день, учитывая личные приоритеты, городские события, погоду и транспортную доступность.

### Ключевые возможности

- **AI-планирование** - персонализированные планы дня на основе ваших приоритетов
- **Геймификация** - баллы, достижения, стрики и рейтинги
- **Умные карты** - интеграция Яндекс.Карт с маршрутами и пробками
- **Социальные функции** - друзья, чат, совместные активности
- **Аналитика** - детальная статистика и визуализация прогресса
- **Погода** - рекомендации активностей с учетом прогноза
- **Интеграции** - расписание ЛЭТИ, события СПб

---

## Быстрый старт

### Требования

- Python 3.10+
- Node.js 18+
- npm или yarn

### Автоматическая установка (рекомендуется)

#### Linux / macOS / WSL

```bash
# Клонировать репозиторий
git clone https://github.com/laBobberto/test.git
cd test

# Запустить скрипт установки
chmod +x setup.sh
./setup.sh
```

#### Windows (PowerShell)

```powershell
# Клонировать репозиторий
git clone https://github.com/laBobberto/test.git
cd test

# Запустить скрипт установки
.\setup.ps1
```

Скрипт автоматически:
- Создаст `.env` файл из `.env.example`
- Установит все зависимости
- Инициализирует базу данных
- Создаст демо-аккаунт с тестовыми данными

### Ручная установка

#### Backend

```bash
cd backend

# Создать .env файл
cp .env.example .env

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Установить зависимости
pip install -r requirements.txt

# Инициализировать базу данных
python init_db.py

# Создать демо-аккаунт (опционально)
python create_demo_account.py

# Запустить сервер
python main.py
```

#### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

### Доступ к приложению

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Демо-аккаунт

Для быстрого тестирования используйте готовый демо-аккаунт с заполненными данными:

```
Email: demo@vpotoke.ru
Password: demo2026
```

Или создайте новый:

```bash
cd backend
python create_demo_account.py
```

---

## Архитектура

### Backend (FastAPI)

```
backend/
├── api/              # REST API endpoints (17 модулей)
├── services/         # Бизнес-логика (AI, геймификация)
├── models/           # SQLAlchemy модели и Pydantic схемы
├── integrations/     # Внешние API (ЛЭТИ, События, Погода)
└── database/         # Подключение к БД
```

**Основные API модули:**
- `auth.py` - Аутентификация и регистрация
- `plan.py` - AI-генерация планов и чат
- `activities.py` - CRUD управление активностями
- `maps.py` - Яндекс.Карты (геокодинг, маршруты, пробки)
- `leaderboard.py` - Рейтинги и геймификация
- `social.py` - Друзья и сообщения
- `analytics.py` - Статистика и аналитика
- `store.py` - Виртуальный магазин
- `challenges.py` - Ежедневные задания
- `blog.py` - Блог и статьи
- `companions.py` - AI-компаньоны
- `groups.py` - Группы пользователей

### Frontend (React + TypeScript)

```
frontend/
├── src/
│   ├── pages/        # 18 страниц приложения
│   ├── components/   # Переиспользуемые компоненты
│   ├── services/     # API клиент (Axios)
│   └── store/        # State management (Zustand)
└── tests/            # E2E тесты (Playwright)
```

**Технологии:**
- React 19 + TypeScript 6
- Vite 8 (сборка)
- Tailwind CSS 3 (стили)
- Zustand (состояние)
- TanStack Query (кэширование)
- React Router 7 (роутинг)
- Leaflet (карты)
- Recharts (графики)

---

## Основные функции

### Управление активностями
- Создание, редактирование, удаление активностей
- Перенос времени и повторяющиеся задачи
- Завершение с начислением баллов
- AI-генерация персонализированных планов

### Карты и навигация
- Интерактивная карта событий Санкт-Петербурга
- Построение маршрутов (авто, пешком, общественный транспорт)
- Информация о пробках в реальном времени
- Геокодирование адресов

### Геймификация
- Система баллов и уровней
- Достижения и бейджи
- Стрики (серии дней)
- Глобальный лидерборд с фильтрами

### Социальные функции
- Добавление друзей
- Чат с друзьями
- Совместные активности
- Лента новостей

### Аналитика
- Детальная статистика активностей
- Графики прогресса
- Разбивка по категориям
- Экспорт данных в JSON

---

## Конфигурация

### Backend (.env)

Создайте файл `backend/.env` на основе `.env.example`:

```bash
# Database
DATABASE_URL=sqlite:///./lifebalance.db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Omniroute AI (local LLM)
OMNIROUTE_API_URL=http://127.0.0.1:20128/v1/messages
OMNIROUTE_API_KEY=your-api-key
OMNIROUTE_MODEL=kr/claude-sonnet-4.5

# External APIs
LETI_API_URL=https://digital.etu.ru/api
EVENTS_API_URL=https://researchinspb.ru/api/v1/public/event/
OPENWEATHER_API_KEY=your-openweather-key
YANDEX_MAPS_API_KEY=your-yandex-maps-key
```

### Frontend

API URL настраивается в `frontend/src/services/api.ts` (по умолчанию `http://localhost:8000/api`).

---

## Скрипты для разработки

### Backend

```bash
cd backend

# Инициализация БД
python init_db.py

# Создание демо-аккаунта
python create_demo_account.py

# Создание тестового пользователя
python create_test_user.py

# Заполнение тестовыми данными
python seed_test_data.py

# Запуск сервера
python main.py
# или
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Разработка
npm run dev

# Сборка
npm run build

# Превью production сборки
npm run preview

# Линтинг
npm run lint
```

---

## Интеграции

### Внешние API

- **Omniroute AI** - локальная LLM для генерации планов (Claude Sonnet 4.5)
- **OpenWeatherMap** - прогноз погоды и рекомендации
- **Яндекс.Карты** - геокодинг, маршруты, пробки
- **ЛЭТИ API** - импорт расписания занятий для студентов
- **Petersburg Events API** - актуальные события города

---

## Статистика проекта

- **Строк кода:** ~15,000+
- **API endpoints:** 50+
- **Страниц:** 18
- **Компонентов:** 30+

