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

export interface AIChatMessage {
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

// Challenges & Quests
export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category?: PriorityCategory;
  goal: number;
  current_progress: number;
  reward_points: number;
  reward_currency?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'expired';
  icon?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  steps: QuestStep[];
  reward_points: number;
  reward_currency: number;
  reward_items?: string[];
  status: 'locked' | 'active' | 'completed';
  completion_percentage: number;
}

// Virtual Currency
export interface VirtualCurrency {
  user_id: number;
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface CurrencyTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  source: string;
  description: string;
  created_at: string;
}

export interface StoreItem {
  id: number;
  title: string;
  description: string;
  category: 'discount' | 'premium' | 'cosmetic' | 'physical';
  price: number;
  image_url?: string;
  stock?: number;
  partner?: string;
  discount_code?: string;
  available: boolean;
}

export interface Purchase {
  id: number;
  user_id: number;
  item_id: number;
  item_title: string;
  price: number;
  status: 'pending' | 'completed' | 'used';
  purchased_at: string;
  used_at?: string;
  code?: string;
}

// Blog & News
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  author_avatar?: string;
  category: 'news' | 'events' | 'guide' | 'tips';
  tags: string[];
  image_url?: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  is_liked?: boolean;
  related_event_id?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// Event Companions
export interface EventCompanion {
  id: number;
  event_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  message: string;
  max_companions: number;
  current_companions: number;
  status: 'open' | 'full' | 'closed';
  created_at: string;
  interests?: string[];
}

export interface CompanionRequest {
  id: number;
  companion_post_id: number;
  user_id: number;
  username: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface EventGroupMember {
  user_id: number;
  username: string;
  avatar_url?: string;
  joined_at: string;
}

export interface EventGroup {
  id: number;
  event_id: number;
  name: string;
  description: string;
  creator_id: number;
  members: EventGroupMember[];
  max_members: number;
  meeting_point?: string;
  meeting_time?: string;
  status: 'open' | 'full' | 'closed';
}

