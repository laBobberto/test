import { create } from 'zustand';
import type { User, Priority, Activity, UserStats } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

interface PrioritiesState {
  priorities: Priority[];
  setPriorities: (priorities: Priority[]) => void;
}

export const usePrioritiesStore = create<PrioritiesState>((set) => ({
  priorities: [],
  setPriorities: (priorities) => set({ priorities }),
}));

interface ActivitiesState {
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: number, updates: Partial<Activity>) => void;
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  updateActivity: (id, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
}));

interface StatsState {
  stats: UserStats | null;
  setStats: (stats: UserStats) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));
