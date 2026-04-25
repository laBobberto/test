# Инструкция по запуску LifeBalance SPb

## 🚀 Быстрый старт

### Вариант 1: Автоматический запуск (Windows)

```powershell
.\quick-start.ps1
```

Этот скрипт автоматически:
- Создаст виртуальное окружение для Python
- Установит все зависимости
- Инициализирует базу данных
- Запустит backend и frontend

### Вариант 2: Ручной запуск

#### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
```

3. Активируйте виртуальное окружение:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Установите зависимости:
```bash
pip install -r requirements.txt
```

5. Создайте .env файл:
```bash
copy .env.example .env
```

6. Для разработки используйте SQLite (измените в .env):
```
DATABASE_URL=sqlite:///./lifebalance.db
```

7. Инициализируйте базу данных:
```bash
python init_db.py
```

8. Запустите сервер:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend запущен на http://localhost:8000
📚 API документация: http://localhost:8000/docs

#### Frontend

1. Откройте новый терминал и перейдите в директорию frontend:
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

✅ Frontend запущен на http://localhost:5173

## 🧪 Тестирование

### Запуск Playwright тестов

```bash
cd frontend
npm run test
```

### Запуск тестов с UI
```bash
npm run test:ui
```

### Запуск тестов в headed режиме
```bash
npm run test:headed
```

### Просмотр отчета о тестах
```bash
npm run test:report
```

## 📋 Проверка работоспособности

### 1. Backend Health Check

Откройте в браузере: http://localhost:8000/health

Должен вернуться:
```json
{"status": "healthy"}
```

### 2. API Documentation

Откройте: http://localhost:8000/docs

Вы увидите интерактивную документацию Swagger UI со всеми endpoints.

### 3. Frontend

Откройте: http://localhost:5173

Вы должны увидеть страницу входа/регистрации.

## 🎯 Тестовый сценарий

1. **Регистрация**
   - Откройте http://localhost:5173
   - Нажмите "Регистрация"
   - Заполните форму:
     - Email: test@example.com
     - Username: testuser
     - Password: Test123456
   - Нажмите "Продолжить"

2. **Выбор роли**
   - Выберите одну или несколько ролей (например, "Студент")
   - Нажмите "Продолжить"

3. **Настройка приоритетов**
   - Настройте слайдеры приоритетов
   - Убедитесь, что сумма = 100%
   - Нажмите "Сохранить и продолжить"

4. **Dashboard**
   - Вы попадете на главную страницу
   - Увидите статистику (баллы, стрик, и т.д.)
   - План дня (пока пустой)

5. **AI Чат**
   - Нажмите "💬 Чат с AI"
   - Попробуйте написать: "Создай план на сегодня"
   - AI сгенерирует персонализированный план

6. **Карта событий**
   - Нажмите "🗺️ События на карте"
   - Увидите карту Санкт-Петербурга
   - Можете фильтровать события по категориям

7. **Профиль**
   - Нажмите на свое имя → "Профиль"
   - Увидите статистику, приоритеты, достижения

## 🔧 Настройка Omniroute AI

Убедитесь, что Omniroute AI запущен на http://127.0.0.1:20128

Проверьте настройки в `backend/.env`:
```
OMNIROUTE_API_URL=http://127.0.0.1:20128/v1/messages
OMNIROUTE_API_KEY=sk-547afbc81b7e4079-f3578f-f1712278
OMNIROUTE_MODEL=kr/claude-sonnet-4.5
```

## 🐛 Решение проблем

### Backend не запускается

1. Проверьте, что Python 3.11+ установлен:
```bash
python --version
```

2. Проверьте, что все зависимости установлены:
```bash
pip list
```

3. Проверьте логи в терминале

### Frontend не запускается

1. Проверьте, что Node.js 20+ установлен:
```bash
node --version
```

2. Удалите node_modules и переустановите:
```bash
rm -rf node_modules
npm install
```

### База данных

Если возникли проблемы с БД, удалите файл базы данных и пересоздайте:
```bash
cd backend
rm lifebalance.db
python init_db.py
```

### CORS ошибки

Убедитесь, что backend запущен на порту 8000, а frontend на 5173.

## 📊 Структура проекта

```
DigitalSPB/
├── backend/              # FastAPI backend
│   ├── api/             # API endpoints
│   ├── services/        # Бизнес-логика
│   ├── models/          # Модели данных
│   ├── integrations/    # Внешние API
│   ├── database/        # База данных
│   ├── main.py          # Entry point
│   └── init_db.py       # Инициализация БД
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Страницы
│   │   ├── services/   # API клиенты
│   │   ├── store/      # State management
│   │   └── types/      # TypeScript типы
│   └── tests/          # Playwright тесты
│
├── docs/               # Документация
├── README.md           # Главный README
└── quick-start.ps1     # Скрипт быстрого запуска
```

## 🎨 Особенности UI

- **Темная тема** с градиентами
- **Адаптивный дизайн** (работает на мобильных)
- **Анимации** и плавные переходы
- **Интерактивная карта** с Leaflet
- **Real-time чат** с AI

## 🔐 Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- CORS настройки
- Валидация данных

## 📈 Следующие шаги

1. Настройте реальные API ключи для внешних сервисов
2. Настройте PostgreSQL для production
3. Добавьте больше тестов
4. Деплой на сервер

## 💡 Полезные команды

### Backend
```bash
# Создать миграцию
alembic revision --autogenerate -m "description"

# Применить миграции
alembic upgrade head

# Запустить тесты
pytest
```

### Frontend
```bash
# Сборка для production
npm run build

# Предпросмотр production сборки
npm run preview

# Линтинг
npm run lint
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в терминале
2. Откройте DevTools в браузере (F12)
3. Проверьте API документацию: http://localhost:8000/docs

---

**Удачи с проектом! 🚀**
