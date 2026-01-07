"use client";

import { useState } from "react";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FreshnessScoreBadgeProps {
  article: {
    id: string;
    blog_id: string;
    freshness_score?: number | null;
    decay_risk?: number | null;
    needs_freshness_update?: boolean | null;
  };
}

export function FreshnessScoreBadge({
  article: initialArticle,
}: FreshnessScoreBadgeProps) {
  const [article, setArticle] = useState(initialArticle);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setAnalyzing(true);
    try {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${article.blog_id}/articles/${article.id}/check_freshness`
      );

      const data = res.data;
      setArticle((prev) => ({
        ...prev,
        freshness_score: data.freshness_score,
        decay_risk: data.decay_risk,
        needs_freshness_update: data.needs_update, // Map API response to local interface if needed
      }));
      toast.success("Freshness analysis complete!");
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Failed to analyze freshness");
    } finally {
      setAnalyzing(false);
    }
  };

  const { freshness_score, needs_freshness_update, decay_risk } = article;

  // Case 1: Never Analyzed
  if (freshness_score === null || freshness_score === undefined) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-dashed"
        onClick={handleAnalyze}
        disabled={analyzing}
      >
        {analyzing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        Analyze
      </Button>
    );
  }

  // Case 2: Stale Content (needs update or low score)
  if (needs_freshness_update || freshness_score < 50) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 pr-2.5 h-7",
                "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {freshness_score.toFixed(0)}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Risk Level: {decay_risk ?? "High"} - Content needs refresh</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Case 3: Fresh Content
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="secondary"
            className={cn(
              "gap-1.5 pr-2.5 h-7",
              "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {freshness_score.toFixed(0)}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fresh Content - LLM Optimized</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
