import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCategoryName, getCategoryColor } from "../utils/aeoHelpers";
import type { AeoPrompt } from "../types/aeo.types";

interface PromptsListCardProps {
  prompts: AeoPrompt[];
}

export const PromptsListCard: React.FC<PromptsListCardProps> = ({
  prompts,
}) => {
  if (!prompts || prompts.length === 0) {
    return (
      <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Active Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active prompts found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 dark:bg-zinc-900 border-border/50 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Active Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prompts.slice(0, 5).map((prompt) => (
          <div
            key={prompt.id}
            className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-border/50 space-y-2"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
              {prompt.prompt_text}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: getCategoryColor(prompt.category),
                    color: getCategoryColor(prompt.category),
                  }}
                  className="text-xs"
                >
                  {formatCategoryName(prompt.category)}
                </Badge>
                {prompt.brand_mentioned_today && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    ✓ Mentioned Today
                  </Badge>
                )}
              </div>
              <span className="text-sm font-semibold text-[#104127] dark:text-green-400">
                {prompt.visibility_score.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {prompt.response_count_today} responses today
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
