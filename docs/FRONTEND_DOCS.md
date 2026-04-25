# Frontend Documentation - LifeBalance SPb

## Обзор

LifeBalance SPb - это персональный городской ассистент для Санкт-Петербурга с AI-планированием, геймификацией и интеграцией городских сервисов.

**Технологический стек:**
- React 18 + TypeScript + Vite
- Tailwind CSS для стилизации
- Zustand для управления состоянием
- TanStack Query для кэширования данных
- Framer Motion для анимаций
- React Router для навигации
- Axios для HTTP запросов

## Структура проекта

```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── animations/      # Компоненты анимаций
│   │   ├── challenges/      # Компоненты челленджей и квестов
│   │   ├── onboarding/      # Компоненты онбординг-туров
│   │   ├── skeletons/       # Компоненты скелетонов загрузки
│   │   ├── ActivityCard.tsx
│   │   ├── BlogPostCard.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── CompanionPostCard.tsx
│   │   ├── CurrencyBalance.tsx
│   │   ├── DraggableActivityCard.tsx
│   │   ├── EventGroupCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── QuestCard.tsx
│   │   ├── StoreItemCard.tsx
│   │   └── Toast.tsx
│   ├── hooks/               # Кастомные хуки
│   │   └── useActivities.ts
│   ├── pages/               # Страницы приложения
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── BlogPostPage.tsx
│   │   ├── ChallengesPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FriendsPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── MyCompanionsPage.tsx
│   │   ├── MyPurchasesPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── PrioritiesPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── QuestsPage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── SocialPage.tsx
│   │   └── StorePage.tsx
│   ├── services/            # API клиенты
│   │   └── api.ts
│   ├── store/               # Zustand stores
│   │   ├── index.ts
│   │   └── onboardingStore.ts
│   ├── types/               # TypeScript типы
│   │   └── index.ts
│   ├── App.tsx              # Главный компонент с роутингом
│   ├── index.css            # Глобальные стили
│   └── main.tsx             # Точка входа
├── tests/                   # E2E тесты (Playwright)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Основные функции

### 1. Онбординг-туры

Интерактивные туры для новых пользователей с использованием react-joyride.

**Компоненты:**
- `OnboardingTour.tsx` - Основной компонент тура
- `tourSteps.ts` - Конфигурация шагов для разных страниц

**Store:**
```typescript
// src/store/onboardingStore.ts
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      currentTour: null,
      showTour: false,
      startTour: (tour) => set({ currentTour: tour, showTour: true }),
      completeTour: (tour) => set((state) => ({
        completedTours: [...state.completedTours, tour],
        currentTour: null,
        showTour: false,
      })),
      skipTour: () => set({ currentTour: null, showTour: false }),
      resetTours: () => set({ completedTours: [], currentTour: null, showTour: false }),
      isTourCompleted: (tour) => get().completedTours.includes(tour),
    }),
    { name: 'onboarding-storage' }
  )
);
```

**Использование:**
```tsx
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
import { dashboardTourSteps } from '../components/onboarding/tourSteps';

// В компоненте страницы
<OnboardingTour tourType="dashboard" steps={dashboardTourSteps} />
```

**Data-tour атрибуты:**
Добавьте `data-tour="element-name"` к элементам, которые нужно выделить в туре.

### 2. Анимации

Используется framer-motion для плавных анимаций и микроинтерактивности.

**Компоненты:**
- `AnimatedNumber.tsx` - Анимированные числа для статистики
- `ConfettiEffect.tsx` - Эффект конфетти при достижениях
- `PageTransition.tsx` - Переходы между страницами

**Примеры использования:**

```tsx
// Анимированное число
<AnimatedNumber value={stats.total_points} suffix="" />

// Конфетти при завершении активности
import { triggerConfetti } from './animations/ConfettiEffect';
triggerConfetti();

// Анимированная карточка
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  {/* Контент */}
</motion.div>
```

### 3. Скелетоны загрузки

Компоненты скелетонов для улучшения воспринимаемой производительности.

**Доступные скелетоны:**
- `Skeleton.tsx` - Базовый компонент
- `ActivityCardSkeleton.tsx` - Для карточек активностей
- `StatsCardSkeleton.tsx` - Для карточек статистики
- `EventCardSkeleton.tsx` - Для карточек событий
- `ChatMessageSkeleton.tsx` - Для сообщений чата
- `ProfileSkeleton.tsx` - Для страницы профиля

**Использование:**
```tsx
if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCardSkeleton count={4} />
    </div>
  );
}
```

### 4. Оптимистичные обновления

TanStack Query с оптимистичными мутациями для мгновенной реакции UI.

**Хук useActivities:**
```tsx
import { useActivities } from '../hooks/useActivities';

const { createActivity, updateActivity, deleteActivity, completeActivity, isLoading } = useActivities();

// Создание активности
createActivity({
  title: 'Новая активность',
  category: 'health',
  start_time: '2026-04-26T10:00:00',
  end_time: '2026-04-26T11:00:00',
});

