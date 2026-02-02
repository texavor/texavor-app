import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCategoryName, getCategoryColor } from "../utils/aeoHelpers";
import type { CategoryBreakdown } from "../types/aeo.types";

interface CategoryPerformanceCardProps {
  categories: CategoryBreakdown;
}

export const CategoryPerformanceCard: React.FC<
  CategoryPerformanceCardProps
> = ({ categories }) => {
  const categoryEntries = Object.entries(categories).sort(
    ([, a], [, b]) => b.score - a.score,
  );

  if (categoryEntries.length === 0) {
    return (
      <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No category data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryEntries.map(([category, data]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-sm font-medium">
                  {formatCategoryName(category)}
                </span>
              </div>
              <span className="text-sm font-semibold text-[#104127] dark:text-green-400">
                {data.score.toFixed(1)}%
              </span>
            </div>
            <Progress value={data.score} className="h-2" />
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {data.mentions}/{data.total} mentions
              </span>
              <span>{data.prompts_count} prompts</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
