import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import Navigation from '../components/Navigation';
import { leaderboardAPI, groupsAPI } from '../services/api';
import type { LeaderboardEntry, Group } from '../types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'global' | 'friends' | 'group'>('global');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { user } = useAuthStore();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [viewType, selectedGroupId]);

  const loadGroups = async () => {
    try {
      const data = await groupsAPI.getGroups();
      setGroups(data.filter(g => g.is_member));
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      let data: LeaderboardEntry[] = [];
      
      if (viewType === 'global') {
        data = await leaderboardAPI.getGlobal();
      } else if (viewType === 'friends') {
        data = await leaderboardAPI.getFriends();
      } else if (viewType === 'group' && selectedGroupId) {
        data = await leaderboardAPI.getGroup(selectedGroupId);
      }

      setLeaderboard(data);
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

        {/* View Type Filters */}
        <div className="card mb-8">
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Тип рейтинга:
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewType('global')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  viewType === 'global'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                Глобальный
              </button>
              <button
                onClick={() => setViewType('friends')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  viewType === 'friends'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                Среди друзей
              </button>
              <button
                onClick={() => setViewType('group')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  viewType === 'group'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                В группе
              </button>
            </div>
          </div>

          {viewType === 'group' && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Выберите группу:
              </p>
              <div className="flex gap-2 flex-wrap">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      selectedGroupId === group.id
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
                {groups.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Вы не состоите ни в одной группе
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`card card-hover animate-fade-in ${
                entry.user_id === user?.id ? 'ring-2 ring-[var(--accent-primary)]' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold syne ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </span>
                  <div>
                    <p className="font-semibold">{entry.username}</p>
                    {entry.user_id === user?.id && (
                      <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                        Это вы
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold syne gradient-text">
                    {entry.total_points}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    баллов
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && !loading && (
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
