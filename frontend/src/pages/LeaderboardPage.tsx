import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
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
  
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка рейтинга...</div>
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
                  className="text-gray-400 hover:text-white transition"
                >
                  Главная
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Карта
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-gray-400 hover:text-white transition"
                >
                  AI Чат
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="text-primary-400 font-medium"
                >
                  Рейтинг
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Профиль
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* My Rank Card */}
        {leaderboard?.my_rank && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-200 text-sm mb-1">Ваша позиция</p>
                <p className="text-white text-4xl font-bold">
                  {getRankIcon(leaderboard.my_rank.rank)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-200 text-sm mb-1">Баллы</p>
                <p className="text-white text-3xl font-bold">
                  {leaderboard.my_rank.total_points}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Period Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Период
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('all')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    period === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Все время
                </button>
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    period === 'weekly'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Неделя
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    period === 'monthly'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Месяц
                </button>
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Категория
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('global')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    filter === 'global'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilter('student')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    filter === 'student'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Студенты
                </button>
                <button
                  onClick={() => setFilter('resident')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    filter === 'resident'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Жители
                </button>
                <button
                  onClick={() => setFilter('tourist')}
                  className={`flex-1 py-2 px-4 rounded transition ${
                    filter === 'tourist'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  Туристы
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">
              Топ-{leaderboard?.users.length || 0} пользователей
            </h2>
            <p className="text-gray-400 text-sm">
              Всего участников: {leaderboard?.total_users || 0}
            </p>
          </div>

          <div className="divide-y divide-slate-700">
            {leaderboard?.users.map((userRank, index) => (
              <div
                key={userRank.user_id}
                className={`p-4 flex items-center gap-4 transition ${
                  userRank.user_id === user?.id
                    ? 'bg-primary-500/10'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                {/* Rank */}
                <div className={`text-2xl font-bold w-16 text-center ${getRankColor(userRank.rank)}`}>
                  {getRankIcon(userRank.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                  {userRank.username.charAt(0).toUpperCase()}
                </div>

                {/* Username */}
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {userRank.username}
                    {userRank.user_id === user?.id && (
                      <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-1 rounded">
                        Вы
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {period === 'weekly' && `${userRank.weekly_points} баллов за неделю`}
                    {period === 'monthly' && `${userRank.monthly_points} баллов за месяц`}
                    {period === 'all' && `${userRank.total_points} баллов всего`}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-white text-2xl font-bold">
                    {period === 'weekly' ? userRank.weekly_points :
                     period === 'monthly' ? userRank.monthly_points :
                     userRank.total_points}
                  </p>
                  <p className="text-gray-400 text-xs">баллов</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
