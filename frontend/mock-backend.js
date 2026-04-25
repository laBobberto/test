import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  roles: ['student'],
  created_at: new Date().toISOString()
};

const mockPriorities = [
  { id: 1, category: 'education', value: 20 },
  { id: 2, category: 'career', value: 15 },
  { id: 3, category: 'health', value: 20 },
  { id: 4, category: 'leisure', value: 20 },
  { id: 5, category: 'social', value: 15 },
  { id: 6, category: 'household', value: 10 }
];

const mockActivities = [];
const mockEvents = [];
const mockAchievements = [
  { id: 1, name: 'Первый шаг', description: 'Завершите первую активность', icon: '🎯', points: 10, category: 'general' }
];

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json(mockUser);
});

app.post('/api/auth/login', (req, res) => {
  res.json({ access_token: 'mock-token', token_type: 'bearer' });
});

// User endpoints
app.get('/api/user/profile', (req, res) => {
  res.json(mockUser);
});

app.put('/api/user/priorities', (req, res) => {
  res.json(req.body.priorities);
});

app.get('/api/user/priorities', (req, res) => {
  res.json(mockPriorities);
});

// Plan endpoints
app.post('/api/plan/generate', (req, res) => {
  res.json({ response: 'План создан успешно!', suggestions: ['Отличная работа!'] });
});

app.get('/api/plan/daily', (req, res) => {
  res.json({
    date: new Date().toISOString().split('T')[0],
    activities: mockActivities,
    suggestions: ['Создайте план через AI чат'],
    balance_score: 75.0
  });
});

app.post('/api/plan/chat', (req, res) => {
  res.json({ response: 'Привет! Я готов помочь с планированием.', suggestions: [] });
});

// Events endpoints
app.get('/api/events/', (req, res) => {
  res.json(mockEvents);
});

app.get('/api/events/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Тестовое событие', description: 'Описание' });
});

// Activities endpoints
app.post('/api/activities/', (req, res) => {
  const activity = { id: Date.now(), ...req.body, completed: false, points_earned: 0, created_at: new Date().toISOString() };
  mockActivities.push(activity);
  res.json(activity);
});

app.get('/api/activities/', (req, res) => {
  res.json(mockActivities);
});

app.post('/api/activities/complete', (req, res) => {
  const activity = mockActivities.find(a => a.id === req.body.activity_id);
  if (activity) {
    activity.completed = true;
    activity.points_earned = 25;
    res.json(activity);
  } else {
    res.status(404).json({ detail: 'Activity not found' });
  }
});

app.get('/api/activities/achievements', (req, res) => {
  res.json(mockAchievements);
});

app.get('/api/activities/stats', (req, res) => {
  res.json({
    total_points: 100,
    current_streak: 3,
    completed_activities: 5,
    achievements_count: 1,
    balance_score: 75.0
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Mock Backend API', version: '1.0.0' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
});
