# Справочник компонентов - LifeBalance SPb

## Компоненты анимаций

### AnimatedNumber

Компонент для плавной анимации изменения числовых значений.

**Props:**
```typescript
interface AnimatedNumberProps {
  value: number;           // Целевое значение
  duration?: number;       // Длительность анимации (по умолчанию 1 сек)
  className?: string;      // CSS классы
  suffix?: string;         // Суффикс (например, '%')
}
```

**Пример использования:**
```tsx
<AnimatedNumber value={stats.total_points} duration={1} suffix="" />
<AnimatedNumber value={stats.balance_score} suffix="%" />
```

### ConfettiEffect

Эффект конфетти для празднования достижений.

**Функции:**
```typescript
triggerConfetti(): void  // Запускает эффект конфетти
```

**Пример использования:**
```tsx
import { triggerConfetti } from './animations/ConfettiEffect';

const handleComplete = () => {
  triggerConfetti();
  onComplete(activity.id);
};
```

### PageTransition

Обертка для плавных переходов между страницами.

**Props:**
```typescript
interface PageTransitionProps {
  children: ReactNode;
}
```

**Пример использования:**
```tsx
<PageTransition>
  <YourPageContent />
</PageTransition>
```

---

## Компоненты скелетонов

### Skeleton

Базовый компонент скелетона с shimmer эффектом.

**Props:**
```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

**Пример использования:**
```tsx
<Skeleton variant="text" width="60%" height={24} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rounded" width="100%" height={200} />
```

### ActivityCardSkeleton

Скелетон для карточек активностей.

**Props:**
```typescript
interface ActivityCardSkeletonProps {
  count?: number;  // Количество скелетонов (по умолчанию 1)
}
```

**Пример использования:**
```tsx
{loading && <ActivityCardSkeleton count={3} />}
```

### StatsCardSkeleton

Скелетон для карточек статистики.

**Props:**
```typescript
interface StatsCardSkeletonProps {
  count?: number;  // Количество скелетонов (по умолчанию 4)
}
```

**Пример использования:**
```tsx
{loading && <StatsCardSkeleton count={4} />}
```

---

## Компоненты онбординга

### OnboardingTour

Интерактивный тур для новых пользователей.

**Props:**
```typescript
interface OnboardingTourProps {
  tourType: TourType;  // 'dashboard' | 'map' | 'social' | 'profile'
  steps: Step[];       // Массив шагов тура
  run?: boolean;       // Запустить тур (по умолчанию true)
}
```

**Пример использования:**
```tsx
import { OnboardingTour } from '../components/onboarding/OnboardingTour';
import { dashboardTourSteps } from '../components/onboarding/tourSteps';

<OnboardingTour tourType="dashboard" steps={dashboardTourSteps} />
```

**Конфигурация шагов:**
```typescript
const dashboardTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Добро пожаловать!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-cards"]',
    content: 'Здесь ваша статистика',
    placement: 'bottom',
  },
];
```

---

## Компоненты активностей

### ActivityCard

Карточка активности с действиями.

**Props:**
```typescript
interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onReschedule: (activity: Activity) => void;
}
```

**Пример использования:**
```tsx
<ActivityCard
  activity={activity}
  onEdit={openEditModal}
  onDelete={openDeleteModal}
  onComplete={handleCompleteActivity}
  onReschedule={openRescheduleModal}
