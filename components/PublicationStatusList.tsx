"use client";

import React, { useState, useRef, useCallback } from "react";
import PublicationStatusCard from "./PublicationStatusCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Publication {
  id: string;
  status: "pending" | "publishing" | "success" | "failed";
  external_url: string | null;
  external_id: string | null;
  error_message: string | null;
  retry_count: number;
  published_at: string | null;
  attempted_at: string | null;
  integration: {
    id: string;
    platform: string;
    name: string;
    logo_url?: string;
  };
}

interface PublicationStatusListProps {
  publications: Publication[];
  isLoading?: boolean;
  onRetry: (publicationId: string) => void;
  onRefresh?: () => void;
  onUnpublish?: (integrationId: string) => void;
  retryingId?: string;
}

type StatusFilter = "all" | "pending" | "publishing" | "success" | "failed";

export default function PublicationStatusList({
  publications = [],
  isLoading = false,
  onRetry,
  onRefresh,
  onUnpublish,
  retryingId,
}: PublicationStatusListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce timer ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced refresh handler (500ms)
  const handleRefresh = useCallback(() => {
    if (!onRefresh) return;

    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set refreshing state
    setIsRefreshing(true);

    // Debounce the actual refresh call
    refreshTimerRef.current = setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
      refreshTimerRef.current = null;
    }, 500);
  }, [onRefresh]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Filter publications
  const filteredPublications =
    filter === "all"
      ? publications
      : publications.filter((p) => p.status === filter);

  // Count by status
  const statusCounts = {
    pending: publications.filter((p) => p.status === "pending").length,
    publishing: publications.filter((p) => p.status === "publishing").length,
    success: publications.filter((p) => p.status === "success").length,
    failed: publications.filter((p) => p.status === "failed").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border bg-gray-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!publications || publications.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-lg border border-dashed bg-gray-50">
        <p className="text-sm text-gray-500">
          No publications yet. Schedule or publish this article to see status
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
            Publication Status
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-900"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 px-2"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
        )}
      </div>

      {isExpanded && (
        <>
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All ({publications.length})
            </button>

            {statusCounts.success > 0 && (
              <button
                onClick={() => setFilter("success")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === "success"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                )}
              >
                Success ({statusCounts.success})
              </button>
            )}

            {statusCounts.failed > 0 && (
              <button
                onClick={() => setFilter("failed")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === "failed"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                )}
              >
                Failed ({statusCounts.failed})
              </button>
            )}

            {statusCounts.publishing > 0 && (
              <button
                onClick={() => setFilter("publishing")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === "publishing"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                )}
              >
                Publishing ({statusCounts.publishing})
              </button>
            )}

            {statusCounts.pending > 0 && (
              <button
                onClick={() => setFilter("pending")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  filter === "pending"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Pending ({statusCounts.pending})
              </button>
            )}
          </div>

          {/* Publications List */}
          <div className="space-y-3">
            {filteredPublications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No {filter} publications
              </p>
            ) : (
              filteredPublications.map((publication) => (
                <PublicationStatusCard
                  key={publication.id}
                  publication={publication}
                  onRetry={onRetry}
                  onUnpublish={onUnpublish}
                  isRetrying={retryingId === publication.id}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
