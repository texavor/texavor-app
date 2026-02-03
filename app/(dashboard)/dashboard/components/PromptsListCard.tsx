import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { formatCategoryName, getCategoryColor } from "../utils/aeoHelpers";
import type { AeoPrompt } from "../types/aeo.types";
import { CreatePromptDialog } from "./CreatePromptDialog";
import { useUpdatePrompt, useDeletePrompt } from "../services/aeoService";

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
  const updateMutation = useUpdatePrompt(blogId);
  const deleteMutation = useDeletePrompt(blogId);

  const handleToggleActive = (prompt: AeoPrompt) => {
    updateMutation.mutate({
      promptId: prompt.id,
      data: {
        prompt: { active: !prompt.active },
      },
    });
  };

  const handleDelete = (promptId: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      deleteMutation.mutate(promptId);
    }
  };

  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-none h-full flex flex-col">
      <div className="p-6 pb-2 flex-none flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>Active Prompts</span>
          {prompts && (
            <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-zinc-400">
              {prompts.length}
            </span>
          )}
        </h3>
        <CreatePromptDialog blogId={blogId} />
      </div>

      <CardContent className="flex-1 overflow-auto max-h-[400px] pt-2 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-50 dark:bg-zinc-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <p className="mb-2">No active prompts found</p>
            <p className="text-xs">Add a prompt to start tracking visibility</p>
          </div>
        ) : (
          prompts.slice(0, 50).map((prompt) => (
            <div
              key={prompt.id}
              className={`p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border-none space-y-2 relative group transition-opacity ${
                !prompt.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 flex-1">
                  {prompt.prompt_text}
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(prompt)}
                    >
                      {prompt.active ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Mark Inactive
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Mark Active
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(prompt.id)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
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
                  {!prompt.active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold text-[#104127] dark:text-green-400 ml-auto">
                  {prompt.visibility_score.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                <span>{prompt.response_count_today} responses today</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
