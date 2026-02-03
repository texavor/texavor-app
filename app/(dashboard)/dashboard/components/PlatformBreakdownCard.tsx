import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlatformIcon } from "../utils/aeoHelpers";
import type { PlatformBreakdown } from "../types/aeo.types";

interface PlatformBreakdownCardProps {
  platforms: PlatformBreakdown;
}

export const PlatformBreakdownCard: React.FC<PlatformBreakdownCardProps> = ({
  platforms,
}) => {
  const platformEntries = Object.entries(platforms).sort(
    ([, a], [, b]) => b.score - a.score,
  );

  if (platformEntries.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Platform Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No platform data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Platform Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {platformEntries.map(([platform, data]) => (
          <div key={platform} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getPlatformIcon(platform)}</span>
                <span className="text-sm font-medium capitalize">
                  {platform}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {data.mention_rate}
                </span>
                <span className="text-sm font-semibold text-[#104127] dark:text-green-400">
                  {data.score.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={data.score} className="h-2" />
            {data?.avg_position && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avg Position: #{data.avg_position.toFixed(1)}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
