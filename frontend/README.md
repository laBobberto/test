# LifeBalance SPb - Frontend

React + TypeScript + Vite фронтенд для персонального городского ассистента.

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **Tailwind CSS** - Стили
- **React Router** - Навигация
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Axios** - HTTP клиент
- **Leaflet** - Карты
- **Recharts** - Графики

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно на http://localhost:5173

## Сборка

```bash
npm run build
```

## Структура

```
frontend/
├── src/
│   ├── pages/           # Страницы приложения
│   │   ├── AuthPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── PrioritiesPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── MapPage.tsx
│   │   └── ProfilePage.tsx
│   ├── components/      # Переиспользуемые компоненты
│   ├── services/        # API клиенты
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript типы
│   ├── App.tsx          # Главный компонент
│   ├── main.tsx         # Entry point
│   └── index.css        # Глобальные стили
├── public/
└── package.json
```

## Основные страницы

- `/` - Вход/Регистрация
- `/onboarding` - Выбор ролей
- `/priorities` - Настройка приоритетов
- `/dashboard` - Главная страница с планом дня
- `/chat` - AI чат-ассистент
- `/map` - Карта событий города
- `/profile` - Профиль пользователя

## API Integration

Backend API должен быть запущен на http://localhost:8000

Все API запросы проходят через `src/services/api.ts`

## Дизайн

- Темная тема с градиентами
- Адаптивный дизайн (mobile-first)
- Анимации и transitions
- Кастомные компоненты (buttons, cards, inputs)
