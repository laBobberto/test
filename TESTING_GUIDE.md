# 🧪 Инструкция по запуску и тестированию

## ⚠️ Важно перед запуском тестов

Для запуска Playwright тестов необходимо, чтобы **backend и frontend были запущены**.

## 📋 Предварительные требования

### 1. Установите Python 3.11+
- Скачайте с https://www.python.org/downloads/
- При установке отметьте "Add Python to PATH"
- Проверьте: `python --version`

### 2. Установите Node.js 20+
- Скачайте с https://nodejs.org/
- Проверьте: `node --version`

### 3. Убедитесь, что Omniroute AI запущен
- URL: http://127.0.0.1:20128
- API Key: sk-547afbc81b7e4079-f3578f-f1712278

## 🚀 Пошаговый запуск для тестирования

### Шаг 1: Запустите Backend

```powershell
# Откройте PowerShell в директории backend
cd D:\Projects\DigitalSPB\backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте его
.\venv\Scripts\Activate.ps1

# Установите зависимости
pip install -r requirements.txt

# Создайте .env файл
copy .env.example .env

# Инициализируйте базу данных
python init_db.py

# Запустите сервер
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend должен быть доступен на http://localhost:8000

### Шаг 2: Запустите Frontend

```powershell
# Откройте НОВЫЙ PowerShell в директории frontend
cd D:\Projects\DigitalSPB\frontend

# Установите зависимости
npm install

# Запустите dev сервер
npm run dev
```

✅ Frontend должен быть доступен на http://localhost:5173

### Шаг 3: Запустите тесты

```powershell
# В ТОМ ЖЕ окне frontend или в новом
cd D:\Projects\DigitalSPB\frontend

# Запустите все тесты
npm run test

# Или с UI интерфейсом
npm run test:ui

# Или в headed режиме (видимый браузер)
npm run test:headed
```

## 📊 Что тестируют наши тесты

### Файл: tests/e2e.spec.ts (30+ тестов)
- ✅ Страница входа/регистрации
- ✅ Онбординг (выбор ролей)
- ✅ Настройка приоритетов
- ✅ Dashboard
- ✅ AI чат
- ✅ Карта событий
- ✅ Профиль
- ✅ Навигация
- ✅ Адаптивность

### Файл: tests/extended.spec.ts (40+ тестов)
- ✅ Продвинутые UI взаимодействия
- ✅ Валидация форм
- ✅ Клавиатурная навигация
- ✅ Изменение размера окна
- ✅ Слайдеры приоритетов
- ✅ Фильтры на карте
- ✅ Обработка ошибок
- ✅ Accessibility
- ✅ Performance

### Файл: tests/advanced.spec.ts (50+ тестов)
- ✅ Copy-paste в формах
- ✅ Автозаполнение
- ✅ Быстрые отправки форм
- ✅ Drag & drop слайдеров
- ✅ Клавиши стрелок
- ✅ Многострочные сообщения
- ✅ Спецсимволы
- ✅ Анимации
- ✅ Состояния загрузки
- ✅ Сохранение состояния

## 🎯 Ожидаемые результаты

При успешном прохождении тестов вы увидите:

```
Running 120 tests using 3 workers

  ✓ tests/e2e.spec.ts:5:1 › Authentication Flow › should display login page (1.2s)
  ✓ tests/e2e.spec.ts:11:1 › Authentication Flow › should switch between login and registration (0.8s)
  ...
  ✓ tests/advanced.spec.ts:450:1 › Data Loading States › should show loading state on map (1.5s)

  120 passed (2.5m)
```

## 🐛 Если тесты падают

### Проблема: Backend не отвечает
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Решение:**
- Убедитесь, что backend запущен
- Проверьте http://localhost:8000/health
- Проверьте логи backend

### Проблема: Frontend не отвечает
```
Error: page.goto: net::ERR_CONNECTION_REFUSED
```

**Решение:**
- Убедитесь, что frontend запущен
- Проверьте http://localhost:5173
- Проверьте логи frontend

### Проблема: Omniroute AI не отвечает
```
Error: AI service timeout
```

**Решение:**
- Запустите Omniroute AI
- Проверьте http://127.0.0.1:20128
- Проверьте API ключ в backend/.env

### Проблема: Тесты медленные
```
Timeout of 30000ms exceeded
```

**Решение:**
- Увеличьте timeout в playwright.config.ts
- Проверьте производительность системы
- Запустите меньше тестов: `npx playwright test tests/e2e.spec.ts`

## 📈 Просмотр отчетов

После запуска тестов:

```powershell
# Откройте HTML отчет
npm run test:report

# Или вручную
npx playwright show-report
```

Откроется браузер с детальным отчетом:
- ✅ Какие тесты прошли
- ❌ Какие упали
- 📸 Скриншоты ошибок
- 🎬 Видео выполнения
- 📊 Статистика

## 🎬 Запись выполнения тестов

Для записи видео выполнения:

```powershell
npx playwright test --headed --video=on
```

Видео сохранятся в `test-results/`

## 🔍 Отладка конкретного теста

```powershell
# Запустить один тест
npx playwright test -g "should display login page"

# Запустить в debug режиме
npx playwright test --debug

# Запустить с UI
npx playwright test --ui
```

## ✅ Чеклист перед запуском тестов

- [ ] Python 3.11+ установлен
- [ ] Node.js 20+ установлен
- [ ] Omniroute AI запущен (опционально для полных тестов)
- [ ] Backend запущен на http://localhost:8000
- [ ] Frontend запущен на http://localhost:5173
- [ ] Backend отвечает на /health
- [ ] Frontend открывается в браузере
- [ ] Playwright browsers установлены (`npx playwright install`)

## 🎉 После успешного прохождения тестов

Вы можете быть уверены, что:
- ✅ Все страницы работают
- ✅ Все формы валидируются
- ✅ Навигация функционирует
- ✅ UI адаптивный
- ✅ Нет критических багов
- ✅ Accessibility соблюдается
- ✅ Performance приемлемый

**Проект готов к демонстрации! 🚀**

---

## 📝 Примечание

Если у вас нет возможности установить Python или запустить backend, вы можете:

1. **Запустить только frontend тесты** (без API вызовов)
2. **Использовать mock данные** в тестах
3. **Просмотреть код тестов** чтобы понять, что они проверяют

Все тесты написаны и готовы к запуску, как только backend и frontend будут доступны.
