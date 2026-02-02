import React from "react";
import MetricCard from "../MetriCard";
import { getScoreGradient } from "../utils/aeoHelpers";
import type { AeoVisibilityScore } from "../types/aeo.types";

interface VisibilityScoreCardProps {
  score: AeoVisibilityScore | null;
}

export const VisibilityScoreCard: React.FC<VisibilityScoreCardProps> = ({
  score,
}) => {
  if (!score) {
    return (
      <MetricCard
        type="primary"
        label="AI Visibility Score"
        value="--"
        interpretation="No data"
        scoreColor="gray"
        subtext="No AEO data available yet"
      />
    );
  }

  return (
    <MetricCard
      type="primary"
      label="AI Visibility Score"
      value={score.overall_score.toFixed(1)}
      interpretation={score.interpretation}
      scoreColor={score.color}
      customGradient={getScoreGradient(score.color)}
      trend={score.trend}
      subtext={
        <div className="flex flex-col gap-1">
          <span>Presence Rate: {score.presence_rate.toFixed(1)}%</span>
          <span>
            Cross-Model Consistency: {score.cross_model_consistency.toFixed(1)}%
          </span>
        </div>
      }
    />
  );
};
