import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, activitiesAPI } from '../services/api';
import { useAuthStore, usePrioritiesStore, useStatsStore } from '../store';
import Navigation from '../components/Navigation';
import type { Achievement } from '../types';

export default function ProfilePage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeAddress, setHomeAddress] = useState('');
  const [travelTime, setTravelTime] = useState(30);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { priorities } = usePrioritiesStore();
  const { stats } = useStatsStore();

  useEffect(() => {
    loadData();
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const profile = await userAPI.getProfile();
      // Предполагаем, что в профиле есть поля home_address и travel_time
      setHomeAddress((profile as any).home_address || '');
      setTravelTime((profile as any).travel_time || 30);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const userPriorities = await userAPI.getPriorities();
      usePrioritiesStore.getState().setPriorities(userPriorities);

      const userAchievements = await activitiesAPI.getAchievements();
      setAchievements(userAchievements);

      const userStats = await activitiesAPI.getStats();
      useStatsStore.getState().setStats(userStats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsError('');
      setSettingsSuccess('');
      
      // Отправляем обновленные настройки на сервер
      await userAPI.updateProfile({
        home_address: homeAddress,
        travel_time: travelTime,
      });
      
      setSettingsSuccess('Настройки успешно сохранены');
      setEditingSettings(false);
      
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (error: any) {
      setSettingsError(error.response?.data?.detail || 'Не удалось сохранить настройки');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center brutal-grid">
        <div className="text-center">
          <div className="text-5xl mb-4 syne font-bold gradient-text">Загрузка</div>
          <div className="h-1 w-32 bg-[var(--accent-primary)] mx-auto animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User Info */}
        <div className="card mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-3xl font-bold text-white">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold syne gradient-text mb-2">
                {user?.username}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {user?.roles.map((role) => (
              <span
                key={role}
                className="px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg text-sm font-semibold"
              >
                {role === 'student' ? 'Студент' : role === 'resident' ? 'Житель' : 'Турист'}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Баллы', value: stats?.total_points || 0, icon: '⭐' },
            { label: 'Стрик', value: stats?.current_streak || 0, icon: '🔥' },
            { label: 'Выполнено', value: stats?.completed_activities || 0, icon: '✓' }
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-4xl font-bold syne gradient-text">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Priorities */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold syne gradient-text mb-6">Приоритеты</h2>
          <div className="space-y-4">
            {priorities.map((priority) => (
              <div key={priority.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">
                    {priority.category === 'education' ? 'Образование' :
                     priority.category === 'career' ? 'Карьера' :
                     priority.category === 'health' ? 'Здоровье' :
                     priority.category === 'leisure' ? 'Досуг' :
                     priority.category === 'social' ? 'Социализация' :
                     'Быт'}
                  </span>
                  <span className="font-bold gradient-text">{priority.value}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                    style={{ width: `${priority.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/priorities')}
            className="btn-secondary w-full mt-6"
          >
            Изменить приоритеты
          </button>
        </div>

        {/* Settings */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold syne gradient-text mb-6">Настройки</h2>
          
          {settingsError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-4">
              <p className="text-red-500 text-sm font-medium">{settingsError}</p>
            </div>
          )}

          {settingsSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-4">
              <p className="text-green-500 text-sm font-medium">{settingsSuccess}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Домашний адрес
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                disabled={!editingSettings}
                className="input w-full"
                placeholder="Например: Санкт-Петербург, ул. Ленина, д. 1"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Используется для расчета времени в пути до мероприятий
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Время на дорогу (минут)
              </label>
              <input
                type="number"
                value={travelTime}
                onChange={(e) => setTravelTime(parseInt(e.target.value) || 0)}
                disabled={!editingSettings}
                className="input w-full"
                min="0"
                max="180"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Среднее время, которое вы готовы потратить на дорогу до мероприятия
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {editingSettings ? (
              <>
                <button
                  onClick={handleSaveSettings}
                  className="btn-primary flex-1"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingSettings(false);
                    loadUserSettings();
                  }}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditingSettings(true)}
                className="btn-secondary w-full"
              >
                Редактировать настройки
              </button>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="card">
          <h2 className="text-2xl font-bold syne gradient-text mb-6">Достижения</h2>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, i) => (
                <div
                  key={achievement.id}
                  className="card bg-[var(--bg-tertiary)] animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <h3 className="font-bold mb-1">{achievement.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {achievement.description}
                      </p>
                      <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                        +{achievement.points} баллов
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 opacity-30">🏆</div>
              <p style={{ color: 'var(--text-secondary)' }}>
                Пока нет достижений. Выполняйте задачи, чтобы получить награды!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
