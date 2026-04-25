import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import Navigation from '../components/Navigation';
import api from '../services/api';

interface UserRank {
  user_id: number;
  username: string;
  total_points: number;
  rank: number;
  weekly_points: number;
  monthly_points: number;
}

interface LeaderboardData {
  users: UserRank[];
  my_rank: UserRank | null;
  total_users: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [filter, setFilter] = useState<'global' | 'student' | 'resident' | 'tourist'>('global');

  const { user } = useAuthStore();

  useEffect(() => {
    loadLeaderboard();
  }, [period, filter]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      let endpoint = '/api/leaderboard/global';
      const params: any = { limit: 100 };

      if (filter !== 'global') {
        endpoint = `/api/leaderboard/by-role/${filter}`;
      } else if (period === 'weekly') {
        endpoint = '/api/leaderboard/weekly';
      } else if (period === 'monthly') {
        endpoint = '/api/leaderboard/monthly';
      } else {
        params.period = 'all';
      }

      const response = await api.get(endpoint, { params });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-500';
    return '';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
        <h1 className="text-4xl font-bold syne gradient-text mb-8">Рейтинг</h1>

        {/* Filters */}
        <div className="card mb-8">
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Период:
            </p>
            <div className="flex gap-2">
              {[
                { value: 'all' as const, label: 'Все время' },
                { value: 'monthly' as const, label: 'Месяц' },
                { value: 'weekly' as const, label: 'Неделя' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    period === value
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Категория:
            </p>
            <div className="flex gap-2">
              {[
                { value: 'global' as const, label: 'Все' },
                { value: 'student' as const, label: 'Студенты' },
                { value: 'resident' as const, label: 'Жители' },
                { value: 'tourist' as const, label: 'Туристы' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    filter === value
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* My Rank */}
        {leaderboard?.my_rank && (
          <div className="card mb-8 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold syne">
                  {getRankIcon(leaderboard.my_rank.rank)}
                </span>
                <div>
                  <p className="font-semibold">Ваша позиция</p>
                  <p className="text-sm opacity-90">{leaderboard.my_rank.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold syne">{leaderboard.my_rank.total_points}</p>
                <p className="text-sm opacity-90">баллов</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboard?.users.map((userRank, index) => (
            <div
              key={userRank.user_id}
              className={`card card-hover animate-fade-in ${
                userRank.user_id === user?.id ? 'ring-2 ring-[var(--accent-primary)]' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold syne ${getRankColor(userRank.rank)}`}>
                    {getRankIcon(userRank.rank)}
                  </span>
                  <div>
                    <p className="font-semibold">{userRank.username}</p>
                    {userRank.user_id === user?.id && (
                      <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                        Это вы
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold syne gradient-text">
                    {period === 'weekly' ? userRank.weekly_points :
                     period === 'monthly' ? userRank.monthly_points :
                     userRank.total_points}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    баллов
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard?.users.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🏆</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Пока нет данных для отображения
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
