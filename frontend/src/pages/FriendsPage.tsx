import { useState, useEffect } from 'react';
import { friendsAPI, chatAPI } from '../services/api';
import type { Friend, User } from '../types';
import ChatWindow from '../components/ChatWindow';
import Navigation from '../components/Navigation';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState('');

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    console.log('loadFriends called');
    try {
      setLoading(true);
      console.log('Fetching friends...');
      const data = await friendsAPI.getFriends();
      console.log('Loaded friends data:', data);
      const filtered = data.filter(f => f.status === 'accepted');
      console.log('Filtered friends:', filtered);
      setFriends(filtered);
    } catch (err: any) {
      console.error('Error loading friends:', err);
      setError('Не удалось загрузить друзей');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await friendsAPI.getPendingRequests();
      setPendingRequests(data);
    } catch (err: any) {
      console.error('Не удалось загрузить запросы');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await friendsAPI.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError('Не удалось найти пользователей');
    }
  };

  const handleSendRequest = async (userId: number) => {
    try {
      await friendsAPI.sendRequest(userId);
      setError('');
      alert('Запрос отправлен');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отправить запрос');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      loadFriends();
      loadPendingRequests();
    } catch (err: any) {
      setError('Не удалось принять запрос');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await friendsAPI.rejectRequest(requestId);
      loadPendingRequests();
    } catch (err: any) {
      setError('Не удалось отклонить запрос');
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await friendsAPI.removeFriend(friendId);
      loadFriends();
    } catch (err: any) {
      setError('Не удалось удалить друга');
    }
  };

  const handleOpenChat = async (friend: Friend) => {
    try {
      const chat = await chatAPI.getDirectChat(friend.friend_id);
      setActiveChatId(chat.id);
      setActiveChatTitle(friend.username);
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
    <div className="min-h-screen brutal-grid">
      <Navigation />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold syne gradient-text mb-8">Друзья</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Мои друзья ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Запросы ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Поиск
          </button>
        </div>

        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div key={friend.id} className="card">
                <h3 className="text-xl font-bold mb-2">{friend.friend_username || friend.username}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Друзья с {new Date(friend.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenChat(friend)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Написать
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend.friend_id)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-[var(--text-secondary)]">
                  У вас пока нет друзей
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="card">
                <h3 className="text-xl font-bold mb-2">{request.friend_username || request.username}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Запрос от {new Date(request.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-[var(--text-secondary)]">
                  Нет входящих запросов
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input flex-1"
                placeholder="Введите имя пользователя"
              />
              <button onClick={handleSearch} className="btn-primary">
                Найти
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((user) => (
                <div key={user.id} className="card">
                  <h3 className="text-xl font-bold mb-2">{user.username}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mb-4">
                    {user.email}
                  </p>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="btn-primary w-full text-sm"
                  >
                    Добавить в друзья
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery && (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-[var(--text-secondary)]">
                    Пользователи не найдены
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
