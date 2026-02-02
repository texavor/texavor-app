import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="mx-auto space-y-8 h-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Top Metrics Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-6 bg-primary/5 dark:bg-zinc-900 border border-border/50"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-12 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Middle Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl p-6 bg-white dark:bg-zinc-900 border border-border/50">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl p-6 bg-primary/5 dark:bg-zinc-900 border border-border/50">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Performance Breakdown Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6 bg-primary/5 dark:bg-zinc-900 border border-border/50"
          >
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6 bg-primary/5 dark:bg-zinc-900 border border-border/50"
          >
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-border/50"
                >
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
