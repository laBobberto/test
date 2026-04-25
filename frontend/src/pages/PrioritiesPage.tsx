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
    education: 3,
    career: 3,
    health: 3,
    leisure: 3,
    social: 3,
    household: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setPriorities: setStorePriorities } = usePrioritiesStore();

  const handleStarClick = (category: PriorityCategory, stars: number) => {
    setPriorities((prev) => ({
      ...prev,
      [category]: stars,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      // Конвертируем звезды (0-5) в проценты для бэкенда
      const totalStars = Object.values(priorities).reduce((sum, val) => sum + val, 0);
      const prioritiesArray: Priority[] = Object.entries(priorities).map(
        ([category, stars]) => ({
          category,
          value: totalStars > 0 ? Math.round((stars / totalStars) * 100) : 0,
        })
      );

      // Нормализуем до 100%
      const currentTotal = prioritiesArray.reduce((sum, p) => sum + p.value, 0);
      if (currentTotal !== 100 && currentTotal > 0) {
        const diff = 100 - currentTotal;
        prioritiesArray[0].value += diff;
      }

      await userAPI.updatePriorities(prioritiesArray);
      setStorePriorities(prioritiesArray);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
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
              Оцените важность каждой категории от 1 до 5 звезд
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">
                    {category.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(category.id, star)}
                      className="transition-all duration-200 hover:scale-110 focus:outline-none"
                      type="button"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= priorities[category.id]
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600 fill-none'
                        }`}
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[var(--text-secondary)]">
                    ({priorities[category.id]} / 5)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
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
