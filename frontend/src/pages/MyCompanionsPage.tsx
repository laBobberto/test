import { useState, useEffect } from 'react';
import { companionsAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { CompanionPostCard } from '../components/CompanionPostCard';
import { EventGroupCard } from '../components/EventGroupCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { EventCompanion, EventGroup } from '../types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MyCompanionsPage() {
  const [companionPosts, setCompanionPosts] = useState<EventCompanion[]>([]);
  const [eventGroups, setEventGroups] = useState<EventGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const companions = await companionsAPI.getAllCompanions();
      setCompanionPosts(companions);
      setEventGroups([]);
    } catch (error) {
      console.error('Error loading companions data:', error);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompanion = async (postId: number) => {
    try {
      await companionsAPI.sendCompanionRequest(postId, 'Хочу присоединиться!');
      toast.success('Запрос отправлен!');
      loadData();
    } catch (error) {
      console.error('Error joining companion:', error);
      toast.error('Ошибка при отправке запроса');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await companionsAPI.joinEventGroup(groupId);
      toast.success('Вы вступили в группу!');
      loadData();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Ошибка при вступлении в группу');
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      await companionsAPI.leaveEventGroup(groupId);
      toast.success('Вы покинули группу');
      loadData();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Ошибка при выходе из группы');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCardSkeleton count={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold syne gradient-text mb-2">Попутчики</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Найдите компанию для посещения событий
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-primary)]">
          {(['posts', 'groups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'posts' && '🔍 Объявления о поиске'}
              {tab === 'groups' && '👥 Группы событий'}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <>
            {companionPosts.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
                  Нет объявлений о поиске попутчиков
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companionPosts.map((post) => (
                  <CompanionPostCard
                    key={post.id}
                    post={post}
                    onJoin={handleJoinCompanion}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <>
            {eventGroups.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">👥</div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
                  Нет групп событий
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventGroups.map((group) => (
                  <EventGroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
