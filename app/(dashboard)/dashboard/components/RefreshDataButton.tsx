import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { useAeoPolling } from "../services/aeoService";
import { useAppStore } from "@/store/appStore";
import { useQueryClient } from "@tanstack/react-query";

export const RefreshDataButton: React.FC = () => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  const handleRefreshComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["aeo-metrics", blogs?.id] });
    queryClient.invalidateQueries({ queryKey: ["aeo-prompts", blogs?.id] });
    // Also invalidate trends and other related data
    queryClient.invalidateQueries({
      queryKey: ["aeo-competitive", blogs?.id],
    });
  };

  const { isPolling, startPolling, progress } = useAeoPolling(
    blogs?.id,
    handleRefreshComplete,
  );

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={startPolling}
        disabled={isPolling}
        className="h-9 font-inter gap-2 shadow-sm"
        size="sm"
      >
        {isPolling ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing ({Math.round(progress)}%)...
          </span>
        ) : (
          <span className="flex items-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4" />
            Analyze Live Data
          </span>
        )}
      </Button>

      {/* Status Text / Progress Info */}
      <div className="flex items-center min-h-[24px]">
        {!isPolling && progress === 100 && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2 duration-500">
            <CheckCircle2 className="w-4 h-4" />
            Updated just now
          </span>
        )}
      </div>
    </div>
  );
};
