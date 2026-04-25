# 🚀 Инструкция по запуску и тестированию LifeBalance SPb v3.0

## ⚠️ ВАЖНО: Сервисы должны быть запущены перед тестированием!

## 📋 Шаг 1: Запуск Backend

### Откройте первый терминал:

```bash
cd D:\Projects\DigitalSPB\backend

# Активируйте виртуальное окружение
venv\Scripts\activate

# Установите зависимости (если еще не установлены)
pip install -r requirements.txt

# Запустите сервер
python main.py
```

**Backend должен запуститься на:** http://localhost:8000

**Проверка:** Откройте http://localhost:8000/health в браузере - должно вернуть `{"status": "healthy"}`

---

## 📋 Шаг 2: Запуск Frontend

### Откройте второй терминал:

```bash
cd D:\Projects\DigitalSPB\frontend

# Установите зависимости (если еще не установлены)
npm install

# Запустите dev сервер
npm run dev
```

**Frontend должен запуститься на:** http://localhost:5173

**Проверка:** Откройте http://localhost:5173 в браузере - должна открыться страница входа

---

## 📋 Шаг 3: Запуск тестов

### Откройте третий терминал:

```bash
cd D:\Projects\DigitalSPB\frontend

# Запустите все тесты
npm test

# Или запустите конкретный тест
npm test auth.spec.ts
npm test dashboard.spec.ts
npm test social.spec.ts
```

---

## 🧪 Варианты запуска тестов

### 1. Запустить все тесты (headless)
```bash
npm test
```

### 2. Запустить тесты с UI (headed mode)
```bash
npx playwright test --headed
```

### 3. Запустить тесты в debug режиме
```bash
npx playwright test --debug
```

### 4. Запустить конкретный файл тестов
```bash
npx playwright test auth.spec.ts
npx playwright test dashboard.spec.ts
npx playwright test social.spec.ts
npx playwright test analytics.spec.ts
npx playwright test leaderboard.spec.ts
npx playwright test map.spec.ts
npx playwright test profile.spec.ts
npx playwright test chat.spec.ts
npx playwright test integration.spec.ts
npx playwright test performance.spec.ts
npx playwright test accessibility.spec.ts
```

### 5. Запустить тесты в конкретном браузере
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 6. Посмотреть HTML отчет
```bash
npx playwright show-report
```

---

## ✅ Проверка работоспособности вручную

### 1. Регистрация нового пользователя
1. Откройте http://localhost:5173
2. Нажмите "Регистрация"
3. Введите email, username, password
4. Нажмите "Зарегистрироваться"
5. Должен произойти редирект на dashboard

### 2. Создание активности
1. На dashboard нажмите FAB (кнопка +)
2. Заполните форму создания активности
3. Нажмите "Создать"
4. Активность должна появиться в списке

### 3. Проверка карты
1. Нажмите "Карта" в навигации
2. Карта должна загрузиться
3. Попробуйте построить маршрут

### 4. Проверка рейтинга
1. Нажмите "Рейтинг" в навигации
2. Должен отобразиться список пользователей
3. Попробуйте фильтры

### 5. Проверка социальных функций
1. Нажмите "Друзья" в навигации
2. Попробуйте добавить друга
3. Переключитесь на вкладку "Messages"

### 6. Проверка аналитики
1. Нажмите "Аналитика" в навигации
2. Должны отобразиться графики и статистика
3. Попробуйте экспортировать данные

---

## 🐛 Устранение проблем

### Backend не запускается
```bash
# Проверьте Python версию (должна быть 3.8+)
python --version

# Переустановите зависимости
pip install -r requirements.txt --force-reinstall

# Проверьте порт 8000
netstat -ano | findstr :8000
```

### Frontend не запускается
```bash
# Проверьте Node версию (должна быть 16+)
node --version

# Очистите кэш и переустановите
rm -rf node_modules package-lock.json
npm install

# Проверьте порт 5173
netstat -ano | findstr :5173
```

### Тесты не запускаются
```bash
# Установите Playwright browsers
npx playwright install

# Проверьте, что backend и frontend запущены
# Тесты требуют работающие сервисы!
```

### База данных не создается
```bash
cd backend
python -c "from database.connection import Base, engine; from models.models import *; Base.metadata.create_all(bind=engine); print('DB created')"
```

---

## 📊 Ожидаемые результаты тестов

### Успешный запуск:
- ✅ 280+ тестов должны пройти
- ✅ Время выполнения: 5-15 минут
- ✅ Все тесты зеленые
- ✅ HTML отчет генерируется

### Возможные предупреждения:
- ⚠️ Некоторые тесты могут быть пропущены (skipped) если функция не реализована
- ⚠️ Timeout предупреждения - нормально для медленных операций
- ⚠️ Screenshot/video создаются только при ошибках

---

## 📝 Логи и отчеты

### Где найти результаты:
- **HTML отчет:** `frontend/playwright-report/index.html`
- **Скриншоты:** `frontend/test-results/`
- **Видео:** `frontend/test-results/` (только при ошибках)
- **Traces:** `frontend/test-results/` (для debug)

### Просмотр отчета:
```bash
cd frontend
npx playwright show-report
```

---

## 🎯 Быстрый старт (все в одном)

### Вариант 1: Три терминала
```bash
# Терминал 1 - Backend
cd D:\Projects\DigitalSPB\backend
venv\Scripts\activate
python main.py

# Терминал 2 - Frontend
cd D:\Projects\DigitalSPB\frontend
npm run dev

# Терминал 3 - Tests
cd D:\Projects\DigitalSPB\frontend
npm test
```

### Вариант 2: PowerShell скрипт (создайте run-all.ps1)
```powershell
# Запуск backend в фоне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Projects\DigitalSPB\backend; .\venv\Scripts\activate; python main.py"

# Ждем 5 секунд
Start-Sleep -Seconds 5

# Запуск frontend в фоне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Projects\DigitalSPB\frontend; npm run dev"

# Ждем 10 секунд
Start-Sleep -Seconds 10

# Запуск тестов
cd D:\Projects\DigitalSPB\frontend
npm test
```

---

## ✅ Чеклист перед тестированием

- [ ] Python 3.8+ установлен
- [ ] Node.js 16+ установлен
- [ ] Backend зависимости установлены (`pip install -r requirements.txt`)
- [ ] Frontend зависимости установлены (`npm install`)
- [ ] Playwright browsers установлены (`npx playwright install`)
- [ ] Backend запущен на порту 8000
- [ ] Frontend запущен на порту 5173
- [ ] База данных создана (создается автоматически при первом запуске backend)
- [ ] .env файл настроен с API ключами

---

## 🎉 После успешного тестирования

Если все тесты прошли успешно:

1. ✅ Проект готов к production
2. ✅ Все функции работают корректно
3. ✅ Performance в норме
4. ✅ Accessibility соответствует WCAG AA
5. ✅ Можно демонстрировать заказчику

---

**Удачи с тестированием!** 🚀

Если возникнут проблемы - проверьте логи в терминалах backend и frontend.
