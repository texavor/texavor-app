import React from "react";
import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import KeywordDiscoveryContent from "./KeywordDiscoveryContent";

export const metadata: Metadata = {
  title: "Keyword Discovery",
};

const KeywordDiscoverySkeleton = () => (
  <div className="flex flex-col">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <Skeleton className="h-9 w-44 rounded-md" />
    </div>
    <div className="flex-1 space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  </div>
);

export default function KeywordDiscoveryPage() {
  return (
    <Suspense fallback={<KeywordDiscoverySkeleton />}>
      <KeywordDiscoveryContent />
    </Suspense>
  );
}
