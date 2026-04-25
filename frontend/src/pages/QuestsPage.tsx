import { useState, useEffect } from 'react';
import { questsAPI } from '../services/api';
import Navigation from '../components/Navigation';
import { QuestCard } from '../components/challenges/QuestCard';
import { StatsCardSkeleton } from '../components/skeletons/StatsCardSkeleton';
import type { Quest } from '../types';
import { toast } from 'sonner';

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const data = await questsAPI.getQuests();
      setQuests(data);
    } catch (error) {
      console.error('Error loading quests:', error);
      toast.error('Ошибка при загрузке квестов');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuest = async (id: number) => {
    try {
      await questsAPI.startQuest(id);
      toast.success('Квест начат!');
      loadQuests();
    } catch (error) {
      console.error('Error starting quest:', error);
      toast.error('Ошибка при начале квеста');
    }
  };

  const handleContinueQuest = async (id: number) => {
    try {
      await questsAPI.getQuest(id);
      toast.success('Продолжайте квест!');
    } catch (error) {
      console.error('Error continuing quest:', error);
      toast.error('Ошибка при продолжении квеста');
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

  const activeQuests = quests.filter((q) => q.status === 'active');
  const availableQuests = quests.filter((q) => q.status === 'locked');
  const completedQuests = quests.filter((q) => q.status === 'completed');

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold syne gradient-text mb-2">Квесты</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Выполняйте квесты и получайте эксклюзивные награды
          </p>
        </div>

        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold syne mb-4" style={{ color: 'var(--text-primary)' }}>
              🎮 Активные квесты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onContinue={handleContinueQuest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Quests */}
        {availableQuests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold syne mb-4" style={{ color: 'var(--text-primary)' }}>
              🔓 Доступные квесты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onStart={handleStartQuest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold syne mb-4" style={{ color: 'var(--text-primary)' }}>
              ✓ Завершенные квесты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          </div>
        )}

        {quests.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📜</div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
              Квесты еще не загружены
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
