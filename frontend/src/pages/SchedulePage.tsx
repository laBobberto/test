import { useState } from 'react';
import { scheduleAPI } from '../services/api';
import Navigation from '../components/Navigation';

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'leti'>('ai');
  const [scheduleText, setScheduleText] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAIParse = async () => {
    if (!scheduleText.trim()) {
      setError('Введите текст расписания');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await scheduleAPI.parseScheduleWithAI(scheduleText);
      setSuccess(`Успешно распознано ${result.activities_created || 0} занятий`);
      setScheduleText('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось распознать расписание');
    } finally {
      setLoading(false);
    }
  };

  const handleLETIImport = async () => {
    if (!groupNumber.trim()) {
      setError('Введите номер группы');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await scheduleAPI.importFromLETI(groupNumber);
      setSuccess(`Успешно импортировано ${result.count || 0} занятий`);
      setGroupNumber('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось импортировать расписание');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen brutal-grid">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold syne gradient-text mb-8">
          Импорт расписания
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Распознать текст (AI)
          </button>
          <button
            onClick={() => setActiveTab('leti')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'leti'
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Импорт из ЛЭТИ
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6">
            <p className="text-green-500 text-sm font-medium">{success}</p>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Распознавание расписания с помощью AI</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Вставьте текст вашего расписания (скопированный из документа, скриншота или любого другого источника).
              AI автоматически распознает занятия, время и создаст активности в вашем календаре.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Текст расписания
                </label>
                <textarea
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="input w-full"
                  rows={12}
                  placeholder="Например:&#10;Понедельник&#10;9:00-10:30 Математический анализ, ауд. 123&#10;10:45-12:15 Программирование, ауд. 456&#10;&#10;Вторник&#10;9:00-10:30 Физика, ауд. 789&#10;..."
                />
              </div>

              <button
                onClick={handleAIParse}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Обработка...' : 'Распознать и добавить в календарь'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'leti' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Импорт из ЛЭТИ API</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Автоматически загрузите расписание из системы ЛЭТИ по номеру группы.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Номер группы
                </label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  className="input w-full"
                  placeholder="Например: 0304"
                />
              </div>

              <button
                onClick={handleLETIImport}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Загрузка...' : 'Импортировать расписание'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-xl">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong>Примечание:</strong> Расписание будет автоматически добавлено в ваш календарь как повторяющиеся активности.
                Вы сможете редактировать или удалять их в любое время.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
