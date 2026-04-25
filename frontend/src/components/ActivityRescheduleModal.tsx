import { useState } from 'react';
import type { Activity } from '../types';

interface ActivityRescheduleModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (id: number, start_time: string, end_time: string) => void;
}

export default function ActivityRescheduleModal({
  activity,
  isOpen,
  onClose,
  onReschedule,
}: ActivityRescheduleModalProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReschedule(activity.id, startTime, endTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Перенести дело</h2>
        <p className="text-gray-300 mb-4">"{activity.title}"</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Новое время начала
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Новое время окончания
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded hover:bg-primary-600 transition"
            >
              Перенести
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