/>
```

### DraggableActivityCard

Карточка активности с поддержкой drag & drop.

**Props:**
```typescript
interface DraggableActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onReschedule: (activity: Activity) => void;
}
```

**Пример использования:**
```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={activities.map(a => a.id)}>
    {activities.map(activity => (
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

---

## Компоненты челленджей

### ChallengeCard

Карточка челленджа с прогресс-баром.

**Props:**
```typescript
interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (id: number) => void;
  onComplete?: (id: number) => void;
}
```

**Пример использования:**
```tsx
<ChallengeCard
  challenge={challenge}
  onAccept={handleAcceptChallenge}
  onComplete={handleCompleteChallenge}
/>
```

### QuestCard

Карточка квеста с шагами выполнения.

**Props:**
```typescript
interface QuestCardProps {
  quest: Quest;
  onStart?: (id: number) => void;
  onContinue?: (id: number) => void;
}
```

**Пример использования:**
```tsx
<QuestCard
  quest={quest}
  onStart={handleStartQuest}
  onContinue={handleContinueQuest}
/>
```

---

## Компоненты валюты

### CurrencyBalance

Отображение баланса виртуальной валюты.

**Props:**
```typescript
interface CurrencyBalanceProps {
  balance: number;
  onClick?: () => void;
}
```

**Пример использования:**
```tsx
<CurrencyBalance 
  balance={currency.balance} 
  onClick={() => navigate('/store')}
/>
```

### StoreItemCard

Карточка товара в магазине.

**Props:**
```typescript
interface StoreItemCardProps {
  item: StoreItem;
  onPurchase?: (id: number) => void;
  isLoading?: boolean;
}
```

**Пример использования:**
```tsx
<StoreItemCard
  item={item}
  onPurchase={handlePurchase}
  isLoading={purchasing === item.id}
/>
```

---

## Компоненты блога

### BlogPostCard

Карточка поста блога с превью.

**Props:**
```typescript
interface BlogPostCardProps {
  post: BlogPost;
  onClick?: (slug: string) => void;
}
```

**Пример использования:**
```tsx
<BlogPostCard
  post={post}
  onClick={(slug) => navigate(`/blog/${slug}`)}
/>
```

---

## Компоненты попутчиков

### CompanionPostCard

Карточка объявления о поиске попутчиков.

**Props:**
```typescript
interface CompanionPostCardProps {
  post: EventCompanion;
  onJoin?: (id: number) => void;
  onManage?: (id: number) => void;
  isOwn?: boolean;
  isLoading?: boolean;
}
```

**Пример использования:**
```tsx
<CompanionPostCard
  post={post}
  onJoin={handleJoinCompanion}
  isOwn={post.user_id === currentUserId}
  isLoading={joining === post.id}
/>
```

### EventGroupCard

Карточка группы для события.

**Props:**
```typescript
interface EventGroupCardProps {
  group: EventGroup;
  onJoin?: (id: number) => void;
  onLeave?: (id: number) => void;
  isMember?: boolean;
  isLoading?: boolean;
}
```

**Пример использования:**
```tsx
<EventGroupCard
  group={group}
  onJoin={handleJoinGroup}
  onLeave={handleLeaveGroup}
  isMember={group.members.some(m => m.user_id === currentUserId)}
  isLoading={loading}
/>
```

---

## Компоненты навигации

### Navigation

Главная навигация приложения.

**Функции:**
- Отображение меню навигации
- Переключение темы (светлая/темная)
- Кнопка запуска онбординг-тура
- Отображение имени пользователя
- Кнопка выхода

**Пример использования:**
```tsx
<Navigation />
```

**Добавление нового пункта меню:**
```typescript
const navItems = [
  { name: 'Новая страница', path: '/new-page' },
  // ...
];
```

---

## Компоненты уведомлений

### Toast

Система уведомлений на основе sonner.

**Функции:**
```typescript
toast.success(message: string): void
toast.error(message: string): void
toast.info(message: string): void
toast.loading(message: string): void
```

**Пример использования:**
```tsx
import { toast } from 'sonner';

// Успех
toast.success('Активность создана!');

// Ошибка
toast.error('Ошибка при сохранении');

// Информация
toast.info('Данные обновлены');

// Загрузка
const toastId = toast.loading('Загрузка...');
// После завершения
toast.dismiss(toastId);
```

---

## Хуки

### useActivities

Хук для работы с активностями с оптимистичными обновлениями.

**Возвращаемые значения:**
```typescript
interface UseActivitiesReturn {
  createActivity: (data: ActivityFormData) => void;
  updateActivity: (params: { id: number; data: Partial<ActivityFormData> }) => void;
  deleteActivity: (id: number) => void;
  completeActivity: (id: number) => void;
  isLoading: boolean;
}
```

**Пример использования:**
```tsx
const { createActivity, updateActivity, deleteActivity, completeActivity, isLoading } = useActivities();

// Создание
createActivity({
  title: 'Тренировка',
  category: 'health',
  start_time: '2026-04-26T10:00:00',
  end_time: '2026-04-26T11:00:00',
});

// Обновление
updateActivity({ 
  id: 1, 
  data: { title: 'Обновленное название' } 
});

// Удаление
deleteActivity(1);

// Завершение
completeActivity(1);
```

---

## Утилиты стилизации

### CSS классы

**Кнопки:**
```css
.btn-primary      /* Основная кнопка с градиентом */
.btn-secondary    /* Вторичная кнопка */
```

**Карточки:**
```css
.card             /* Базовая карточка с тенью */
.card-hover       /* Карточка с hover эффектом */
```

**Инпуты:**
```css
.input            /* Стилизованный input с фокусом */
```

**Эффекты:**
```css
.glass            /* Эффект матового стекла */
.gradient-text    /* Градиентный текст */
.skeleton-shimmer /* Shimmer анимация для скелетонов */
```

**Анимации:**
```css
.animate-fade-in  /* Появление с fade */
.animate-slide-in /* Появление со slide */
.animate-scale-in /* Появление с scale */
```

### Использование CSS переменных

```tsx
// В JSX
<div style={{ color: 'var(--text-primary)' }}>
  Текст
</div>

<div style={{ backgroundColor: 'var(--bg-secondary)' }}>
  Контент
</div>
```

---

## Паттерны разработки

### Создание новой страницы

```tsx
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import { toast } from 'sonner';

export default function NewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка данных
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <StatsCardSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold syne gradient-text mb-8">
          Заголовок страницы
        </h1>
        {/* Контент */}
      </div>
    </div>
  );
}
```

### Создание нового компонента

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <motion.button
        onClick={onClick}
        className="btn-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Действие
      </motion.button>
    </motion.div>
  );
};
```

### Работа с формами

```tsx
import { useState } from 'react';
import { toast } from 'sonner';

export default function FormExample() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Заполните название');
      return;
    }

    try {
      setLoading(true);
      // API запрос
      toast.success('Успешно сохранено!');
    } catch (error) {
      toast.error('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Название"
        className="input"
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Описание"
        className="input"
        rows={4}
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
```

---

## Best Practices

### Производительность

1. **Используйте React.memo для тяжелых компонентов:**
```tsx
export const ExpensiveComponent = React.memo(({ data }) => {
  // Компонент
});
```

2. **Используйте useCallback для функций:**
```tsx
const handleClick = useCallback(() => {
  // Логика
}, [dependencies]);
```

3. **Используйте useMemo для вычислений:**
```tsx
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

### Доступность

1. **Добавляйте aria-label к кнопкам без текста:**
```tsx
<button aria-label="Закрыть">
  <CloseIcon />
</button>
```

2. **Используйте семантические HTML теги:**
```tsx
<nav>...</nav>
<main>...</main>
<article>...</article>
```

3. **Обеспечьте keyboard navigation:**
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Кликабельный элемент
</div>
```

### Безопасность

1. **Никогда не храните чувствительные данные в localStorage**
2. **Валидируйте данные на клиенте и сервере**
3. **Используйте HTTPS в продакшене**
4. **Санитизируйте пользовательский ввод**

---

## Отладка

### React DevTools

Используйте React DevTools для:
- Инспекции компонентов
- Просмотра props и state
- Профилирования производительности

### Console методы

```typescript
console.log('Обычное сообщение');
console.error('Ошибка');
console.warn('Предупреждение');
console.table(data); // Таблица данных
console.time('label'); // Начало замера
console.timeEnd('label'); // Конец замера
```

### Отладка API запросов

```typescript
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

---

## Чеклист перед деплоем

- [ ] Все тесты проходят
- [ ] Нет console.log в продакшен коде
- [ ] Оптимизированы изображения
- [ ] Настроены переменные окружения
- [ ] Проверена доступность
- [ ] Проверена производительность
- [ ] Настроен error tracking (Sentry)
- [ ] Настроена аналитика
- [ ] Проверена мобильная версия
- [ ] Настроен CI/CD
