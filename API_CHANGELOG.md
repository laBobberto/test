# 📡 API CHANGELOG - LifeBalance SPb

Документация изменений API от v1.0-mvp до v2.0-full

---

## 🔄 v2.0-full (В разработке)

### 🆕 Новые Endpoints

#### Activities CRUD
- `GET /api/activities/{activity_id}` - Получить одну активность
- `PUT /api/activities/{activity_id}` - Обновить активность
- `DELETE /api/activities/{activity_id}` - Удалить активность
- `PATCH /api/activities/{activity_id}/reschedule` - Перенести время

#### Maps & Geocoding
- `GET /api/maps/geocode` - Геокодирование адреса
- `GET /api/maps/reverse-geocode` - Обратное геокодирование
- `GET /api/maps/route` - Построение маршрута
- `GET /api/maps/traffic` - Информация о пробках

#### Leaderboard
- `GET /api/leaderboard/global` - Глобальный рейтинг
- `GET /api/leaderboard/by-role/{role}` - Рейтинг по роли
- `GET /api/leaderboard/by-city/{city}` - Рейтинг по городу
- `GET /api/leaderboard/weekly` - Недельный рейтинг
- `GET /api/leaderboard/monthly` - Месячный рейтинг
- `GET /api/leaderboard/me` - Моя позиция

#### AI Planning
- `POST /api/plan/interactive/start` - Начать интерактивное планирование
- `POST /api/plan/interactive/message` - Отправить сообщение в диалог
- `POST /api/plan/interactive/confirm` - Подтвердить план
- `GET /api/plan/templates` - Получить шаблоны планов
- `POST /api/plan/templates` - Создать шаблон

#### Weather
- `GET /api/weather/current` - Текущая погода
- `GET /api/weather/forecast` - Прогноз погоды

#### Social
- `POST /api/social/friends/request` - Отправить запрос в друзья
- `POST /api/social/friends/accept` - Принять запрос
- `GET /api/social/friends/list` - Список друзей
- `DELETE /api/social/friends/{friend_id}` - Удалить из друзей
- `POST /api/social/plans/share` - Поделиться планом
- `GET /api/social/plans/shared-with-me` - Планы, которыми поделились
- `POST /api/social/plans/{plan_id}/join` - Присоединиться к плану
- `POST /api/social/messages/send` - Отправить сообщение
- `GET /api/social/messages/inbox` - Входящие сообщения
- `GET /api/social/messages/conversation/{user_id}` - Переписка

#### Analytics
- `GET /api/analytics/summary` - Общая статистика
- `GET /api/analytics/by-category` - Статистика по категориям
- `GET /api/analytics/trends` - Тренды активности

#### Export/Import
- `GET /api/export/all` - Экспорт всех данных (JSON)
- `POST /api/import/activities` - Импорт активностей
- `GET /api/export/calendar` - Экспорт в iCal формат

#### WebSocket
- `WS /ws/{user_id}` - WebSocket соединение для real-time уведомлений

### 🔄 Изменения в существующих Endpoints

#### Activities
**POST /api/activities/**
- Добавлены поля: `is_custom`, `recurrence`

**Response модель ActivityResponse:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Занятие в университете",
  "description": "Лекция по математике",
  "category": "education",
  "start_time": "2026-04-26T09:00:00",
  "end_time": "2026-04-26T10:30:00",
  "location": "ЛЭТИ, корпус 1",
  "completed": false,
  "points_earned": 0,
  "created_at": "2026-04-25T10:00:00",
  "is_custom": true,
  "recurrence": {
    "type": "weekly",
    "days": [1, 3, 5],
    "end_date": "2026-06-30"
  },
  "updated_at": "2026-04-25T10:00:00"
}
```

---

## ✅ v1.0-mvp (2026-04-25)

### Существующие Endpoints

#### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

#### User
- `GET /api/user/profile` - Профиль пользователя
- `GET /api/user/priorities` - Получить приоритеты
- `PUT /api/user/priorities` - Обновить приоритеты

#### Activities
- `POST /api/activities/` - Создать активность
- `GET /api/activities/` - Получить все активности
- `POST /api/activities/complete` - Завершить активность
- `GET /api/activities/achievements` - Получить достижения
- `GET /api/activities/stats` - Статистика пользователя

#### Plan
- `POST /api/plan/generate` - Сгенерировать план с AI
- `GET /api/plan/daily` - Получить план на день
- `POST /api/plan/chat` - Чат с AI

#### Events
- `GET /api/events/` - Получить события
- `GET /api/events/{id}` - Получить событие по ID

---

## 📋 Breaking Changes

### v2.0-full
- Нет breaking changes, только добавление новых полей и endpoints
- Все существующие endpoints остаются совместимыми

---

## 🔐 Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

---

**Последнее обновление:** 2026-04-25
