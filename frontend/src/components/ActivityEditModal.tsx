import { useState, useEffect } from 'react';
import type { Activity, ActivityFormData } from '../types';

interface ActivityEditModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<ActivityFormData>) => void;
}

export default function ActivityEditModal({
  activity,
  isOpen,
  onClose,
  onSave,
}: ActivityEditModalProps) {
  const [formData, setFormData] = useState<Partial<ActivityFormData>>({});

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description,
        category: activity.category,
        start_time: activity.start_time,
        end_time: activity.end_time,
        location: activity.location,
        recurrence: activity.recurrence,
      });
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activity.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Редактировать дело</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Категория
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              required
            >
              <option value="education">Образование</option>
              <option value="career">Карьера</option>
              <option value="health">Здоровье</option>
              <option value="leisure">Досуг</option>
              <option value="social">Социальное</option>
              <option value="household">Быт</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Начало
              </label>
              <input
                type="datetime-local"
                value={formData.start_time ? new Date(formData.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Конец
              </label>
              <input
                type="datetime-local"
                value={formData.end_time ? new Date(formData.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Место
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              placeholder="Адрес или название места"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 text-white py-2 px-4 rounded hover:bg-slate-600 transition"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
