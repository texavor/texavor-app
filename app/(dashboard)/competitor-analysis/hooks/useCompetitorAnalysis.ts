import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { competitorApi } from "@/lib/api/competitors";
import { useState, useEffect } from "react";

interface UseCompetitorAnalysisOptions {
  blogId: string;
  competitorId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCompetitorAnalysis = ({
  blogId,
  competitorId,
  onSuccess,
  onError,
}: UseCompetitorAnalysisOptions) => {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(false);

  // Query for polling analysis status
  const statusQuery = useQuery({
    queryKey: ["competitor-analysis-status", blogId, competitorId],
    queryFn: () => competitorApi.getAnalysisStatus(blogId, competitorId),
    enabled: isPolling,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if completed or failed
      if (
        data?.analysis_status === "completed" ||
        data?.analysis_status === "failed" ||
        (data?.analysis_status as any) === "success"
      ) {
        setIsPolling(false);
        return false;
      }
      // Poll every 3 seconds while analyzing
      return 3000;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Stop polling when status becomes completed/failed
  useEffect(() => {
    if (statusQuery.data) {
      const status = statusQuery.data.analysis_status;
      if (
        status === "completed" ||
        status === "failed" ||
        (status as any) === "success"
      ) {
        setIsPolling(false);
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: ["competitors", blogId],
        });
        queryClient.invalidateQueries({
          queryKey: ["competitor-analyses", blogId, competitorId],
        });
        if (status === "completed" || (status as any) === "success") {
          onSuccess?.();
        }
      }
    }
  }, [statusQuery.data, blogId, competitorId, queryClient, onSuccess]);

  // Mutation for starting analysis
  const startAnalysisMutation = useMutation({
    mutationFn: () => competitorApi.analyze(blogId, competitorId),
    onSuccess: () => {
      // Start polling after successful trigger
      setIsPolling(true);
    },
    onError: (error: any) => {
      console.error("Failed to start analysis:", error);
      setIsPolling(false);
      onError?.(error);
    },
  });

  return {
    // Start analysis
    startAnalysis: startAnalysisMutation.mutate,
    isStarting: startAnalysisMutation.isPending,
    startError: startAnalysisMutation.error,

    // Status polling
    status: statusQuery.data,
    isPolling,
    statusError: statusQuery.error,

    // Helper flags
    isAnalyzing:
      statusQuery.data?.is_analyzing ||
      statusQuery.data?.analysis_status === "analyzing" ||
      statusQuery.data?.analysis_status === "pending" ||
      false,
    isCompleted:
      statusQuery.data?.analysis_status === "completed" ||
      (statusQuery.data?.analysis_status as any) === "success",
    isFailed: statusQuery.data?.analysis_status === "failed",

    // Manual control
    stopPolling: () => setIsPolling(false),
    refetchStatus: statusQuery.refetch,
  };
};
