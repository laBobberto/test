import { useState, useEffect } from 'react';
import { groupsAPI, chatAPI } from '../services/api';
import type { Group } from '../types';
import ChatWindow from '../components/ChatWindow';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [error, setError] = useState('');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.getGroups();
      setGroups(data);
    } catch (err: any) {
      setError('Не удалось загрузить группы');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Введите название группы');
      return;
    }

    try {
      await groupsAPI.createGroup(newGroupName, newGroupDescription);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать группу');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupsAPI.joinGroup(groupId);
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось вступить в группу');
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      await groupsAPI.leaveGroup(groupId);
      loadGroups();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось покинуть группу');
    }
  };

  const handleOpenChat = async (group: Group) => {
    try {
      const chat = await chatAPI.getGroupChat(group.id);
      setActiveChatId(chat.id);
      setActiveChatTitle(group.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось открыть чат');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 brutal-grid">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold syne gradient-text">Группы</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Создать группу
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="card">
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {group.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-tertiary)]">
                  {group.member_count || 0} участников
                </span>
              </div>
              <div className="flex gap-2">
                {group.is_member ? (
                  <>
                    <button
                      onClick={() => handleOpenChat(group)}
                      className="btn-primary flex-1 text-sm"
                    >
                      Чат
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Покинуть
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="btn-primary w-full text-sm"
                  >
                    Вступить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-[var(--text-secondary)]">
              Пока нет групп. Создайте первую!
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Создать группу</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название группы
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="input w-full"
                  placeholder="Введите название"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Описание (необязательно)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="Введите описание"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateGroup}
                  className="btn-primary flex-1"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                    setNewGroupDescription('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeChatId && (
        <ChatWindow
          chatId={activeChatId}
          chatTitle={activeChatTitle}
          onClose={() => setActiveChatId(null)}
        />
      )}
    </div>
  );
}
