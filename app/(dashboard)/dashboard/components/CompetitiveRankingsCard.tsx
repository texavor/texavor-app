import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompetitiveRanking } from "../types/aeo.types";
import { Trophy, TrendingUp, Minus } from "lucide-react";

interface CompetitiveRankingsCardProps {
  rankings: CompetitiveRanking[];
}

export const CompetitiveRankingsCard: React.FC<
  CompetitiveRankingsCardProps
> = ({ rankings }) => {
  if (!rankings || rankings.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-none shadow-none h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Competitive Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active competitors
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-none h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Competitive Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {rankings.slice(0, 3).map((ranking, index) => (
          <div
            key={ranking.competitor_id}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-600"
                    : index === 1
                      ? "bg-slate-100 text-slate-600"
                      : "bg-orange-50 text-orange-600"
                }`}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {ranking.competitor_name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    Avg Pos: #{ranking.average_position?.toFixed(1) || "-"}
                  </span>
                  <span>•</span>
                  <span>{ranking.share_of_voice.toFixed(0)}% SOV</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {/* Simplified Status Metric */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                  {ranking.share_of_voice > 50 ? "Dominant" : "Challenger"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {rankings.length > 3 && (
          <div className="pt-2 text-center border-t border-slate-50">
            <button className="text-xs text-slate-500 hover:text-slate-900 font-medium">
              View All {rankings.length} Competitors
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
