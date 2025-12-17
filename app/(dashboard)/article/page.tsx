"use client";

import React, { Suspense } from "react";
import ArticlePageContent from "./ArticlePageContent";
import { Skeleton } from "@/components/ui/skeleton";

const ArticlePageSkeleton = () => (
  <div className="flex flex-col">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      <Skeleton className="h-9 w-36 rounded-md" />
    </div>
    <div className="flex-1 space-y-4">
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  </div>
);

const Page = () => {
  return (
    <Suspense fallback={<ArticlePageSkeleton />}>
      <ArticlePageContent />
    </Suspense>
  );
};

export default Page;
