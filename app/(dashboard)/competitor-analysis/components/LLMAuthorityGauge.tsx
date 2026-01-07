"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bot, HelpCircle } from "lucide-react";

interface LLMAuthorityGaugeProps {
  score?: number; // 0-100
}

export const LLMAuthorityGauge: React.FC<LLMAuthorityGaugeProps> = ({
  score,
}) => {
  // If score is undefined, treat as 0 or 'no data'
  const displayScore = score ?? 0;
  const hasData = score !== undefined && score !== null;

  // Determine status and color
  let status = "No Data";
  let colorClass = "text-gray-400";
  let bgClass = "bg-gray-100";
  let tooltipText = "Analysis pending or failed.";

  if (hasData) {
    if (displayScore >= 80) {
      status = "Dominant";
      colorClass = "text-green-600";
      bgClass = "bg-green-100";
      tooltipText = "Consistently cited by AI as a top 3 expert in this niche.";
    } else if (displayScore >= 60) {
      status = "Rising Star";
      colorClass = "text-yellow-600";
      bgClass = "bg-yellow-100";
      tooltipText = "Mentioned by AI, but not yet a primary source.";
    } else {
      status = "Unknown";
      colorClass = "text-gray-500";
      bgClass = "bg-gray-100";
      tooltipText =
        "The AI model does not recognize this brand as an authority.";
    }
  }

  // Calculate circumference for SVG circle
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex gap-4 items-center">
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          bgClass
        )}
      >
        <Bot className={cn("w-6 h-6", colorClass)} />
      </div>

      {/* Text Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[#7A7A7A] font-poppins">
            AI Authority
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-semibold text-[#0A2918] font-poppins">
            {hasData ? displayScore : "N/A"}
          </h3>
          {hasData && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                bgClass,
                colorClass
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
