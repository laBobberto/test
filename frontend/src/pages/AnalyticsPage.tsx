import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface AnalyticsOverview {
  total_activities: number;
  completed_activities: number;
  total_points: number;
  completion_rate: number;
  categories: Record<string, number>;
}

interface WeeklyData {
  date: string;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  total: number;
  completed: number;
  completion_rate: number;
}

interface TimeDistribution {
  category: string;
  hours: number;
}

interface Streaks {
  current_streak: number;
  longest_streak: number;
}

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, weeklyRes, categoryRes, timeRes, streaksRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/activities/weekly'),
        api.get('/analytics/categories/breakdown'),
        api.get('/analytics/time/distribution'),
        api.get('/analytics/streaks')
      ]);

      setOverview(overviewRes.data);
      setWeeklyData(weeklyRes.data.data);
      setCategoryBreakdown(categoryRes.data.categories);
      setTimeDistribution(timeRes.data.distribution);
      setStreaks(streaksRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/analytics/export');
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lifebalance-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);
  const maxTimeHours = Math.max(...timeDistribution.map(d => d.hours), 1);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <button
          onClick={exportData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm mb-2">Total Activities</div>
          <div className="text-3xl font-bold">{overview?.total_activities || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm mb-2">Completed</div>
          <div className="text-3xl font-bold text-green-500">{overview?.completed_activities || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm mb-2">Total Points</div>
          <div className="text-3xl font-bold text-blue-500">{overview?.total_points || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm mb-2">Completion Rate</div>
          <div className="text-3xl font-bold text-purple-500">{overview?.completion_rate || 0}%</div>
        </div>
      </div>

      {/* Streaks */}
      {streaks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow p-6 text-white">
            <div className="text-sm mb-2">Current Streak</div>
            <div className="text-4xl font-bold">{streaks.current_streak} days 🔥</div>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg shadow p-6 text-white">
            <div className="text-sm mb-2">Longest Streak</div>
            <div className="text-4xl font-bold">{streaks.longest_streak} days 🏆</div>
          </div>
        </div>
      )}

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Activity</h2>
        <div className="flex items-end justify-between h-64 gap-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(day.count / maxWeeklyCount) * 100}%` }}
                  title={`${day.count} activities`}
                />
              </div>
              <div className="text-xs mt-2 text-gray-500">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm font-semibold">{day.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
        <div className="space-y-4">
          {categoryBreakdown.map((cat, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="font-medium capitalize">{cat.category}</span>
                <span className="text-gray-500">
                  {cat.completed}/{cat.total} ({cat.completion_rate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${cat.completion_rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Time Distribution by Category</h2>
        <div className="space-y-4">
          {timeDistribution.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="font-medium capitalize">{item.category}</span>
                <span className="text-gray-500">{item.hours}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${(item.hours / maxTimeHours) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Overview */}
      {overview && Object.keys(overview.categories).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Activities by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(overview.categories).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-blue-500">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
