export interface AeoVisibilityScore {
  date: string;
  overall_score: number;
  interpretation:
    | "Excellent"
    | "Good"
    | "Fair"
    | "Poor"
    | "Critical"
    | "No data";
  color: "green" | "blue" | "yellow" | "orange" | "red" | "gray";
  presence_rate: number;
  cross_model_consistency: number;
  total_mentions: number;
  total_prompts_tested: number;
  platforms_count: number;
  trend: {
    direction: "up" | "down" | "neutral";
    change: number;
  };
  best_platform?: string;
  worst_platform?: string;
}

export interface PlatformBreakdown {
  [platform: string]: {
    score: number;
    mentions: number;
    total: number;
    mention_rate: string;
    avg_position?: number;
  };
}

export interface CategoryBreakdown {
  [category: string]: {
    score: number;
    mentions: number;
    total: number;
    prompts_count: number;
  };
}

export interface AeoPrompt {
  id: string;
  prompt_text: string;
  category:
    | "product_discovery"
    | "software_selection"
    | "brand_awareness"
    | "local_services"
    | "general";
  priority: number;
  active: boolean;
  visibility_score: number;
  brand_mentioned_today: boolean;
  response_count_today: number;
  created_at: string;
  updated_at: string;
}

export interface AeoMetricsOverview {
  current_score: AeoVisibilityScore | null;
  historical_scores: AeoVisibilityScore[];
  platform_breakdown: PlatformBreakdown;
  category_breakdown: CategoryBreakdown;
  summary: {
    total_prompts: number;
    total_responses: number;
    platforms_tracked: number;
  };
}

export interface CompetitiveRanking {
  competitor_id: string;
  competitor_name: string;
  average_position: number | null;
  share_of_voice: number;
  platforms: Record<
    string,
    {
      brand_position: number | null;
      competitor_position: number | null;
      brand_ahead: boolean | null;
    }
  >;
}

export interface AeoResponse {
  id: string;
  ai_platform: string;
  brand_mentioned: boolean;
  mention_position: number | null;
  mention_context: string | null;
  competitors_mentioned: string[];
  location: string;
  response_date: string;
  response_preview: string;
}

export interface CompetitiveRankingsResponse {
  rankings: CompetitiveRanking[];
  summary: {
    brand_average_position: number;
    total_competitors: number;
    total_rankings: number;
  };
}

export interface PromptsListResponse {
  prompts: AeoPrompt[];
  total: number;
}

export interface CreatePromptRequest {
  prompt: {
    prompt_text: string;
    category?: string;
    priority?: number;
    active?: boolean;
  };
}

export interface UpdatePromptRequest {
  prompt: {
    prompt_text?: string;
    category?: string;
    priority?: number;
    active?: boolean;
  };
}
