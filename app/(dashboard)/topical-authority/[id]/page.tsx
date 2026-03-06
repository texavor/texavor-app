import { Metadata } from "next";
import TopicalAuthorityIdContent from "./TopicalAuthorityIdContent";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="border rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
      <Skeleton className="h-16 w-16 mb-4" />
      <Skeleton className="h-6 w-64 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>
  </div>
);

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TopicalAuthorityIdPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<TopicalAuthoritySkeleton />}>
      <TopicalAuthorityIdContent id={id} />
    </Suspense>
  );
}
