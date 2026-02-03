import React from "react";
import MetricCard from "../MetriCard";
import type { AeoVisibilityScore } from "../types/aeo.types";

interface VisibilityScoreCardProps {
  score: AeoVisibilityScore | null;
  className?: string;
}

export const VisibilityScoreCard = ({
  score,
  className,
}: VisibilityScoreCardProps) => {
  return (
    <MetricCard
      type="primary"
      label="AI Visibility Score"
      value={score?.overall_score?.toFixed(1) || "0.0"}
      interpretation={score?.interpretation as any}
      trend={score?.trend}
      subtext={null}
      className={className}
      gaugeValue={score?.overall_score || 0}
    />
  );
};
