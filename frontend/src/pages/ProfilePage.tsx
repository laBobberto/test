import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, activitiesAPI } from '../services/api';
import { useAuthStore, usePrioritiesStore, useStatsStore } from '../store';
import type { Achievement } from '../types';

export default function ProfilePage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { priorities } = usePrioritiesStore();
  const { stats } = useStatsStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load priorities
      const userPriorities = await userAPI.getPriorities();
      usePrioritiesStore.getState().setPriorities(userPriorities);

      // Load achievements
      const userAchievements = await activitiesAPI.getAchievements();
      setAchievements(userAchievements);

      // Load stats
      const userStats = await activitiesAPI.getStats();
      useStatsStore.getState().setStats(userStats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const categoryIcons: Record<string, string> = {
    education: '📚',
    career: '💼',
    health: '💪',
    leisure: '🎭',
    social: '👥',
    household: '🏠',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                ← Назад
              </button>
              <h1 className="text-2xl font-bold text-white">Профиль</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.username}
              </h2>
              <p className="text-gray-400 mb-2">{user?.email}</p>
              <div className="flex gap-2">
                {user?.roles.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                  >
                    {role === 'student' && '🎓 Студент'}
                    {role === 'resident' && '🏠 Житель'}
                    {role === 'tourist' && '🗺️ Турист'}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.total_points || 0}
            </p>
            <p className="text-gray-400 text-sm">Баллов</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.current_streak || 0}
            </p>
            <p className="text-gray-400 text-sm">Дней подряд</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.completed_activities || 0}
            </p>
            <p className="text-gray-400 text-sm">Выполнено</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-2">🎖️</div>
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.achievements_count || 0}
            </p>
            <p className="text-gray-400 text-sm">Достижений</p>
          </div>
        </div>

        {/* Priorities */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Приоритеты</h2>
            <button
              onClick={() => navigate('/priorities')}
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Изменить
            </button>
          </div>
          <div className="space-y-3">
            {priorities.map((priority) => (
              <div key={priority.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {categoryIcons[priority.category]}
                    </span>
                    <span className="text-white">{priority.category}</span>
                  </div>
                  <span className="text-white font-bold">
                    {priority.value}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${priority.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Достижения</h2>
          {achievements.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Пока нет достижений. Выполняйте активности, чтобы получить награды!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{achievement.icon || '🏆'}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">
                        {achievement.name}
                      </h3>
                      {achievement.description && (
                        <p className="text-gray-400 text-sm mb-2">
                          {achievement.description}
                        </p>
                      )}
                      <p className="text-primary-400 text-sm font-medium">
                        +{achievement.points} баллов
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
