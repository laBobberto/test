import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { usePrioritiesStore } from '../store';
import type { Priority, PriorityCategory } from '../types';

const categories: { id: PriorityCategory; title: string }[] = [
  { id: 'education', title: 'Образование' },
  { id: 'career', title: 'Карьера' },
  { id: 'health', title: 'Здоровье' },
  { id: 'leisure', title: 'Досуг' },
  { id: 'social', title: 'Социализация' },
  { id: 'household', title: 'Быт' },
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

    const newTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0);
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      const firstKey = Object.keys(normalized)[0] as PriorityCategory;
      normalized[firstKey] += diff;
    }

    setPriorities(normalized);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 brutal-grid">
      <div className="max-w-3xl w-full animate-fade-in">
        <div className="card">
          <div className="mb-10">
            <h1 className="text-4xl font-bold syne mb-3 gradient-text">
              Настройте приоритеты
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Распределите важность между категориями
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {category.title}
                  </span>
                  <span className="text-3xl font-bold syne gradient-text">
                    {priorities[category.id]}%
                  </span>
                </div>
                <div className="relative">
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300"
                      style={{ width: `${priorities[category.id]}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priorities[category.id]}
                    onChange={(e) =>
                      handleSliderChange(category.id, parseInt(e.target.value))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-[var(--bg-tertiary)] p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">
                Общая сумма:
              </span>
              <span
                className={`text-4xl font-bold syne ${
                  Math.abs(total - 100) < 0.01
                    ? 'gradient-text'
                    : 'text-[var(--text-tertiary)]'
                }`}
              >
                {total}%
              </span>
            </div>
            {Math.abs(total - 100) > 0.01 && (
              <button
                onClick={normalize}
                className="btn-secondary w-full text-sm"
              >
                Нормализовать до 100%
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading || Math.abs(total - 100) > 0.01}
            className="btn-primary w-full text-base font-semibold mb-6"
          >
            {loading ? 'Сохранение...' : 'Сохранить и продолжить'}
          </button>

          <div className="text-center pt-6 border-t border-[var(--border-primary)]">
            <p className="mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Шаг 2 / 2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
