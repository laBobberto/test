import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { useOnboardingStore } from '../store/onboardingStore';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { startTour } = useOnboardingStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartTour = () => {
    const tourMap: Record<string, 'dashboard' | 'map' | 'social' | 'profile'> = {
      '/dashboard': 'dashboard',
      '/map': 'map',
      '/friends': 'social',
      '/groups': 'social',
      '/profile': 'profile',
    };
    const currentTour = tourMap[location.pathname];
    if (currentTour) {
      startTour(currentTour);
    }
  };

  const navItems = [
    { name: 'Главная', path: '/dashboard' },
    { name: 'Карта', path: '/map' },
    { name: 'Чат', path: '/chat' },
    { name: 'Расписание', path: '/schedule' },
    { name: 'Челленджи', path: '/challenges' },
    { name: 'Квесты', path: '/quests' },
    { name: 'Магазин', path: '/store' },
    { name: 'Покупки', path: '/purchases' },
    { name: 'Блог', path: '/blog' },
    { name: 'Попутчики', path: '/companions' },
    { name: 'Рейтинг', path: '/leaderboard' },
    { name: 'Группы', path: '/groups' },
    { name: 'Друзья', path: '/friends' },
    { name: 'Аналитика', path: '/analytics' },
    { name: 'Профиль', path: '/profile' }
  ];

  return (
    <header className="glass sticky top-0 z-40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold syne gradient-text">LifeBalance</h1>

          <nav className="hidden md:flex gap-2">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 font-semibold text-sm rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartTour}
              className="p-2 glass rounded-lg hover:scale-110 transition-all duration-300"
              title="Показать подсказки"
            >
              <span className="text-lg">❓</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 glass rounded-lg hover:scale-110 transition-all duration-300"
            >
              <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300"
              style={{ color: 'var(--text-secondary)' }}
            >
              Выход
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
