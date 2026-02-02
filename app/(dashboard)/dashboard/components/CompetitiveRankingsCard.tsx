import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { CompetitiveRanking } from "../types/aeo.types";

interface CompetitiveRankingsCardProps {
  rankings: CompetitiveRanking[];
}

export const CompetitiveRankingsCard: React.FC<
  CompetitiveRankingsCardProps
> = ({ rankings }) => {
  if (!rankings || rankings.length === 0) {
    return (
      <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Competitive Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No competitive data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Competitive Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rankings.slice(0, 5).map((ranking) => (
          <div
            key={ranking.competitor_id}
            className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-border/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {ranking.competitor_name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {ranking.share_of_voice.toFixed(1)}% SOV
              </Badge>
            </div>

            {ranking?.average_position && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span>Avg Position:</span>
                <span className="font-semibold">
                  #{ranking.average_position.toFixed(1)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ranking.platforms)
                .slice(0, 4)
                .map(([platform, data]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="capitalize text-slate-600 dark:text-slate-400">
                      {platform}:
                    </span>
                    <div className="flex items-center gap-1">
                      {data.brand_ahead !== null && (
                        <>
                          {data.brand_ahead ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                        </>
                      )}
                      <span className="font-medium">
                        {data.brand_position || "N/A"} vs{" "}
                        {data.competitor_position || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
