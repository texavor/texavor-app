import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import type {
  AeoMetricsOverview,
  PromptsListResponse,
  CreatePromptRequest,
  UpdatePromptRequest,
  CompetitiveRankingsResponse,
  AeoPrompt,
} from "../types/aeo.types";

// Fetch AEO Metrics Overview
export const useAeoMetrics = (blogId: string | undefined) => {
  return useQuery<AeoMetricsOverview>({
    queryKey: ["aeo-metrics", blogId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/blogs/${blogId}/aeo`);
      return response?.data;
    },
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch All Prompts
export const useAeoPrompts = (blogId: string | undefined) => {
  return useQuery<PromptsListResponse>({
    queryKey: ["aeo-prompts", blogId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/aeo/prompts`,
      );
      return response?.data;
    },
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create Prompt
export const useCreatePrompt = (blogId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePromptRequest) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/aeo/prompts`,
        data,
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeo-prompts", blogId] });
      queryClient.invalidateQueries({ queryKey: ["aeo-metrics", blogId] });
    },
  });
};

// Update Prompt
export const useUpdatePrompt = (blogId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      promptId,
      data,
    }: {
      promptId: string;
      data: UpdatePromptRequest;
    }) => {
      const response = await axiosInstance.put(
        `/api/v1/blogs/${blogId}/aeo/prompts/${promptId}`,
        data,
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeo-prompts", blogId] });
      queryClient.invalidateQueries({ queryKey: ["aeo-metrics", blogId] });
    },
  });
};

// Delete Prompt
export const useDeletePrompt = (blogId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const response = await axiosInstance.delete(
        `/api/v1/blogs/${blogId}/aeo/prompts/${promptId}`,
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeo-prompts", blogId] });
      queryClient.invalidateQueries({ queryKey: ["aeo-metrics", blogId] });
    },
  });
};

// Refresh AEO Data
export const useRefreshAeoData = (blogId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/aeo/refresh`,
      );
      return response?.data;
    },
    onSuccess: () => {
      // Invalidate after a delay to allow background job to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["aeo-metrics", blogId] });
        queryClient.invalidateQueries({ queryKey: ["aeo-prompts", blogId] });
      }, 120000); // 2 minutes
    },
  });
};

// Fetch Competitive Rankings
export const useCompetitiveRankings = (blogId: string | undefined) => {
  return useQuery<CompetitiveRankingsResponse>({
    queryKey: ["aeo-competitive", blogId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/aeo/competitive`,
      );
      return response?.data;
    },
    enabled: !!blogId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
