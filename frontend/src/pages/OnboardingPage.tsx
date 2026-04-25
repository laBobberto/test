import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store';
import type { UserRole } from '../types';

const roles: { id: UserRole; title: string; description: string; icon: string }[] = [
  {
    id: 'student',
    title: 'Студент',
    description: 'Учеба, карьерное развитие, студенческая жизнь',
    icon: '🎓',
  },
  {
    id: 'resident',
    title: 'Житель',
    description: 'Быт, досуг, городские сервисы',
    icon: '🏠',
  },
  {
    id: 'tourist',
    title: 'Турист',
    description: 'Достопримечательности, культура, маршруты',
    icon: '🗺️',
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
        // Register new user
        await authAPI.register(
          registrationData.email,
          registrationData.username,
          registrationData.password,
          selectedRoles
        );

        // Login
        const response = await authAPI.login(
          registrationData.email,
          registrationData.password
        );
        setToken(response.access_token);

        // Get user profile
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="card max-w-2xl w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Выберите свою роль
          </h1>
          <p className="text-gray-400">
            Можно выбрать несколько вариантов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedRoles.includes(role.id)
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-5xl mb-3">{role.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-gray-400">{role.description}</p>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading || selectedRoles.length === 0}
          className="btn-primary w-full"
        >
          {loading ? 'Загрузка...' : 'Продолжить'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Шаг 1 из 2
          </p>
        </div>
      </div>
    </div>
  );
}
