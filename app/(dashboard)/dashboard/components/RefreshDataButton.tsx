import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRefreshAeoData } from "../services/aeoService";
import { useAppStore } from "@/store/appStore";

export const RefreshDataButton: React.FC = () => {
  const { blogs } = useAppStore();
  const refreshMutation = useRefreshAeoData(blogs?.id);
  const [showMessage, setShowMessage] = useState(false);

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      },
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleRefresh}
        disabled={refreshMutation.isPending}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw
          className={`w-4 h-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
        />
        {refreshMutation.isPending ? "Refreshing..." : "Refresh Data"}
      </Button>
      {showMessage && (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Data collection started. This may take 2-5 minutes.
        </span>
      )}
    </div>
  );
};
