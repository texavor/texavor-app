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
  AeoJobStatus,
} from "../types/aeo.types";

export interface ActiveJobResponse {
  active: boolean;
  job?: AeoJobStatus;
}

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

  // Core polling logic
  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const statusRes = await axiosInstance.get(
          `/api/v1/blogs/${blogId}/aeo/jobs/${jobId}`,
        );
        const job = statusRes.data;

        if (job) {
          setProgress(job.progress || 0);

          if (job.status === "completed") {
            onUpdate();
            setIsPolling(false);
            setProgress(100);
            return;
          }

          if (job.status === "failed") {
            setIsPolling(false);
            console.error(`Analysis failed: ${job.error}`);
            // Optional: alert user or handle error state
            return;
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }

      // Continue polling
      pollTimeout.current = setTimeout(() => pollJobStatus(jobId), 3000);
    },
    [blogId, onUpdate],
  );

  // Start new analysis
  const startPolling = useCallback(async () => {
    if (!blogId) return;

    setIsPolling(true);
    setProgress(0);

    try {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/aeo/refresh`,
      );

      const { job_id } = response.data;
      if (!job_id) throw new Error("No job ID received");

      pollJobStatus(job_id);
    } catch (err) {
      console.error("Failed to trigger refresh:", err);
      setIsPolling(false);
      alert("Failed to start data collection");
    }
  }, [blogId, pollJobStatus]);

  // Check for existing active job on mount
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // If we've already checked for this blogId, don't check again
    if (!blogId || hasCheckedRef.current) return;

    const checkActiveJob = async () => {
      try {
        hasCheckedRef.current = true; // Mark as checked immediately
        const response = await axiosInstance.get<ActiveJobResponse>(
          `/api/v1/blogs/${blogId}/aeo/jobs/active`,
        );

        if (response.data.active && response.data.job) {
          console.log("Resuming active job:", response.data.job.job_id);
          setIsPolling(true);
          setProgress(response.data.job.progress || 0);
          pollJobStatus(response.data.job.job_id);
        }
      } catch (err) {
        console.error("Failed to check active jobs:", err);
      }
    };

    checkActiveJob();

    return () => {
      // Don't reset hasCheckedRef on unmount to prevent double-check on strict mode remounts
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, [blogId, pollJobStatus]);

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
