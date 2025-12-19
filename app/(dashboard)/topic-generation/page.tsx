import React, { Suspense } from "react";
import TopicGenerationClient from "./TopicGenerationClient";
import { Skeleton } from "@/components/ui/skeleton";

const TopicGenerationSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 max-h-[170px]">
        <div className="bg-white rounded-xl w-full lg:w-8/12 p-4 space-y-2 border-none shadow-none">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-[50%]" />
        </div>
        <div className="bg-white rounded-xl w-full lg:w-4/12 border-none shadow-none p-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<TopicGenerationSkeleton />}>
      <TopicGenerationClient />
    </Suspense>
  );
};

export default Page;
