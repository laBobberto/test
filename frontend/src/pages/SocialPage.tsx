import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  friend_username: string;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  content: string;
  read_at: string | null;
  created_at: string;
}

const SocialPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'messages'>('friends');

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages(selectedFriend);
    }
  }, [selectedFriend]);

  const loadFriends = async () => {
    try {
      const response = await api.get('/social/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await api.get('/social/friends/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadMessages = async (friendId: number) => {
    try {
      const response = await api.get(`/social/messages/${friendId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchUsername.trim()) return;
    
    try {
      await api.post('/social/friends/request', null, {
        params: { friend_username: searchUsername }
      });
      setSearchUsername('');
      alert('Friend request sent!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to send request');
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      await api.post(`/social/friends/accept/${requestId}`);
      loadFriends();
      loadRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const removeFriend = async (friendshipId: number) => {
    if (!confirm('Remove this friend?')) return;
    
    try {
      await api.delete(`/social/friends/${friendshipId}`);
      loadFriends();
      setSelectedFriend(null);
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedFriend || !newMessage.trim()) return;
    
    try {
      await api.post('/social/messages', {
        to_user_id: selectedFriend,
        content: newMessage
      });
      setNewMessage('');
      loadMessages(selectedFriend);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const currentUserId = parseInt(localStorage.getItem('user_id') || '0');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Social</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 ${activeTab === 'friends' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 ${activeTab === 'messages' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
        >
          Messages
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Friend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Friend</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={sendFriendRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Request
              </button>
            </div>
          </div>

          {/* Friend Requests */}
          {requests.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Friend Requests ({requests.length})</h2>
              <div className="space-y-2">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{request.friend_username}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => removeFriend(request.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">My Friends</h2>
            {friends.length === 0 ? (
              <p className="text-gray-500">No friends yet. Add some friends to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="p-4 bg-gray-50 rounded flex items-center justify-between">
                    <span className="font-medium">{friend.friend_username}</span>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Friends List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Chats</h2>
            {friends.length === 0 ? (
              <p className="text-gray-500 text-sm">No friends to chat with</p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend.friend_id)}
                    className={`w-full text-left p-3 rounded ${
                      selectedFriend === friend.friend_id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {friend.friend_username}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
            {selectedFriend ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    {friends.find(f => f.friend_id === selectedFriend)?.friend_username}
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
                  ) : (
                    messages.slice().reverse().map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from_user_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.from_user_id === currentUserId
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a friend to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPage;
