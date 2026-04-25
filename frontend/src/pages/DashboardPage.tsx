import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI, activitiesAPI, userAPI } from '../services/api';
import { useAuthStore, useActivitiesStore, useStatsStore } from '../store';
import type { Activity } from '../types';

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { stats, setStats } = useStatsStore();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load daily plan
      const plan = await planAPI.getDailyPlan(selectedDate);
      setActivities(plan.activities);

      // Load stats
      const userStats = await activitiesAPI.getStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteActivity = async (activityId: number) => {
    try {
      await activitiesAPI.completeActivity(activityId);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
              <h1 className="text-2xl font-bold text-white">LifeBalance SPb</h1>
              <nav className="hidden md:flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-primary-400 font-medium"
                >
                  Главная
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="text-gray-400 hover:text-white"
                >
                  Карта
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-gray-400 hover:text-white"
                >
                  AI Чат
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-400 hover:text-white"
                >
                  Профиль
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">👋 {user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Баллы</p>
                  <p className="text-3xl font-bold text-white">
                    {stats?.total_points || 0}
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Стрик</p>
                  <p className="text-3xl font-bold text-white">
                    {stats?.current_streak || 0}
                  </p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Выполнено</p>
                  <p className="text-3xl font-bold text-white">
                    {stats?.completed_activities || 0}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Баланс</p>
                  <p className="text-3xl font-bold text-white">
                    {stats?.balance_score || 0}%
                  </p>
                </div>
                <div className="text-4xl">⚖️</div>
              </div>
            </div>
          </div>

          {/* Daily Plan */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">План дня</h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">
                    Нет запланированных активностей
                  </p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="btn-primary"
                  >
                    Создать план с AI
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        activity.completed
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-slate-600 bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-400">
                              {new Date(activity.start_time).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(activity.end_time).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded">
                              {activity.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {activity.title}
                          </h3>
                          {activity.description && (
                            <p className="text-gray-400 text-sm mb-2">
                              {activity.description}
                            </p>
                          )}
                          {activity.location && (
                            <p className="text-gray-500 text-sm">
                              📍 {activity.location}
                            </p>
                          )}
                        </div>
                        {!activity.completed && (
                          <button
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            Выполнено
                          </button>
                        )}
                        {activity.completed && (
                          <div className="ml-4 text-green-400 text-2xl">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Быстрые действия
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full btn-primary"
                >
                  💬 Чат с AI
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="w-full btn-secondary"
                >
                  🗺️ События на карте
                </button>
                <button
                  onClick={() => navigate('/priorities')}
                  className="w-full btn-secondary"
                >
                  ⚙️ Настроить приоритеты
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">
                Достижения
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <p className="text-white font-medium">Первый шаг</p>
                    <p className="text-gray-400 text-sm">+10 баллов</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
