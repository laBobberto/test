import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store';
import type { UserRole } from '../types';

const roles: { id: UserRole; title: string; description: string }[] = [
  {
    id: 'student',
    title: 'Студент',
    description: 'Учеба, карьерное развитие, студенческая жизнь',
  },
  {
    id: 'resident',
    title: 'Житель',
    description: 'Быт, досуг, городские сервисы',
  },
  {
    id: 'tourist',
    title: 'Турист',
    description: 'Достопримечательности, культура, маршруты',
  },
];

export default function OnboardingPage() {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useAuthStore();

  const registrationData = location.state as {
    email: string;
    username: string;
    password: string;
  } | null;

  const toggleRole = (roleId: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      setError('Выберите хотя бы одну роль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (registrationData) {
        await authAPI.register(
          registrationData.email,
          registrationData.username,
          registrationData.password,
          selectedRoles
        );

        const response = await authAPI.login(
          registrationData.email,
          registrationData.password
        );
        setToken(response.access_token);

        const user = await userAPI.getProfile();
        setUser(user);
      }

      navigate('/priorities');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 brutal-grid">
      <div className="max-w-3xl w-full animate-fade-in">
        <div className="card">
          <div className="mb-10">
            <h1 className="text-4xl font-bold syne mb-3 gradient-text">
              Выберите роль
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Можно выбрать несколько вариантов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                  selectedRoles.includes(role.id)
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xl scale-105'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:scale-102'
                }`}
              >
                <h3 className="text-2xl font-bold mb-3 syne">
                  {role.title}
                </h3>
                <p className={`text-sm font-medium ${
                  selectedRoles.includes(role.id) ? 'text-white/90' : ''
                }`} style={!selectedRoles.includes(role.id) ? { color: 'var(--text-secondary)' } : {}}>
                  {role.description}
                </p>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={loading || selectedRoles.length === 0}
            className="btn-primary w-full text-base font-semibold mb-6"
          >
            {loading ? 'Загрузка...' : 'Продолжить'}
          </button>

          <div className="text-center pt-6 border-t border-[var(--border-primary)]">
            <p className="mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Шаг 1 / 2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
