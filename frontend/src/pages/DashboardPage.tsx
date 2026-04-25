import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI, activitiesAPI } from '../services/api';
import { useStatsStore } from '../store';
import type { Activity, ActivityFormData } from '../types';
import Navigation from '../components/Navigation';
import ActivityCard from '../components/ActivityCard';
import ActivityEditModal from '../components/ActivityEditModal';
import ActivityCreateForm from '../components/ActivityCreateForm';
import ActivityDeleteConfirm from '../components/ActivityDeleteConfirm';
import ActivityRescheduleModal from '../components/ActivityRescheduleModal';
import FloatingActionButton from '../components/FloatingActionButton';

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const navigate = useNavigate();
  const { stats, setStats } = useStatsStore();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const plan = await planAPI.getDailyPlan(selectedDate);
      setActivities(plan.activities);
      const userStats = await activitiesAPI.getStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (data: ActivityFormData) => {
    try {
      await activitiesAPI.createActivity(data);
      loadData();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const handleUpdateActivity = async (id: number, data: Partial<ActivityFormData>) => {
    try {
      await activitiesAPI.updateActivity(id, data);
      loadData();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    try {
      await activitiesAPI.deleteActivity(selectedActivity.id);
      setIsDeleteModalOpen(false);
      setSelectedActivity(null);
      loadData();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleRescheduleActivity = async (id: number, start_time: string, end_time: string) => {
    try {
      await activitiesAPI.rescheduleActivity(id, start_time, end_time);
      loadData();
    } catch (error) {
      console.error('Error rescheduling activity:', error);
    }
  };

  const handleCompleteActivity = async (activityId: number) => {
    try {
      await activitiesAPI.completeActivity(activityId);
      loadData();
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const openEditModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      setIsDeleteModalOpen(true);
    }
  };

  const openRescheduleModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsRescheduleModalOpen(true);
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

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Баллы', value: stats?.total_points || 0, icon: '⭐' },
            { label: 'Стрик', value: stats?.current_streak || 0, icon: '🔥' },
            { label: 'Выполнено', value: stats?.completed_activities || 0, icon: '✓' },
            { label: 'Баланс', value: `${stats?.balance_score || 0}%`, icon: '⚖️' }
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card card-hover animate-fade-in"
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

        {/* Date Selector */}
        <div className="mb-8 flex items-center gap-4">
          <label className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
            Дата:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input max-w-xs"
          />
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          <div className="flex items-center gap-6 mb-6">
            <h2 className="text-3xl font-bold syne gradient-text">
              {new Date(selectedDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long'
              })}
            </h2>
            <div className="flex-1 h-px bg-[var(--border-primary)]"></div>
          </div>

          {activities.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-6 opacity-30">📋</div>
              <p className="text-xl font-semibold mb-6" style={{ color: 'var(--text-secondary)' }}>
                Нет дел на этот день
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                Создать первое дело
              </button>
            </div>
          ) : (
            activities.map((activity, i) => (
              <div
                key={activity.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ActivityCard
                  activity={activity}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onComplete={handleCompleteActivity}
                  onReschedule={openRescheduleModal}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

      <ActivityCreateForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateActivity}
      />

      <ActivityEditModal
        activity={selectedActivity}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleUpdateActivity}
      />

      <ActivityDeleteConfirm
        isOpen={isDeleteModalOpen}
        activityTitle={selectedActivity?.title || ''}
        onConfirm={handleDeleteActivity}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedActivity(null);
        }}
      />

      <ActivityRescheduleModal
        activity={selectedActivity}
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedActivity(null);
        }}
        onReschedule={handleRescheduleActivity}
      />
    </div>
  );
}
