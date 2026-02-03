import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { formatCategoryName, getCategoryColor } from "../utils/aeoHelpers";
import type { AeoPrompt } from "../types/aeo.types";
import { CreatePromptDialog } from "./CreatePromptDialog";
import MetricCard from "../MetriCard";
import { cn } from "@/lib/utils";

interface PromptsListCardProps {
  prompts: AeoPrompt[] | undefined;
  isLoading: boolean;
  blogId?: string;
}

export const PromptsListCard: React.FC<PromptsListCardProps> = ({
  prompts,
  isLoading,
  blogId,
}) => {
  const getInterpretation = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-44 bg-slate-100/50 dark:bg-zinc-800/50 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Sort prompts by visibility score descending
  const sortedPrompts = prompts
    ? [...prompts].sort((a, b) => b.visibility_score - a.visibility_score)
    : [];

  const topTwoPrompts = sortedPrompts.slice(0, 2);
  const otherPrompts = sortedPrompts.slice(2);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white font-poppins tracking-tight">
            <span>Active Prompts</span>
            {sortedPrompts.length > 0 && (
              <span className="flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground rounded-lg border border-primary/10">
                {sortedPrompts.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Track and manage your AI visibility queries
          </p>
        </div>
        <CreatePromptDialog blogId={blogId} />
      </div>

      {sortedPrompts.length === 0 ? (
        <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
          <CardContent className="h-64 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-200 dark:text-zinc-800" />
            <p className="font-medium text-lg mb-1">No active prompts found</p>
            <p className="text-sm opacity-80">
              Add your first prompt to start tracking AI visibility
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Top 2 Primary Grid */}
          {topTwoPrompts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topTwoPrompts.map((prompt) => (
                <MetricCard
                  key={prompt.id}
                  type="primary"
                  label={prompt.prompt_text}
                  value={prompt.visibility_score.toFixed(1)}
                  gaugeValue={prompt.visibility_score}
                  interpretation={getInterpretation(prompt.visibility_score)}
                  icon={<MessageSquare className="w-5 h-5 text-white" />}
                  subtext={
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          Daily Flow:
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {prompt.response_count_today} responses
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-2 border-none font-bold uppercase tracking-widest bg-white/15 text-white"
                        >
                          {formatCategoryName(prompt.category)}
                        </Badge>
                        {prompt.brand_mentioned_today && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-2 border-none font-bold uppercase tracking-widest bg-white/20 text-white"
                          >
                            ✓ Mentioned
                          </Badge>
                        )}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}

          {/* Others - Secondary Grid */}
          {otherPrompts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPrompts.map((prompt) => (
                <MetricCard
                  key={prompt.id}
                  type="secondary"
                  label={prompt.prompt_text}
                  value={prompt.visibility_score.toFixed(1)}
                  gaugeValue={prompt.visibility_score}
                  interpretation={getInterpretation(prompt.visibility_score)}
                  icon={<MessageSquare className="w-5 h-5 text-primary" />}
                  subtext={
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Daily Flow:
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {prompt.response_count_today} responses
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-2 border-none font-bold uppercase tracking-widest"
                          style={{
                            backgroundColor: `${getCategoryColor(prompt.category)}15`,
                            color: getCategoryColor(prompt.category),
                          }}
                        >
                          {formatCategoryName(prompt.category)}
                        </Badge>
                        {prompt.brand_mentioned_today && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-2 border-none font-bold uppercase tracking-widest bg-green-50 text-green-700"
                          >
                            ✓ Mentioned
                          </Badge>
                        )}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
