# 📋 DEVELOPMENT PLAN - LifeBalance SPb v2.0

**Дата начала:** 2026-04-25  
**Статус:** В разработке  
**Версия:** v1.0-mvp → v2.0-full

---

## 🎯 ЦЕЛЬ ПРОЕКТА

Превратить MVP в полнофункциональное production-ready приложение с:
- ✅ CRUD управлением делами
- ✅ Интеграцией Яндекс.Карт
- ✅ Системой рейтингов и лидербордом
- ✅ Улучшенным AI планированием
- ✅ Социальными функциями
- ✅ Аналитикой и статистикой
- ✅ Полным тестовым покрытием

---

## 📊 ПРОГРЕСС ПО ЭТАПАМ

### ✅ ЭТАП 0: ПОДГОТОВКА (30 мин)
- [x] 0.1 Удалить лишние MD файлы
- [x] 0.2 Создать рабочие документы
- [ ] 0.3 Обновить .env и config.py
- [ ] 0.4 Git коммит и тег v1.0-mvp

### 🔄 ЭТАП 1: CRUD УПРАВЛЕНИЕ ДЕЛАМИ (4-6 часов)
- [ ] 1.1 Backend: Обновить модели
- [ ] 1.2 Backend: CRUD endpoints
- [ ] 1.3 Backend: Миграция БД
- [ ] 1.4 Frontend: Обновить типы
- [ ] 1.5 Frontend: Обновить API сервис
- [ ] 1.6 Frontend: Создать компоненты
- [ ] 1.7 Frontend: Обновить DashboardPage
- [ ] 1.8 Backend: Unit тесты
- [ ] 1.9 Frontend: E2E тесты

### ⏳ ЭТАП 2: ЯНДЕКС.КАРТЫ (4-5 часов)
- [ ] 2.1 Backend: YandexMapsClient
- [ ] 2.2 Backend: Maps API endpoints
- [ ] 2.3 Frontend: YandexMap компонент
- [ ] 2.4 Frontend: Обновить MapPage
- [ ] 2.5 Тесты

### ⏳ ЭТАП 3: РЕЙТИНГ ПОЛЬЗОВАТЕЛЕЙ (6-8 часов)
- [ ] 3.1 Backend: Модели рейтингов
- [ ] 3.2 Backend: Leaderboard API
- [ ] 3.3 Backend: Points service
- [ ] 3.4 Frontend: LeaderboardPage
- [ ] 3.5 Frontend: Компоненты рейтинга
- [ ] 3.6 Тесты

### ⏳ ЭТАП 4: УЛУЧШЕННОЕ AI (8-10 часов)
- [ ] 4.1 Backend: Интерактивный режим
- [ ] 4.2 Backend: Шаблоны планов
- [ ] 4.3 Backend: Weather API
- [ ] 4.4 Frontend: PlanWizardPage
- [ ] 4.5 Frontend: Виджеты погоды/пробок
- [ ] 4.6 Тесты

### ⏳ ЭТАП 5: СОЦИАЛЬНЫЕ ФУНКЦИИ (10-12 часов)
- [ ] 5.1 Backend: Социальные модели
- [ ] 5.2 Backend: Social API
- [ ] 5.3 Backend: WebSocket
- [ ] 5.4 Frontend: Социальные страницы
- [ ] 5.5 Frontend: WebSocket клиент
- [ ] 5.6 Тесты

### ⏳ ЭТАП 6: ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ (4-6 часов)
- [ ] 6.1 Frontend: AnalyticsPage
- [ ] 6.2 Backend: Analytics API
- [ ] 6.3 Backend: Export/Import API
- [ ] 6.4 Тесты

### ⏳ ЭТАП 7: ТЕСТИРОВАНИЕ (8-10 часов)
- [ ] 7.1 E2E тесты Playwright
- [ ] 7.2 Backend unit тесты
- [ ] 7.3 Frontend unit тесты
- [ ] 7.4 Интеграционные тесты

### ⏳ ЭТАП 8: ФИНАЛИЗАЦИЯ (2-3 часа)
- [ ] 8.1 Обновить документацию
- [ ] 8.2 Создать CHANGELOG.md
- [ ] 8.3 Финальный коммит и тег v2.0

---

## 🔑 API КЛЮЧИ

- **OpenWeatherMap:** `5814a429e169590c4ac15e1d08d0ebb5`
- **Яндекс.Карты:** `5a5c211d-0ae2-46ec-b0d9-da08e89ebddf`
- **Omniroute AI:** `sk-547afbc81b7e4079-f3578f-f1712278`

---

## 📈 ОЦЕНКА ВРЕМЕНИ

| Этап | Время | Статус |
|------|-------|--------|
| 0. Подготовка | 30 мин | 🔄 В процессе |
| 1. CRUD дел | 4-6 ч | ⏳ Ожидание |
| 2. Яндекс.Карты | 4-5 ч | ⏳ Ожидание |
| 3. Рейтинги | 6-8 ч | ⏳ Ожидание |
| 4. AI улучшения | 8-10 ч | ⏳ Ожидание |
| 5. Социальные | 10-12 ч | ⏳ Ожидание |
| 6. Доп. функции | 4-6 ч | ⏳ Ожидание |
| 7. Тестирование | 8-10 ч | ⏳ Ожидание |
| 8. Финализация | 2-3 ч | ⏳ Ожидание |
| **ИТОГО** | **47-60 ч** | |

---

## 🛠️ ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend
- FastAPI 0.110+
- SQLAlchemy 2.0+
- SQLite (dev) / PostgreSQL (prod)
- Redis (WebSocket, кэширование)
- Pytest (тестирование)

### Frontend
- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 3
- Zustand (state)
- React Query (data fetching)
- Playwright (E2E тесты)

### External APIs
- Omniroute AI (Claude Sonnet 4.5)
- OpenWeatherMap
- Яндекс.Карты (Geocoder + JS API)
- ЛЭТИ API
- Petersburg Events API

---

## 📝 ЗАМЕТКИ

- Тесты пишутся параллельно с разработкой
- Каждый этап завершается коммитом
- Используем SQLite для разработки
- Redis для WebSocket и кэширования
- Все API ключи в .env файле

---

**Последнее обновление:** 2026-04-25
