import { Step } from 'react-joyride';

export const dashboardTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Добро пожаловать в LifeBalance SPb! Давайте познакомимся с главной страницей.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-cards"]',
    content: 'Здесь отображается ваша статистика: баллы, стрик и выполненные активности.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="activities-list"]',
    content: 'Это ваш план на день. Здесь вы увидите все запланированные активности.',
    placement: 'top',
  },
  {
    target: '[data-tour="create-activity"]',
    content: 'Нажмите эту кнопку, чтобы создать новую активность.',
    placement: 'left',
  },
  {
    target: '[data-tour="activity-card"]',
    content: 'Карточка активности. Вы можете отметить её выполненной, отредактировать или удалить.',
    placement: 'top',
  },
];

export const mapTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Это карта событий Санкт-Петербурга. Найдите интересные мероприятия рядом с вами!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="map-filters"]',
    content: 'Используйте фильтры для поиска событий по категориям и датам.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="event-list"]',
    content: 'Список всех событий. Нажмите на событие, чтобы увидеть детали.',
    placement: 'left',
  },
  {
    target: '[data-tour="map-view"]',
    content: 'События отображаются на карте. Кликните на маркер для подробностей.',
    placement: 'left',
  },
];

export const socialTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Социальный раздел - общайтесь с друзьями и делитесь достижениями!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="friends-tab"]',
    content: 'Здесь вы можете управлять списком друзей и отправлять запросы.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="groups-tab"]',
    content: 'Создавайте группы по интересам и присоединяйтесь к существующим.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="social-feed"]',
    content: 'Лента активности ваших друзей и групп.',
    placement: 'top',
  },
];

export const profileTourSteps: Step[] = [
  {
    target: 'body',
    content: 'Ваш профиль - управляйте настройками и отслеживайте прогресс!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-info"]',
    content: 'Основная информация профиля. Нажмите "Редактировать" для изменения.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="achievements"]',
    content: 'Ваши достижения и награды. Выполняйте активности, чтобы получить больше!',
    placement: 'top',
  },
  {
    target: '[data-tour="priorities"]',
    content: 'Настройте приоритеты для персонализированных рекомендаций.',
    placement: 'top',
  },
];
