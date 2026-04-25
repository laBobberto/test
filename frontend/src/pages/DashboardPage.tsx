import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planAPI, activitiesAPI } from '../services/api';
import { useAuthStore, useStatsStore } from '../store';
import type { Activity, ActivityFormData } from '../types';
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
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

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

  const handleLogout = () => {
    logout();
    navigate('/');
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
                  className="text-gray-400 hover:text-white transition"
                >
                  Рейтинг
                </button>
                <button
                  onClick={() => navigate('/social')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Друзья
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="text-gray-400 hover:text-white transition"
                >
                  Аналитика
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
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

          <div className="bg-slate-800 rounded-lg p-6">
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

          <div className="bg-slate-800 rounded-lg p-6">
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

          <div className="bg-slate-800 rounded-lg p-6">
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

        {/* Date Selector */}
        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-800 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Дела на {new Date(selectedDate).toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </h2>

          {activities.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">Нет дел на этот день</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 transition"
              >
                Создать первое дело
              </button>
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onComplete={handleCompleteActivity}
                onReschedule={openRescheduleModal}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

      {/* Modals */}
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
