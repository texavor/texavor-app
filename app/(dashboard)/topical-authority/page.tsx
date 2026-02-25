import React from "react";
import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TopicalAuthorityContent from "./TopicalAuthorityContent";

export const metadata: Metadata = {
  title: "Topical Authority Map",
};

const TopicalAuthoritySkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="lg:col-span-2 border rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  </div>
);

export default function TopicalAuthorityPage() {
  return (
    <Suspense fallback={<TopicalAuthoritySkeleton />}>
      <TopicalAuthorityContent />
    </Suspense>
  );
}
