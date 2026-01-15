import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";

// Types
// Types
export interface KeywordDetails {
  term: string;
  source: string;
  ai_visibility_score?: number;
}

export interface KeywordDiscoveryKeyword {
  keyword: string | KeywordDetails;
  search_volume: number;
  difficulty: number;
  opportunity_score: number;
  source: string;
  relevance_score: number;
  competitor_using: boolean;
  cpc: number;
  competitor_name?: string;
  seed_keyword?: string;
  ai_visibility_score?: number;
  ai_authority_score?: number;
}

export interface KeywordDiscoveryData {
  id: string;
  status: "processing" | "completed" | "failed";
  trigger_type: string;
  total_keywords: number;
  high_opportunity_count: number;
  keywords: KeywordDiscoveryKeyword[];
  metadata: {
    sources: Record<string, number>;
    avg_opportunity_score: number;
    avg_search_volume: number;
  };
  completed_at?: string;
  created_at: string;
}

export interface DiscoveryUsage {
  limit: number;
  used: number;
  remaining: number;
  tier: string;
}

export interface DiscoveryFilters {
  source?: string;
  min_opportunity?: number;
  max_opportunity?: number;
  min_volume?: number;
  max_volume?: number;
  min_difficulty?: number;
  max_difficulty?: number;
  competitor_only?: boolean;
  sort_by?: string;
  sort_order?: string;
}

export interface DiscoveryProgress {
  current_stage: string;
  stage_number: number;
  total_stages: number;
  percentage: number;
  estimated_seconds_remaining?: number;
}

export interface DiscoveryStatus {
  id: string;
  status: "processing" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  failed_at?: string;
  progress?: DiscoveryProgress;
  estimated_completion_at?: string;
  total_keywords?: number;
  high_opportunity_count?: number;
  error?: string;
}

// Trigger new discovery
export const useTriggerDiscovery = () => {
  return useMutation({
    mutationFn: async (blogId: string) => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/keyword_discoveries`
      );
      return res.data;
    },
  });
};

// Get discovery status (for progress polling)
export const useDiscoveryStatus = (
  blogId: string | undefined,
  discoveryId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery<DiscoveryStatus>({
    queryKey: ["keywordDiscovery", "status", blogId, discoveryId],
    queryFn: async () => {
      if (!blogId || !discoveryId)
        throw new Error("Blog ID and Discovery ID are required");
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/keyword_discoveries/${discoveryId}/status`
      );
      return res.data;
    },
    enabled: !!blogId && !!discoveryId && enabled,
    refetchInterval: (query) => {
      // Stop polling when completed or failed
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    retry: false,
  });
};

// Get latest discovery
export const useLatestDiscovery = (
  blogId: string | undefined,
  filters?: DiscoveryFilters,
  enabled: boolean = true
) => {
  return useQuery<KeywordDiscoveryData>({
    queryKey: ["keywordDiscovery", "latest", blogId, filters],
    queryFn: async () => {
      if (!blogId) throw new Error("Blog ID is required");

      // Build query params
      const params = new URLSearchParams();
      if (filters?.source && filters.source !== "all") {
        params.append("source", filters.source);
      }
      if (filters?.min_opportunity !== undefined) {
        params.append("min_opportunity", filters.min_opportunity.toString());
      }
      if (filters?.max_opportunity !== undefined) {
        params.append("max_opportunity", filters.max_opportunity.toString());
      }
      if (filters?.min_volume !== undefined) {
        params.append("min_volume", filters.min_volume.toString());
      }
      if (filters?.max_volume !== undefined) {
        params.append("max_volume", filters.max_volume.toString());
      }
      if (filters?.min_difficulty !== undefined) {
        params.append("min_difficulty", filters.min_difficulty.toString());
      }
      if (filters?.max_difficulty !== undefined) {
        params.append("max_difficulty", filters.max_difficulty.toString());
      }
      if (filters?.competitor_only !== undefined) {
        params.append("competitor_only", filters.competitor_only.toString());
      }
      if (filters?.sort_by) {
        params.append("sort_by", filters.sort_by);
      }
      if (filters?.sort_order) {
        params.append("sort_order", filters.sort_order);
      }

      const queryString = params.toString();
      const url = `/api/v1/blogs/${blogId}/keyword_discoveries/latest${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await axiosInstance.get(url);
      return res.data;
    },
    enabled: !!blogId && enabled,
    refetchInterval: (query) => {
      // Poll every 10s if processing
      const data = query.state.data;
      return data?.status === "processing" ? 10000 : false;
    },
    retry: false,
  });
};

// Get usage/limits
export const useDiscoveryUsage = (blogId: string | undefined) => {
  return useQuery<DiscoveryUsage>({
    queryKey: ["keywordDiscovery", "usage", blogId],
    queryFn: async () => {
      if (!blogId) throw new Error("Blog ID is required");
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/keyword_discoveries/usage`
      );
      return res.data;
    },
    enabled: !!blogId,
  });
};
