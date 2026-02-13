"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import {
  competitorApi,
  Competitor,
  Analysis,
  AnalysisLimit,
} from "@/lib/api/competitors";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  BarChart,
  CheckCircle2,
  FileText,
  Globe,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { toast } from "sonner";
import CompetitorAnalysisDetail from "../components/CompetitorAnalysisDetail";
import AnalysisStatusBadge from "../components/AnalysisStatusBadge";
import AnalysisErrorAlert from "../components/AnalysisErrorAlert";
import CustomDropdown from "@/components/ui/CustomDropdown";

import { CompetitorDetailSkeleton } from "../components/CompetitorDetailSkeleton";
import { DEMO_ANALYSIS, DEMO_COMPETITORS } from "@/lib/demo-data";

export default function CompetitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { blogs } = useAppStore();
  const competitorId = params.id as string;

  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPollingNewAnalysis, setIsPollingNewAnalysis] = useState(false);
  const [limits, setLimits] = useState<AnalysisLimit | null>(null);

  useEffect(() => {
    if (blogs?.id && competitorId) {
      loadData();
    }
  }, [blogs?.id, competitorId]);

  const loadData = async (silent = false) => {
    if (typeof competitorId === "string" && competitorId.startsWith("demo-")) {
      const demoCompetitor = DEMO_COMPETITORS.find(
        (c) => c.id === competitorId,
      );
      if (demoCompetitor) {
        setCompetitor(demoCompetitor as any);
        setAnalyses([DEMO_ANALYSIS] as any);
        if (!selectedAnalysisId) {
          setSelectedAnalysisId(DEMO_ANALYSIS.id);
        }
        setFullAnalysis(DEMO_ANALYSIS as any);
        setLoading(false);
        return { competitor: demoCompetitor, analyses: [DEMO_ANALYSIS] };
      }
    }

    try {
      if (!silent) setLoading(true);
      const data = await competitorApi.getAnalyses(blogs.id, competitorId);
      setCompetitor(data.competitor);
      setAnalyses(data.analyses);

      const limitsData = await competitorApi.getLimits(blogs.id, competitorId);
      setLimits(limitsData);

      if (data.analyses.length > 0 && !selectedAnalysisId) {
        setSelectedAnalysisId(data.analyses[0].id);
      }

      return data; // Return data for use in polling
    } catch (error) {
      console.error("Failed to load competitor data:", error);
      router.push("/competitor-analysis");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!competitor) return;
    if (typeof competitorId === "string" && competitorId.startsWith("demo-")) {
      toast.error("This is a demo. Upgrade to analyze real competitors.");
      router.push("/pricing");
      return;
    }
    try {
      setAnalyzing(true);
      const data = await competitorApi.analyze(blogs.id, competitor.id);
      toast.success("Analysis started successfully!");

      // Start polling for analysis status
      pollForNewAnalysis();

      // Refresh limits
      const limitsData = await competitorApi.getLimits(blogs.id, competitor.id);
      setLimits(limitsData);
    } catch (error: any) {
      console.error("Failed to start analysis:", error);
      if (error.response?.status === 429) {
        toast.error(
          error.response.data.message || "Weekly analysis limit reached.",
        );
        if (error.response.data.limit !== undefined) {
          setLimits({
            limit: error.response.data.limit,
            remaining: error.response.data.remaining,
            reset_at: error.response.data.reset_at,
            can_analyze: false,
          });
        }
      } else {
        toast.error("Failed to start analysis. Please try again.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Poll for new analysis creation
  const pollForNewAnalysis = async () => {
    if (!competitor) return;

    setIsPollingNewAnalysis(true);

    let attempts = 0;
    const maxAttempts = 60; // 3 minutes max (60 * 3 seconds)
    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        attempts++;

        // Use analysis_status endpoint to check if analysis is complete
        const statusData = await competitorApi.getAnalysisStatus(
          blogs.id,
          competitor.id,
        );

        const status = statusData.analysis_status;

        // Check if analysis is complete
        if (
          status === "completed" ||
          (status as any) === "success" ||
          status === "failed"
        ) {
          // Analysis is done, reload all data and auto-select latest
          setIsPollingNewAnalysis(false);
          setLoadingAnalysis(true);

          const reloadedData = await loadData(true);

          // Auto-select the latest analysis (first in the list)
          if (reloadedData?.analyses && reloadedData.analyses.length > 0) {
            const latestAnalysis = reloadedData.analyses[0];
            setSelectedAnalysisId(latestAnalysis.id);
          }

          if (status === "completed" || (status as any) === "success") {
            toast.success("Analysis completed successfully!");
          } else if (status === "failed") {
            toast.error("Analysis failed. Please try again.");
          }

          return; // Stop polling
        }

        // If still analyzing, continue polling
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(checkStatus, 3000);
        } else {
          setIsPollingNewAnalysis(false);
          toast.error(
            "Analysis is taking longer than expected. Please refresh the page.",
          );
        }
      } catch (error) {
        console.error("Failed to poll for new analysis:", error);
        // Retry on error
        if (attempts < maxAttempts) {
          timeoutId = setTimeout(checkStatus, 3000);
        } else {
          setIsPollingNewAnalysis(false);
        }
      }
    };

    // Start checking after a short delay
    timeoutId = setTimeout(checkStatus, 2000);
  };

  const [fullAnalysis, setFullAnalysis] = useState<Analysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Polling logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isPolling = true;

    const poll = async () => {
      if (typeof competitorId === "string" && competitorId.startsWith("demo-"))
        return;
      if (!selectedAnalysisId || !blogs?.id || !competitorId) return;

      try {
        // Don't set loading state during polling to avoid UI flicker
        const data = await competitorApi.getAnalysisDetails(
          blogs.id,
          competitorId,
          selectedAnalysisId,
        );

        if (!isPolling) return;

        setFullAnalysis(data.analysis);

        const status = getAnalysisStatus(data.analysis);
        const currentAnalysisInList =
          analyses.find((a) => a.id === selectedAnalysisId) || null;
        const currentStatus = getAnalysisStatus(currentAnalysisInList);

        if (status === "pending" || status === "analyzing") {
          // Schedule next poll
          timeoutId = setTimeout(poll, 2000);
        } else if (status === "completed" || status === "failed") {
          // Analysis finished, update the local state to reflect the change
          // This avoids an extra API call to getAnalyses
          setAnalyses((prev) =>
            prev.map((a) => (a.id === data.analysis.id ? data.analysis : a)),
          );
          setLoadingAnalysis(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Retry on error? Or stop? Let's retry a few times or just continue.
        // For now, continue polling after a delay if it's a transient error
        timeoutId = setTimeout(poll, 5000);
      }
    };

    // Initial fetch
    if (selectedAnalysisId) {
      setLoadingAnalysis(true);
      poll().finally(() => {
        // Only turn off loading if we are not polling anymore (completed)
        // OR if we want to show the "Analyzing" state in the UI while polling.
        // If we keep loadingAnalysis=true, the Skeleton shows.
        // We probably want to show the Skeleton only for the FIRST fetch.
        // Subsequent polls should show the "Analyzing" UI (if any) or just the stale data?
        // Actually, if status is "analyzing", we probably want to show the partial data or a specific UI.
        // But if we use Skeleton, the user can't see "Analyzing" badge.
        // So let's turn off loadingAnalysis after the first successful fetch.
        if (isPolling) setLoadingAnalysis(false);
      });
    }

    return () => {
      isPolling = false;
      clearTimeout(timeoutId);
    };
  }, [selectedAnalysisId, blogs?.id, competitorId]);

  // Removed separate fetchAnalysisDetails and previous useEffects to avoid conflicts

  // Helper function to determine status from analysis
  const getAnalysisStatus = (
    analysis: Analysis | null,
  ): "pending" | "analyzing" | "completed" | "failed" | null => {
    if (!analysis) return null;

    if (analysis.analysis_status) {
      if ((analysis.analysis_status as any) === "success") {
        return "completed";
      }
      return analysis.analysis_status;
    }

    if (analysis.content_analysis?.status === "error") {
      return "failed";
    }

    if (analysis.content_analysis || analysis.seo_analysis) {
      return "completed";
    }

    return "pending";
  };

  // Helper function to get error message
  const getErrorMessage = (analysis: Analysis | null): string | null => {
    if (!analysis) return null;

    if (analysis.error_message) {
      return analysis.error_message;
    }

    if (
      analysis.content_analysis?.status === "error" &&
      analysis.content_analysis?.message
    ) {
      return analysis.content_analysis.message;
    }

    return null;
  };

  if (loading || !competitor) {
    return <CompetitorDetailSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl p-2 border-none shadow-none">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          {/* Favicon Image */}
          <div className="shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-50 border-none p-4 flex items-center justify-center overflow-hidden">
              <img
                src={`https://www.google.com/s2/favicons?domain=${competitor.website_url}&sz=128`}
                alt={`${competitor.name} icon`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {competitor.name}
                </h1>
                <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50" />
                {(isPollingNewAnalysis || getAnalysisStatus(fullAnalysis)) && (
                  <div className="ml-2">
                    <AnalysisStatusBadge
                      status={
                        isPollingNewAnalysis
                          ? "analyzing"
                          : getAnalysisStatus(fullAnalysis)!
                      }
                    />
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-base max-w-xl line-clamp-2">
                {competitor.description || "No description available."}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 md:gap-8 pt-2">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {analyses.length}
                </span>
                <span className="text-sm text-gray-500">Analyses</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-5 h-5 text-gray-400" />
                <a
                  href={competitor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <div className="flex flex-col items-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Button
                        onClick={handleAnalyze}
                        disabled={
                          analyzing || (limits ? !limits.can_analyze : false)
                        }
                        size="lg"
                        className="rounded-full px-8 border-none shadow-none transition-all"
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${
                            analyzing ? "animate-spin" : ""
                          }`}
                        />
                        Run Analysis
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {limits && (
                    <TooltipContent>
                      <p>
                        Weekly Limit: {limits.remaining}/{limits.limit}{" "}
                        remaining
                      </p>
                      {limits.remaining === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Resets on{" "}
                          {new Date(limits.reset_at).toLocaleDateString()} at{" "}
                          {new Date(limits.reset_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {limits && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground pr-2">
                  <Info className="w-3 h-3" />
                  <span>
                    {limits.remaining} of {limits.limit} analyses remaining this
                    week
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {getAnalysisStatus(fullAnalysis) === "failed" &&
        getErrorMessage(fullAnalysis) && (
          <AnalysisErrorAlert errorMessage={getErrorMessage(fullAnalysis)!} />
        )}

      {/* Analysis History Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-card">
        <span className="text-sm font-medium text-muted-foreground">
          Analysis History:
        </span>
        <CustomDropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          trigger={
            <Button
              variant="outline"
              className="w-full sm:w-[320px] justify-between"
            >
              {selectedAnalysisId
                ? analyses.find((a) => a.id === selectedAnalysisId)
                  ? `${new Date(
                      analyses.find((a) => a.id === selectedAnalysisId)!
                        .created_at,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} • Score: ${
                      analyses
                        .find((a) => a.id === selectedAnalysisId)!
                        .overall_score?.toFixed(1) || "N/A"
                    }`
                  : "Select analysis date"
                : "Select analysis date"}
            </Button>
          }
          options={analyses.map((analysis) => ({
            id: analysis.id,
            name: `${new Date(analysis.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })} • Score: ${analysis.overall_score?.toFixed(1) || "N/A"}`,
          }))}
          onSelect={(option: { id: string; name: string }) => {
            setSelectedAnalysisId(option.id);
            setDropdownOpen(false);
          }}
          value={selectedAnalysisId}
        />
      </div>

      {/* Analysis Content */}
      {loadingAnalysis ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : fullAnalysis ? (
        <CompetitorAnalysisDetail
          analysis={fullAnalysis}
          analysesHistory={analyses}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white border border-dashed border-gray-200">
          <div className="relative w-64 h-64 mb-4">
            <img
              src="/empty-state.png"
              alt="No Analysis Data"
              className="w-full h-full object-contain opacity-80"
            />
          </div>
          <h3 className="text-lg font-semibold text-[#0A2918]">
            No Analysis Data
          </h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Run a new analysis to get started with competitor insights.
          </p>
        </div>
      )}
    </div>
  );
}