// Обновление
updateActivity({ id: 1, data: { title: 'Обновленное название' } });

// Удаление
deleteActivity(1);

// Завершение
completeActivity(1);
```

**Toast уведомления:**
```tsx
import { toast } from 'sonner';

toast.success('Успешно!');
toast.error('Ошибка!');
toast.info('Информация');
```

### 5. Drag & Drop

Перетаскивание активностей с использованием @dnd-kit.

**Компонент DraggableActivityCard:**
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableActivityCard } from '../components/DraggableActivityCard';

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={activities.map((a) => a.id)}
    strategy={verticalListSortingStrategy}
  >
    {activities.map((activity) => (
      <DraggableActivityCard
        key={activity.id}
        activity={activity}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onComplete={handleCompleteActivity}
        onReschedule={openRescheduleModal}
      />
    ))}
  </SortableContext>
</DndContext>
```

### 6. Челленджи и Квесты

Система геймификации с челленджами и квестами.

**API методы:**
```typescript
import { challengesAPI, questsAPI } from '../services/api';

// Челленджи
const challenges = await challengesAPI.getChallenges();
await challengesAPI.acceptChallenge(id);
await challengesAPI.completeChallenge(id);

// Квесты
const quests = await questsAPI.getQuests();
await questsAPI.startQuest(id);
await questsAPI.completeQuestStep(questId, stepId);
```

**Компоненты:**
- `ChallengeCard.tsx` - Карточка челленджа с прогресс-баром
- `QuestCard.tsx` - Карточка квеста с шагами

**Страницы:**
- `/challenges` - Список челленджей с фильтрацией
- `/quests` - Список квестов

### 7. Виртуальная валюта и магазин

Система внутренней валюты для обмена на награды.

**API методы:**
```typescript
import { currencyAPI } from '../services/api';

// Баланс
const balance = await currencyAPI.getBalance();

// Транзакции
const transactions = await currencyAPI.getTransactions(50);

// Магазин
const items = await currencyAPI.getStoreItems('discount');
await currencyAPI.purchaseItem(itemId);

// Покупки
const purchases = await currencyAPI.getPurchases();
await currencyAPI.useItem(purchaseId);
```

**Компоненты:**
- `CurrencyBalance.tsx` - Отображение баланса в Navigation
- `StoreItemCard.tsx` - Карточка товара в магазине

**Страницы:**
- `/store` - Магазин с категориями товаров
- `/purchases` - История покупок и активные промокоды

### 8. Блог и новости

Система блога с поддержкой Markdown.

**API методы:**
```typescript
import { blogAPI } from '../services/api';

// Посты
const posts = await blogAPI.getPosts({ category: 'news', limit: 10 });
const post = await blogAPI.getPost(slug);
await blogAPI.likePost(id);

// Категории
const categories = await blogAPI.getCategories();

// Поиск
const results = await blogAPI.searchPosts('query');
```

**Компоненты:**
- `BlogPostCard.tsx` - Карточка поста с превью
- Markdown рендеринг с react-markdown

**Страницы:**
- `/blog` - Список постов с поиском и фильтрацией
- `/blog/:slug` - Полный пост с Markdown контентом

### 9. Поиск попутчиков

Система поиска компании для посещения событий.

**API методы:**
```typescript
import { companionsAPI } from '../services/api';

// Объявления
const posts = await companionsAPI.getCompanionPosts(eventId);
await companionsAPI.createCompanionPost({ event_id, message, max_companions });
await companionsAPI.sendCompanionRequest(postId, message);

// Группы
const groups = await companionsAPI.getEventGroups(eventId);
await companionsAPI.createEventGroup({ event_id, name, description, max_members });
await companionsAPI.joinEventGroup(groupId);
await companionsAPI.leaveEventGroup(groupId);
```

**Компоненты:**
- `CompanionPostCard.tsx` - Карточка объявления о поиске
- `EventGroupCard.tsx` - Карточка группы события

**Страницы:**
- `/companions` - Управление объявлениями и группами

## Маршруты

### Публичные маршруты
- `/` - Страница авторизации
- `/onboarding` - Выбор роли пользователя
- `/priorities` - Настройка приоритетов

### Защищенные маршруты
- `/dashboard` - Главная страница с планом дня
- `/map` - Карта событий Санкт-Петербурга
- `/chat` - AI чат-ассистент
- `/schedule` - Расписание активностей
- `/challenges` - Челленджи
- `/quests` - Квесты
- `/store` - Магазин наград
- `/purchases` - Мои покупки
- `/blog` - Блог и новости
- `/blog/:slug` - Отдельный пост
- `/companions` - Поиск попутчиков
- `/leaderboard` - Таблица лидеров
- `/groups` - Группы по интересам
- `/friends` - Друзья
- `/analytics` - Аналитика активности
- `/profile` - Профиль пользователя

## Управление состоянием

### Zustand Stores

**authStore:**
```typescript
const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
```

