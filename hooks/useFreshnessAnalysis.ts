import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axiosInstace";

export const useFreshnessAnalysis = (
  blogId: string | undefined,
  articleId: string | undefined,
  onUpdate?: (article: any) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const MAX_ATTEMPTS = 20; // Stop after 60 seconds (20 * 3s)

  const checkFreshness = async () => {
    if (!blogId || !articleId) return;

    setIsAnalyzing(true);
    let attempts = 0;

    try {
      // 1. Trigger Analysis
      await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/check_freshness`
      );

      // toast.info("Analyzing content freshness...");

      // 2. Start Polling
      pollInterval.current = setInterval(async () => {
        attempts++;

        try {
          const res = await axiosInstance.get(
            `/api/v1/blogs/${blogId}/articles/${articleId}`
          );
          const data = res.data;

          // Check if freshness_score is present, assuming it updates or we just wait for non-null if it was null?
          // The guide says: "When freshness_score updates (or last_updated changes), we stop polling."
          // For simplicity, if we get a valid score we assume it's done or we need a specific flag?
          // Guide says: "check if `needs_freshness_update` becomes false?" - Let's check that flag if available,
          // OR just existence of score if it was previously missing.
          // For now, let's look for a valid score.

          if (
            data.freshness_score !== null &&
            data.freshness_score !== undefined
          ) {
            // Success condition met
            if (pollInterval.current) clearInterval(pollInterval.current);
            setIsAnalyzing(false);
            if (onUpdate) onUpdate(data);
            // Clear interval reference
            pollInterval.current = null;
            // toast.success("Freshness analysis complete!");
          }

          if (attempts >= MAX_ATTEMPTS) {
            if (pollInterval.current) clearInterval(pollInterval.current);
            setIsAnalyzing(false);
            pollInterval.current = null;
            toast.warning(
              "Analysis is taking longer than expected. Please refresh manually."
            );
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); // Poll every 3 seconds
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      toast.error("Failed to start analysis");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  return { checkFreshness, isAnalyzing };
};
