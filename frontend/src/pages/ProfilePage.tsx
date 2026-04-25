import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, activitiesAPI } from '../services/api';
import { useAuthStore, usePrioritiesStore, useStatsStore } from '../store';
import Navigation from '../components/Navigation';
import type { Achievement } from '../types';

export default function ProfilePage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { priorities } = usePrioritiesStore();
  const { stats } = useStatsStore();

  useEffect(() => {
    loadData();
  }, []);

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
                      <h3 className="font-bold mb-1">{achievement.title}</h3>
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
