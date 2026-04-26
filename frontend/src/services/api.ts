import axios from 'axios';
import type { 
  User, 
  Priority, 
  Activity, 
  Event, 
  Achievement, 
  UserStats, 
  DailyPlan,
  AuthResponse,
  Group,
  GroupMember,
  Friend,
  LeaderboardEntry,
  Chat,
  ChatMessage,
  Challenge,
  Quest,
  VirtualCurrency,
  CurrencyTransaction,
  StoreItem,
  Purchase,
  BlogPost,
  BlogCategory,
  EventCompanion,
  CompanionRequest,
  EventGroup
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string, roles: string[]) => {
    const response = await api.post<User>('/api/auth/register', {
      email,
      username,
      password,
      roles,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get<User>('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/api/user/profile', data);
    return response.data;
  },

  updatePriorities: async (priorities: Priority[]) => {
    const response = await api.put<Priority[]>('/api/user/priorities', {
      priorities,
    });
    return response.data;
  },

  getPriorities: async () => {
    const response = await api.get<Priority[]>('/api/user/priorities');
    return response.data;
  },

  updateLocationPreferences: async (homeAddress?: string, maxTravelTime?: number) => {
    const response = await api.put('/api/user/location-preferences', {
      home_address: homeAddress,
      max_travel_time: maxTravelTime,
    });
    return response.data;
  },

  getLocationPreferences: async () => {
    const response = await api.get('/api/user/location-preferences');
    return response.data;
  },
};

// Plan API
export const planAPI = {
  generatePlan: async (message: string, context?: any) => {
    const response = await api.post('/api/plan/generate', {
      message,
      context,
    });
    return response.data;
  },

  getDailyPlan: async (date?: string) => {
    const response = await api.get<DailyPlan>('/api/plan/daily', {
      params: { date },
    });
    return response.data;
  },

  chat: async (message: string, context?: any) => {
    const response = await api.post('/api/plan/chat', {
      message,
      context,
    });
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (category?: string, date?: string, limit: number = 50) => {
    const response = await api.get<Event[]>('/api/events/', {
      params: { category, date, limit },
    });
    return response.data;
  },

  getEvent: async (id: number) => {
    const response = await api.get<Event>(`/api/events/${id}`);
    return response.data;
  },
};

// Activities API
export const activitiesAPI = {
  createActivity: async (activity: Omit<Activity, 'id' | 'user_id' | 'completed' | 'points_earned' | 'created_at'>) => {
    const response = await api.post<Activity>('/api/activities/', activity);
    return response.data;
  },

  getActivities: async () => {
    const response = await api.get<Activity[]>('/api/activities/');
    return response.data;
  },

  getActivity: async (id: number) => {
    const response = await api.get<Activity>(`/api/activities/${id}`);
    return response.data;
  },

  updateActivity: async (id: number, data: Partial<Activity>) => {
    const response = await api.put<Activity>(`/api/activities/${id}`, data);
    return response.data;
  },

  deleteActivity: async (id: number) => {
    await api.delete(`/api/activities/${id}`);
  },

  rescheduleActivity: async (id: number, start_time: string, end_time: string) => {
    const response = await api.patch<Activity>(`/api/activities/${id}/reschedule`, {
      start_time,
      end_time,
    });
    return response.data;
  },

  completeActivity: async (activityId: number) => {
    const response = await api.post<Activity>('/api/activities/complete', {
      activity_id: activityId,
    });
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get<Achievement[]>('/api/activities/achievements');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<UserStats>('/api/activities/stats');
    return response.data;
  },
};

export default api;

// Maps API
export const mapsAPI = {
  geocode: async (address: string) => {
    const response = await api.get('/api/maps/geocode', {
      params: { address }
    });
    return response.data;
  },

  reverseGeocode: async (lat: number, lon: number) => {
    const response = await api.get('/api/maps/reverse-geocode', {
      params: { lat, lon }
    });
    return response.data;
  },

  getRoute: async (
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
    mode: 'auto' | 'pedestrian' | 'transit' = 'auto'
  ) => {
    const response = await api.get('/api/maps/route', {
      params: {
        from_lat: fromLat,
        from_lon: fromLon,
        to_lat: toLat,
        to_lon: toLon,
        mode
      }
    });
    return response.data;
  },

  getTraffic: async (city: string = 'Saint Petersburg') => {
    const response = await api.get('/api/maps/traffic', {
      params: { city }
    });
    return response.data;
  },
};

// Groups API
export const groupsAPI = {
  createGroup: async (name: string, description?: string) => {
    const response = await api.post<Group>('/api/groups/', {
      name,
      description,
    });
    return response.data;
  },

  getGroups: async () => {
    const response = await api.get<Group[]>('/api/groups/');
    return response.data;
  },

  getGroup: async (id: number) => {
    const response = await api.get<Group>(`/api/groups/${id}`);
    return response.data;
  },

  joinGroup: async (id: number) => {
    const response = await api.post(`/api/groups/${id}/join`);
    return response.data;
  },

  leaveGroup: async (id: number) => {
    await api.post(`/api/groups/${id}/leave`);
  },

  getMembers: async (id: number) => {
    const response = await api.get<GroupMember[]>(`/api/groups/${id}/members`);
    return response.data;
  },

  deleteGroup: async (id: number) => {
    await api.delete(`/api/groups/${id}`);
  },
};

// Friends API
export const friendsAPI = {
  sendRequest: async (friendId: number) => {
    const response = await api.post<Friend>('/api/social/friends/request', {
      friend_id: friendId,
    });
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get<Friend[]>('/api/social/friends');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get<Friend[]>('/api/social/friends/pending');
    return response.data;
  },

  acceptRequest: async (requestId: number) => {
    const response = await api.post(`/api/social/friends/accept/${requestId}`);
    return response.data;
  },

  rejectRequest: async (requestId: number) => {
    await api.delete(`/api/social/friends/${requestId}`);
  },

  removeFriend: async (friendId: number) => {
    await api.delete(`/api/social/friends/${friendId}`);
  },

  searchUsers: async (query: string) => {
    const response = await api.get<User[]>('/api/user/search', {
      params: { query },
    });
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: async (limit: number = 50) => {
    const response = await api.get<{ users: LeaderboardEntry[] }>('/api/leaderboard/global', {
      params: { limit },
    });
    return response.data.users || [];
  },

  getFriends: async () => {
    const response = await api.get<{ users: LeaderboardEntry[] }>('/api/leaderboard/friends');
    return response.data.users || [];
  },

  getGroup: async (groupId: number) => {
    const response = await api.get<{ users: LeaderboardEntry[] }>(`/api/leaderboard/group/${groupId}`);
    return response.data.users || [];
  },
};

// Schedule API
export const scheduleAPI = {
  parseScheduleWithAI: async (text: string) => {
    const response = await api.post('/api/schedule/parse', { text });
    return response.data;
  },

  importFromLETI: async (groupNumber: string) => {
    const response = await api.post('/api/leti/import-schedule', null, {
      params: { group_number: groupNumber },
    });
    return response.data;
  },

  getSchedule: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/api/schedule/', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getChats: async () => {
    const response = await api.get<Chat[]>('/api/chats/');
    return response.data;
  },

  getGroupChat: async (groupId: number) => {
    const response = await api.get<Chat>(`/api/chats/group/${groupId}`);
    return response.data;
  },

  getDirectChat: async (friendId: number) => {
    const response = await api.get<Chat>(`/api/chats/direct/${friendId}`);
    return response.data;
  },

  getMessages: async (chatId: number, limit: number = 50, offset: number = 0) => {
    const response = await api.get<ChatMessage[]>(`/api/chats/${chatId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },

  sendMessage: async (chatId: number, content: string) => {
    const response = await api.post<ChatMessage>(`/api/chats/${chatId}/messages`, {
      content,
    });
    return response.data;
  },

  markAsRead: async (chatId: number) => {
    await api.post(`/api/chats/${chatId}/read`);
  },
};

// Challenges API
export const challengesAPI = {
  getChallenges: async (type?: string) => {
    const response = await api.get<Challenge[]>('/api/challenges/', {
      params: { type },
    });
    return response.data;
  },

  getChallenge: async (id: number) => {
    const response = await api.get<Challenge>(`/api/challenges/${id}`);
    return response.data;
  },

  acceptChallenge: async (id: number) => {
    const response = await api.post<Challenge>(`/api/challenges/${id}/accept`);
    return response.data;
  },

  completeChallenge: async (id: number) => {
    const response = await api.post<Challenge>(`/api/challenges/${id}/complete`);
    return response.data;
  },

  getActiveChallenges: async () => {
    const response = await api.get<Challenge[]>('/api/challenges/active');
    return response.data;
  },
};

// Quests API
export const questsAPI = {
  getQuests: async () => {
    const response = await api.get<Quest[]>('/api/quests/');
    return response.data;
  },

  getQuest: async (id: number) => {
    const response = await api.get<Quest>(`/api/quests/${id}`);
    return response.data;
  },

  startQuest: async (id: number) => {
    const response = await api.post<Quest>(`/api/quests/${id}/start`);
    return response.data;
  },

  completeQuestStep: async (questId: number, stepId: number) => {
    const response = await api.post<Quest>(`/api/quests/${questId}/steps/${stepId}/complete`);
    return response.data;
  },
};

// Currency API
export const currencyAPI = {
  getBalance: async () => {
    const response = await api.get<VirtualCurrency>('/api/currency/balance');
    return response.data;
  },

  getTransactions: async (limit: number = 50) => {
    const response = await api.get<CurrencyTransaction[]>('/api/currency/transactions', {
      params: { limit },
    });
    return response.data;
  },

  getStoreItems: async (category?: string) => {
    const response = await api.get<StoreItem[]>('/api/store/items', {
      params: { category },
    });
    return response.data;
  },

  purchaseItem: async (itemId: number) => {
    const response = await api.post<Purchase>('/api/store/purchase', { item_id: itemId });
    return response.data;
  },

  getPurchases: async () => {
    const response = await api.get<Purchase[]>('/api/store/purchases');
    return response.data;
  },

  useItem: async (purchaseId: number) => {
    const response = await api.post<Purchase>(`/api/store/purchases/${purchaseId}/use`);
    return response.data;
  },
};

// Blog API
export const blogAPI = {
  getPosts: async (params?: { category?: string; tag?: string; limit?: number; offset?: number }) => {
    const response = await api.get<BlogPost[]>('/api/blog/posts', { params });
    return response.data;
  },

  getPost: async (slug: string) => {
    const response = await api.get<BlogPost>(`/api/blog/posts/${slug}`);
    return response.data;
  },

  likePost: async (id: number) => {
    const response = await api.post<BlogPost>(`/api/blog/posts/${id}/like`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<BlogCategory[]>('/api/blog/categories');
    return response.data;
  },

  getTrendingPosts: async (limit: number = 5) => {
    const response = await api.get<BlogPost[]>('/api/blog/trending', { params: { limit } });
    return response.data;
  },

  searchPosts: async (query: string) => {
    const response = await api.get<BlogPost[]>('/api/blog/search', { params: { q: query } });
    return response.data;
  },
};

// Event Companions API
export const companionsAPI = {
  getAllCompanions: async (category?: string) => {
    const response = await api.get<EventCompanion[]>('/api/companions/', {
      params: { category },
    });
    return response.data;
  },

  getCompanionPosts: async (eventId: number) => {
    const response = await api.get<EventCompanion[]>(`/api/events/${eventId}/companions`);
    return response.data;
  },

  createCompanionPost: async (data: { event_id: number; message: string; max_companions: number }) => {
    const response = await api.post<EventCompanion>('/api/companions/posts', data);
    return response.data;
  },

  deleteCompanionPost: async (id: number) => {
    await api.delete(`/api/companions/posts/${id}`);
  },

  sendCompanionRequest: async (postId: number, message: string) => {
    const response = await api.post<CompanionRequest>(`/api/companions/posts/${postId}/requests`, {
      message,
    });
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get<CompanionRequest[]>('/api/companions/requests');
    return response.data;
  },

  acceptRequest: async (requestId: number) => {
    const response = await api.post<CompanionRequest>(`/api/companions/requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId: number) => {
    const response = await api.post<CompanionRequest>(`/api/companions/requests/${requestId}/reject`);
    return response.data;
  },

  getEventGroups: async (eventId: number) => {
    const response = await api.get<EventGroup[]>(`/api/events/${eventId}/groups`);
    return response.data;
  },

  createEventGroup: async (data: {
    event_id: number;
    name: string;
    description: string;
    max_members: number;
  }) => {
    const response = await api.post<EventGroup>('/api/event-groups', data);
    return response.data;
  },

  joinEventGroup: async (groupId: number) => {
    const response = await api.post<EventGroup>(`/api/event-groups/${groupId}/join`);
    return response.data;
  },

  leaveEventGroup: async (groupId: number) => {
    await api.post(`/api/event-groups/${groupId}/leave`);
  },
};