**prioritiesStore:**
```typescript
const { priorities, setPriorities } = usePrioritiesStore();
```

**activitiesStore:**
```typescript
const { activities, setActivities, addActivity, updateActivity } = useActivitiesStore();
```

**statsStore:**
```typescript
const { stats, setStats } = useStatsStore();
```

**onboardingStore:**
```typescript
const { startTour, completeTour, skipTour, isTourCompleted } = useOnboardingStore();
```

## Стилизация

### CSS переменные

Приложение использует CSS переменные для темизации:

```css
:root {
  --bg-primary: #F5F3FF;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #EDE9FE;
  --text-primary: #1E1B4B;
  --text-secondary: #4C1D95;
  --accent-primary: #6366F1;
  --accent-secondary: #8B5CF6;
  --border-primary: #DDD6FE;
}

[data-theme="dark"] {
  --bg-primary: #1A0B2E;
  --bg-secondary: #2D1B4E;
  --text-primary: #E9D5FF;
  /* ... */
}
```

### Tailwind классы

**Кнопки:**
- `.btn-primary` - Основная кнопка
- `.btn-secondary` - Вторичная кнопка

**Карточки:**
- `.card` - Базовая карточка
- `.card-hover` - Карточка с hover эффектом

**Инпуты:**
- `.input` - Стилизованный input

**Утилиты:**
- `.glass` - Эффект стекла
- `.gradient-text` - Градиентный текст
- `.skeleton-shimmer` - Shimmer эффект для скелетонов

### Анимации

```css
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-slide-in { animation: slideIn 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.4s ease-out; }
```

## API клиент

### Конфигурация

```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Автоматическое добавление токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Доступные API модули

- `authAPI` - Авторизация
- `userAPI` - Пользователи
- `prioritiesAPI` - Приоритеты
- `activitiesAPI` - Активности
- `planAPI` - AI планирование
- `eventsAPI` - События города
- `achievementsAPI` - Достижения
- `groupsAPI` - Группы
- `friendsAPI` - Друзья
- `leaderboardAPI` - Таблица лидеров
- `chatsAPI` - Чаты
- `challengesAPI` - Челленджи
- `questsAPI` - Квесты
- `currencyAPI` - Виртуальная валюта
- `blogAPI` - Блог
- `companionsAPI` - Попутчики

## Тестирование

### Playwright E2E тесты

```bash
# Запуск всех тестов
npm test

# Запуск с UI
npm run test:ui

# Запуск в headed режиме
npm run test:headed

# Показать отчет
npm run test:report
```

**Структура тестов:**
```
tests/
├── auth.spec.ts           # Тесты авторизации
├── dashboard.spec.ts      # Тесты главной страницы
├── activities.spec.ts     # Тесты активностей
├── social.spec.ts         # Тесты социальных функций
└── accessibility.spec.ts  # Тесты доступности
```

## Разработка

### Команды

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Превью продакшен сборки
npm run preview

# Линтинг
npm run lint
```

### Добавление новой страницы

1. Создайте компонент страницы в `src/pages/`
2. Добавьте маршрут в `src/App.tsx`
3. Оберните в `<ProtectedRoute>` если требуется авторизация
4. Добавьте ссылку в `Navigation.tsx`

### Добавление нового API метода

1. Определите типы в `src/types/index.ts`
2. Добавьте методы в `src/services/api.ts`
3. Создайте хук если нужны оптимистичные обновления

## Производительность

### Оптимизации

- Lazy loading для маршрутов (можно добавить)
- Мемоизация компонентов с React.memo
- Виртуализация длинных списков (можно добавить react-window)
- Оптимизация изображений
- Code splitting по маршрутам

### Кэширование

TanStack Query автоматически кэширует данные:
- `staleTime` - время актуальности данных
- `cacheTime` - время хранения в кэше
- `refetchOnWindowFocus` - обновление при фокусе окна

## Доступность

- Семантический HTML
- ARIA атрибуты для интерактивных элементов
- Keyboard navigation
- Focus management
- Screen reader поддержка

## Безопасность

- JWT токены в localStorage
- Автоматическое добавление токена к запросам
- Защищенные маршруты с ProtectedRoute
- Валидация на клиенте и сервере
- XSS защита через React

## Troubleshooting

### Проблемы с авторизацией
- Проверьте наличие токена в localStorage
- Убедитесь что backend запущен на порту 8000
- Проверьте CORS настройки

### Проблемы с анимациями
- Убедитесь что framer-motion установлен
- Проверьте CSS переменные в index.css

### Проблемы со скелетонами
- Проверьте что shimmer анимация определена в CSS
- Убедитесь что компоненты импортированы правильно

## Дополнительные ресурсы

- [React документация](https://react.dev)
- [TypeScript документация](https://www.typescriptlang.org/docs/)
- [Framer Motion документация](https://www.framer.com/motion/)
- [TanStack Query документация](https://tanstack.com/query/latest)
- [Tailwind CSS документация](https://tailwindcss.com/docs)
