// Types matching the Supabase schema
export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';
export type DrawStatus = 'pending' | 'simulated' | 'published';
export type DrawMode = 'random' | 'algorithm';
export type MatchType = '5-match' | '4-match' | '3-match';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  charity_id: string | null;
  charity_percentage: number;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: SubscriptionPlan | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_date: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  subscription_id: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  status: DrawStatus;
  draw_mode: DrawMode | null;
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rollover: number;
  created_at: string;
  published_at: string | null;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_scores: number[];
  created_at: string;
}

export interface Winning {
  id: string;
  draw_id: string;
  user_id: string;
  draw_entry_id: string;
  match_type: MatchType;
  amount: number;
  proof_url: string | null;
  verification_status: VerificationStatus;
  payment_status: PaymentStatus;
  admin_notes: string | null;
  created_at: string;
  verified_at: string | null;
  // Joined fields
  profiles?: Profile;
  draws?: Draw;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Extended types for frontend use
export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  currentMonthDrawStatus: DrawStatus | null;
}

export interface ScoreWithTrend extends Score {
  trend?: 'up' | 'down' | 'stable';
}

export interface DrawWithWinners extends Draw {
  winners: (Winning & { profiles: Profile })[];
  total_entries: number;
}

export interface CharityWithStats extends Charity {
  total_donors: number;
  total_contributions: number;
}
