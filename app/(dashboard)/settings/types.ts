// Settings Types

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
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
  thumbnail_height?: number;
  thumbnail_width?: number;
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

export interface Usage {
  current_month: {
    articles_created: number;
    articles_limit: number;
    outlines_created: number;
    outlines_limit: number;
    topics_generated: number;
    topics_limit: number;
    keyword_queries: number;
    keyword_limit: number;
    integrations_used: number;
    integrations_limit: number;
    image_generations: number;
    image_generations_limit: number;
  };
  all_time: {
    total_articles: number;
    total_words: number;
    total_outlines: number;
  };
  subscription: {
    tier: "trial" | "starter" | "professional" | "business";
    status: "active" | "inactive" | "trial";
  };
}

export interface SubscriptionDetails {
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  days_until_renewal: number;
  cancel_at_period_end: boolean;
}

export interface SubscriptionLimits {
  articles: number;
  outlines: number;
  topics: number;
  keyword_queries: number;
  integrations: number;
  authors: number;
  competitors: number;
}

export interface SubscriptionUsageData {
  articles: number;
  outlines: number;
  topics: number;
  keyword_queries: number;
  integrations: number;
  authors: number;
  competitors: number;
}

export interface SubscriptionUsagePercentages {
  articles: number;
  outlines: number;
  topics: number;
  keyword_queries: number;
  integrations: number;
  authors: number;
  competitors: number;
}

export interface Subscription {
  tier: "trial" | "starter" | "professional" | "business";
  status: "active" | "inactive" | "trial" | "canceled" | "on_trial";
  subscription_details: SubscriptionDetails | null;
  limits: SubscriptionLimits;
  usage: SubscriptionUsageData;
  usage_percentages: SubscriptionUsagePercentages;
  suggested_upgrade_tier?: string;
}

export interface UpgradePromptData {
  error: string;
  message: string;
  current_usage: number;
  limit: number;
  suggested_tier: string;
  upgrade_required: boolean;
}

export interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}
