import { useState, useEffect } from 'react';
import { challengesAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { Challenge } from '../types';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengesAPI.getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Ошибка при загрузке челленджей');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (id: number) => {
    try {
      await challengesAPI.acceptChallenge(id);
      toast.success('Челленж принят!');
      loadChallenges();
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('Ошибка при принятии челленджа');
    }
  };

  const handleCompleteChallenge = async (id: number) => {
    try {
      await challengesAPI.completeChallenge(id);
      toast.success('Челленж завершен! 🎉');
      loadChallenges();
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Ошибка при завершении челленджа');
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'available') return c.status !== 'active' && c.status !== 'completed';
    return c.status === 'completed';
  });

  if (loading) {
    return (
      <div className="min-h-screen brutal-grid">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCardSkeleton count={3} />
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
          <h1 className="text-4xl font-bold syne gradient-text mb-2">Челленджи</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Выполняйте челленджи и получайте награды
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border-primary)]">
          {(['active', 'available', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'active' && 'Активные'}
              {tab === 'available' && 'Доступные'}
              {tab === 'completed' && 'Завершенные'}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              {activeTab === 'active' && 'Нет активных челленджей'}
              {activeTab === 'available' && 'Нет доступных челленджей'}
              {activeTab === 'completed' && 'Вы еще не завершили челленджи'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onAccept={handleAcceptChallenge}
                onComplete={handleCompleteChallenge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
