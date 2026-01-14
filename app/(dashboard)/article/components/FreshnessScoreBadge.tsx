"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFreshnessAnalysis } from "@/hooks/useFreshnessAnalysis";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    setArticle(initialArticle);
  }, [initialArticle]);

  const { checkFreshness, isAnalyzing } = useFreshnessAnalysis(
    article.blog_id,
    article.id,
    (updatedArticle) => {
      setArticle((prev) => ({
        ...prev,
        freshness_score: updatedArticle.freshness_score,
        decay_risk: updatedArticle.decay_risk,
        needs_freshness_update: updatedArticle.needs_freshness_update,
      }));
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    }
  );

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkFreshness();
  };

  const { freshness_score, needs_freshness_update, decay_risk } = article;

  // 1. Not Analyzed
  if (freshness_score === null || freshness_score === undefined) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-dashed"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        Analyze
      </Button>
    );
  }

  // 2. Decaying (< 50%)
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

  // 3. Neutral (50% - 79%)
  if (freshness_score < 80) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 pr-2.5 h-7",
                "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
              )}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              {freshness_score.toFixed(0)}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Score is average. Consider improving.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 4. Fresh (80% +)
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
