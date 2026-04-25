export interface User {
  id: number;
  email: string;
  username: string;
  roles: string[];
  created_at: string;
}

export interface Priority {
  id?: number;
  category: string;
  value: number;
}

export interface Activity {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category: string;
  start_time: string;
  end_time: string;
  location?: string;
  completed: boolean;
  points_earned: number;
  created_at: string;
  is_custom?: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[];
    end_date?: string;
  };
  updated_at?: string;
}

export interface ActivityFormData {
  title: string;
  description?: string;
  category: string;
  start_time: string;
  end_time: string;
  location?: string;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[];
    end_date?: string;
  };
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  source_url?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  points: number;
  category?: string;
}

export interface UserStats {
  total_points: number;
  current_streak: number;
  completed_activities: number;
  achievements_count: number;
  balance_score: number;
}

export interface DailyPlan {
  date: string;
  activities: Activity[];
  suggestions: string[];
  balance_score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export type UserRole = 'student' | 'resident' | 'tourist';

export type PriorityCategory = 
  | 'education' 
  | 'career' 
  | 'health' 
  | 'leisure' 
  | 'social' 
  | 'household';

export interface Group {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export interface GroupMember {
  id: number;
  user_id: number;
  group_id: number;
  username: string;
  joined_at: string;
  role: 'owner' | 'member';
}

export interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  username: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  total_points: number;
  rank: number;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Chat {
  id: number;
  type: 'group' | 'direct';
  group_id?: number;
  group_name?: string;
  friend_id?: number;
  friend_username?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

