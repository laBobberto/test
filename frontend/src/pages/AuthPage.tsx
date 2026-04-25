import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(email, password);
        setToken(response.access_token);

        const user = await userAPI.getProfile();
        setUser(user);

        try {
          const priorities = await userAPI.getPriorities();
          if (priorities && priorities.length > 0) {
            navigate('/dashboard');
          } else {
            navigate('/priorities');
          }
        } catch {
          navigate('/onboarding');
        }
      } else {
        navigate('/onboarding', {
          state: { email, username, password }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 brutal-grid">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 glass rounded-full hover:scale-110 transition-all duration-300"
        style={{ boxShadow: '0 4px 14px 0 var(--shadow)' }}
      >
        <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
      </button>

      <div className="max-w-md w-full animate-fade-in">
        <div className="card">
          <div className="mb-10">
            <h1 className="text-5xl font-bold syne mb-3 gradient-text">
              В потоке
            </h1>
            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
              Санкт-Петербург
            </p>
            <p className="mono text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              v2.0 // система активна
            </p>
          </div>

          <div className="flex gap-2 mb-8 p-1 bg-[var(--bg-tertiary)] rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-300 ${
                isLogin
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 font-semibold rounded-lg transition-all duration-300 ${
                !isLogin
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="username"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base font-semibold"
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Продолжить'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
            <p className="mono text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Хакатон "Цифровой Петербург" 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
