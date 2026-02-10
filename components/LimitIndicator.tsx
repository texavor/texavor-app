"use client";

import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LimitIndicatorProps {
  feature: string;
  label: string;
  currentUsage: number;
  className?: string;
}

export function LimitIndicator({
  feature,
  label,
  currentUsage,
  className = "",
}: LimitIndicatorProps) {
  const { getLimit, isLocked } = useFeatureAccess();
  const limit = getLimit(feature);

  if (limit === -1) return null; // Unlimited

  if (isLocked(feature)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}
            >
              <Lock className="w-3 h-3" />
              <span>{label}: Locked</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is not available on your current plan.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const percentage = Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentUsage >= limit;

  return (
    <div className={`flex flex-col gap-1 w-full max-w-[200px] ${className}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-600">{label}</span>
        <span
          className={`${isAtLimit ? "text-red-500 font-bold" : "text-gray-500"}`}
        >
          {currentUsage} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-1.5 ${isAtLimit ? "bg-red-100" : "bg-gray-100"}`}
        // We need to style the indicator specifically based on status
        // indicatorClassName={isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-[#104127]"}
      />
    </div>
  );
}
