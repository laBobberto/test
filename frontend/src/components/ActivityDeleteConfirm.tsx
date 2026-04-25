interface ActivityDeleteConfirmProps {
  isOpen: boolean;
  activityTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActivityDeleteConfirm({
  isOpen,
  activityTitle,
  onConfirm,
  onCancel,
}: ActivityDeleteConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Удалить дело?</h2>
        <p className="text-gray-300 mb-6">
          Вы уверены, что хотите удалить "{activityTitle}"? Это действие нельзя отменить.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Удалить
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 text-white py-2 px-4 rounded hover:bg-slate-600 transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
