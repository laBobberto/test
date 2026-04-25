import { useState } from 'react';
import { ActivityFormData } from '../types';

interface ActivityCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: ActivityFormData) => void;
}

export default function ActivityCreateForm({
  isOpen,
  onClose,
  onCreate,
}: ActivityCreateFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    category: 'education',
    start_time: '',
    end_time: '',
    location: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'education',
      start_time: '',
      end_time: '',
      location: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Создать новое дело</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={formData.title}
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
              value={formData.description}
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
              value={formData.category}
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
                value={formData.start_time}
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
                value={formData.end_time}
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
              value={formData.location}
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
              Создать
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
