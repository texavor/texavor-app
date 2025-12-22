import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CompetitorDetailSkeleton = () => {
  return (
    <div className="space-y-6 pb-4">
      {/* Back Navigation Skeleton */}
      <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />

      {/* Profile Card Skeleton */}
      <div className="bg-white rounded-[32px] p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          {/* Favicon Image Skeleton */}
          <div className="shrink-0">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[#f9f4f0]" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-8 w-64 bg-[#f9f4f0]" />
                <Skeleton className="h-6 w-6 rounded-full bg-[#f9f4f0]" />
              </div>
              <Skeleton className="h-4 w-full max-w-xl bg-[#f9f4f0] mt-2" />
              <Skeleton className="h-4 w-3/4 max-w-lg bg-[#f9f4f0] mt-1" />
            </div>

            {/* Stats Row Skeleton */}
            <div className="flex items-center gap-6 md:gap-8 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 bg-[#f9f4f0]" />
                <Skeleton className="h-5 w-24 bg-[#f9f4f0]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 bg-[#f9f4f0]" />
                <Skeleton className="h-5 w-32 bg-[#f9f4f0]" />
              </div>
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <Skeleton className="h-11 w-40 rounded-full bg-[#f9f4f0]" />
          </div>
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none shadow-none p-2">
            <CardContent className="flex items-start justify-between p-0">
              <div className="flex gap-4 items-center w-full">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0 bg-[#f9f4f0]" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24 bg-[#f9f4f0]" />
                  <Skeleton className="h-8 w-16 bg-[#f9f4f0]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2 p-1 rounded-xl bg-white h-12 items-center w-fit">
        <Skeleton className="h-9 w-24 rounded-md bg-[#f9f4f0]" />
        <Skeleton className="h-9 w-24 rounded-md bg-[#f9f4f0]" />
        <Skeleton className="h-9 w-32 rounded-md bg-[#f9f4f0]" />
      </div>

      {/* Tab Content Skeleton (Recent Articles Table) */}
      <div className="space-y-4">
        <div className="rounded-md bg-white p-4">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex justify-between pb-4 border-b">
              <Skeleton className="h-4 w-1/4 bg-[#f9f4f0]" />
              <Skeleton className="h-4 w-1/4 bg-[#f9f4f0]" />
              <Skeleton className="h-4 w-1/6 bg-[#f9f4f0]" />
              <Skeleton className="h-4 w-1/6 bg-[#f9f4f0]" />
            </div>
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex justify-between py-4 border-b last:border-0"
              >
                <div className="space-y-2 w-1/4">
                  <Skeleton className="h-4 w-3/4 bg-[#f9f4f0]" />
                </div>
                <div className="space-y-2 w-1/4">
                  <Skeleton className="h-4 w-full bg-[#f9f4f0]" />
                </div>
                <div className="w-1/6">
                  <Skeleton className="h-4 w-20 bg-[#f9f4f0]" />
                </div>
                <div className="w-1/6 flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full bg-[#f9f4f0]" />
                  <Skeleton className="h-5 w-16 rounded-full bg-[#f9f4f0]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-none shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-[#f9f4f0]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-[#f9f4f0]" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-[#f9f4f0]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full bg-[#f9f4f0]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
