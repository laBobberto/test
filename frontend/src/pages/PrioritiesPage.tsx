import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { usePrioritiesStore } from '../store';
import type { Priority, PriorityCategory } from '../types';

const categories: { id: PriorityCategory; title: string; icon: string; color: string }[] = [
  { id: 'education', title: 'Образование', icon: '📚', color: 'bg-blue-500' },
  { id: 'career', title: 'Карьера', icon: '💼', color: 'bg-purple-500' },
  { id: 'health', title: 'Здоровье', icon: '💪', color: 'bg-green-500' },
  { id: 'leisure', title: 'Досуг', icon: '🎭', color: 'bg-pink-500' },
  { id: 'social', title: 'Социализация', icon: '👥', color: 'bg-yellow-500' },
  { id: 'household', title: 'Быт', icon: '🏠', color: 'bg-orange-500' },
];

export default function PrioritiesPage() {
  const [priorities, setPriorities] = useState<Record<PriorityCategory, number>>({
    education: 20,
    career: 15,
    health: 20,
    leisure: 20,
    social: 15,
    household: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setPriorities: setStorePriorities } = usePrioritiesStore();

  const total = Object.values(priorities).reduce((sum, val) => sum + val, 0);

  const handleSliderChange = (category: PriorityCategory, value: number) => {
    setPriorities((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = async () => {
    if (Math.abs(total - 100) > 0.01) {
      setError('Сумма приоритетов должна быть равна 100%');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prioritiesArray: Priority[] = Object.entries(priorities).map(
        ([category, value]) => ({
          category,
          value,
        })
      );

      await userAPI.updatePriorities(prioritiesArray);
      setStorePriorities(prioritiesArray);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const normalize = () => {
    const currentTotal = Object.values(priorities).reduce((sum, val) => sum + val, 0);
    if (currentTotal === 0) return;

    const normalized: Record<PriorityCategory, number> = {} as any;
    Object.entries(priorities).forEach(([key, value]) => {
      normalized[key as PriorityCategory] = Math.round((value / currentTotal) * 100);
    });

    // Adjust for rounding errors
    const newTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0);
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      const firstKey = Object.keys(normalized)[0] as PriorityCategory;
      normalized[firstKey] += diff;
    }

    setPriorities(normalized);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="card max-w-3xl w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Настройте приоритеты
          </h1>
          <p className="text-gray-400">
            Распределите важность между категориями
          </p>
        </div>

        <div className="space-y-6 mb-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-white font-medium">{category.title}</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  {priorities[category.id]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorities[category.id]}
                onChange={(e) =>
                  handleSliderChange(category.id, parseInt(e.target.value))
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${category.color.replace('bg-', 'rgb(var(--tw-')} 0%, ${category.color.replace('bg-', 'rgb(var(--tw-')} ${priorities[category.id]}%, rgb(51, 65, 85) ${priorities[category.id]}%, rgb(51, 65, 85) 100%)`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Общая сумма:</span>
            <span
              className={`text-2xl font-bold ${
                Math.abs(total - 100) < 0.01
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {total}%
            </span>
          </div>
          {Math.abs(total - 100) > 0.01 && (
            <button
              onClick={normalize}
              className="mt-2 text-sm text-primary-400 hover:text-primary-300"
            >
              Нормализовать до 100%
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading || Math.abs(total - 100) > 0.01}
          className="btn-primary w-full"
        >
          {loading ? 'Сохранение...' : 'Сохранить и продолжить'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">Шаг 2 из 2</p>
        </div>
      </div>
    </div>
  );
}
