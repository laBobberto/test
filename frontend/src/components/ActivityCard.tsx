import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onReschedule: (activity: Activity) => void;
}

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
  onComplete,
  onReschedule,
}: ActivityCardProps) {
  const startTime = new Date(activity.start_time).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(activity.end_time).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryColors: Record<string, string> = {
    education: 'border-blue-500',
    career: 'border-purple-500',
    health: 'border-green-500',
    leisure: 'border-yellow-500',
    social: 'border-pink-500',
    household: 'border-gray-500',
  };

  const categoryLabels: Record<string, string> = {
    education: 'Образование',
    career: 'Карьера',
    health: 'Здоровье',
    leisure: 'Досуг',
    social: 'Социальное',
    household: 'Быт',
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${categoryColors[activity.category] || 'border-gray-500'} ${activity.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
            {!activity.is_custom && (
              <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded">AI</span>
            )}
            {activity.recurrence && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                {activity.recurrence.type === 'daily' ? 'Ежедневно' : 
                 activity.recurrence.type === 'weekly' ? 'Еженедельно' : 
                 'Ежемесячно'}
              </span>
            )}
          </div>
          
          {activity.description && (
            <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{startTime} - {endTime}</span>
            {activity.location && <span>{activity.location}</span>}
            <span className="capitalize">{categoryLabels[activity.category] || activity.category}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {!activity.completed && (
            <>
              <button
                onClick={() => onEdit(activity)}
                className="p-2 text-blue-400 hover:bg-slate-700 rounded transition"
                title="Редактировать"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onReschedule(activity)}
                className="p-2 text-yellow-400 hover:bg-slate-700 rounded transition"
                title="Перенести"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => onComplete(activity.id)}
                className="p-2 text-green-400 hover:bg-slate-700 rounded transition"
                title="Завершить"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(activity.id)}
            className="p-2 text-red-400 hover:bg-slate-700 rounded transition"
            title="Удалить"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {activity.completed && (
        <div className="mt-2 text-green-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Завершено (+{activity.points_earned} баллов)
        </div>
      )}
    </div>
  );
}
