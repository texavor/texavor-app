// Settings Types

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_status: "active" | "inactive" | "trial";
}

export interface EmailNotifications {
  article_published?: boolean;
  weekly_digest?: boolean;
  support_updates?: boolean;
}

export interface UIPreferences {
  theme?: "light" | "dark";
  language?: string;
  sidebar_collapsed?: boolean;
}

export interface UserPreferences {
  email_notifications?: EmailNotifications;
  ui_preferences?: UIPreferences;
}

export interface Blog {
  id: string;
  name: string;
  website_url: string;
  sitemap_url: string;
  status: string;
  product_description?: string;
  target_audience?: string;
  tone_of_voice?: string;
  competitors?: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key_digest: string;
  last_used_at: string | null;
  expires_at: string | null;
  expired: boolean;
  created_at: string;
}

export interface NewApiKey extends ApiKey {
  api_key: string;
  message: string;
}

export interface CurrentMonthUsage {
  articles_created: number;
  keyword_searches: number;
  topic_generations: number;
  outline_generations: number;
  api_calls: number;
}

export interface AllTimeUsage {
  total_articles: number;
  total_words: number;
  total_outlines: number;
}

export interface Usage {
  current_month: CurrentMonthUsage;
  all_time: AllTimeUsage;
}

export interface SubscriptionUsage {
  articles_created: number;
  articles_limit: number;
  api_calls_this_month: number;
  api_calls_limit: number;
}

export interface Subscription {
  tier: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "trial";
  trial_ends_at: string | null;
  usage: SubscriptionUsage;
}

export interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}
