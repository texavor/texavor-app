import { axiosInstance } from "@/lib/axiosInstace";

export interface Competitor {
  id: string;
  name: string;
  website_url: string;
  domain: string;
  rss_feed_url?: string;
  description?: string;
  active: boolean;
  last_analyzed_at?: string; // ISO 8601
  articles_tracked: number;
  needs_analysis: boolean;
  analysis_status?: "pending" | "analyzing" | "completed" | "failed";
  latest_analysis?: LatestAnalysis;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface LatestAnalysis {
  content: ContentAnalysis;
  seo: SeoAnalysis;
  topics: TopicsAnalysis;
  keywords: KeywordsAnalysis;
}

export interface Analysis {
  id: string;
  competitor_id: string;
  created_at: string; // ISO 8601
  analysis_status: "pending" | "analyzing" | "completed" | "failed";
  error_message?: string; // Only present when status is "failed"
  content_analysis: ContentAnalysis;
  seo_analysis: SeoAnalysis;
  topics_identified: TopicsAnalysis;
  keywords_found: KeywordsAnalysis;
  new_articles_found: number;
  content_quality_score?: number;
  seo_score?: number;
  overall_score?: number;
  recommendations?: Recommendation[];
}

export interface Recommendation {
  type: string;
  action: string;
  message: string;
  priority: "high" | "medium" | "low";
  details?: string[] | ContentGapDetail[] | KeywordOpportunityDetail[];
}

export interface ContentGapDetail {
  topic: string;
  example_article: string;
  suggested_titles?: string[];
}

export interface KeywordOpportunityDetail {
  keyword: string;
  suggested_titles?: string[];
}

export interface ContentAnalysis {
  status: "success" | "error" | "no_rss" | "rss_error";
  source?: "rss";
  new_articles_count: number;
  recent_articles?: Article[];
  publishing_frequency?: PublishingFrequency;
  content_types?: Record<string, number>;
  average_length?: ContentLength;
  message?: string;
}

export interface Article {
  title: string;
  url: string;
  published_at: string;
  summary: string;
  categories: string[];
}

export interface PublishingFrequency {
  articles_per_month: number;
  frequency_rating: "low" | "moderate" | "high" | "very_high";
  total_articles_analyzed: number;
  date_range: {
    from: string;
    to: string;
  };
}

export interface ContentLength {
  average_summary_length: number;
  estimated_word_count: number;
  length_category: string;
}

export interface SeoAnalysis {
  domain: string;
  domain_authority?: number;
  backlinks?: number;
  organic_keywords?: number;
  traffic_estimate?: number;
  analyzed_at: string;
  note?: string;
  error?: string;
}

export interface TopicsAnalysis {
  topics: Array<{
    name: string;
    count: number;
  }>;
  total_unique_topics: number;
}

export interface KeywordsAnalysis {
  keywords: Array<{
    word: string;
    frequency: number;
  }>;
  total_keywords: number;
}

export interface CompetitorCreateData {
  name: string;
  website_url: string;
  rss_feed_url?: string;
  description?: string;
}

export interface CompetitorUpdateData {
  name?: string;
  website_url?: string;
  rss_feed_url?: string;
  description?: string;
  active?: boolean;
}

export const competitorApi = {
  // List all competitors
  async list(blogId: string) {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/competitors`
    );
    return response.data;
  },

  // Add competitor
  async create(blogId: string, data: CompetitorCreateData) {
    const response = await axiosInstance.post(
      `/api/v1/blogs/${blogId}/competitors`,
      { competitor: data }
    );
    return response.data;
  },

  // Update competitor
  async update(
    blogId: string,
    competitorId: string,
    data: CompetitorUpdateData
  ) {
    const response = await axiosInstance.patch(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}`,
      { competitor: data }
    );
    return response.data;
  },

  // Delete competitor
  async delete(blogId: string, competitorId: string) {
    const response = await axiosInstance.delete(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}`
    );
    return response.data;
  },

  // Trigger analysis
  async analyze(blogId: string, competitorId: string) {
    const response = await axiosInstance.post(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}/analyze`
    );
    return response.data;
  },

  // Get analysis history
  async getAnalyses(blogId: string, competitorId: string) {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}/analyses`
    );
    return response.data;
  },

  // Get analysis details
  async getAnalysisDetails(
    blogId: string,
    competitorId: string,
    analysisId: string
  ) {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}/analyses/${analysisId}`
    );
    return response.data;
  },

  // Check analysis limits
  async getLimits(blogId: string, competitorId: string) {
    const response = await axiosInstance.get<AnalysisLimit>(
      `/api/v1/blogs/${blogId}/competitors/${competitorId}/analysis_limits`
    );
    return response.data;
  },
};

export interface AnalysisLimit {
  limit: number;
  remaining: number;
  reset_at: string;
  can_analyze: boolean;
}
