import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
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
      return response?.data as { status: string; job_id: string };
    },
    onSuccess: () => {
      // We don't invalidate immediately anymore, handled by polling component
    },
  });
};

// Polling Hook for AEO Data Refresh
export const useAeoPolling = (
  blogId: string | undefined,
  onUpdate: () => void,
) => {
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollTimeout = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(async () => {
    if (!blogId) return;

    setIsPolling(true);
    setProgress(0);

    try {
      // 1. Trigger the background job
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/aeo/refresh`,
      );

      const { job_id } = response.data;
      if (!job_id) {
        throw new Error("No job ID received");
      }

      // 2. Start polling loop for specific job ID
      const checkStatus = async () => {
        try {
          const statusRes = await axiosInstance.get(
            `/api/v1/blogs/${blogId}/aeo/jobs/${job_id}`,
          );
          const job = statusRes.data;

          if (job) {
            // Update progress bar
            setProgress(job.progress || 0);

            if (job.status === "completed") {
              // Job done! Refresh main data
              onUpdate();
              setIsPolling(false);
              setProgress(100);
              return;
            }

            if (job.status === "failed") {
              setIsPolling(false);
              console.error(`Analysis failed: ${job.error}`);
              alert(`Analysis failed: ${job.error || "Unknown error"}`);
              return;
            }
          }
        } catch (err) {
          console.error("Polling error", err);
          // Don't stop polling on transient errors, just wait
        }

        // Poll every 3 seconds
        pollTimeout.current = setTimeout(checkStatus, 3000);
      };

      // Start polling
      checkStatus();
    } catch (err) {
      console.error("Failed to trigger refresh:", err);
      setIsPolling(false);
      alert("Failed to start data collection");
    }
  }, [blogId, onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, []);

  return { isPolling, startPolling, progress };
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
