import axios from 'axios';
import type { 
  User, 
  Priority, 
  Activity, 
  Event, 
  Achievement, 
  UserStats, 
  DailyPlan,
  AuthResponse 
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
