import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto space-y-8 h-full">
      {/* Highlights Section Skeleton */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>

      {/* Overview Section Skeleton */}
      <div className="space-y-4 pb-4">
        <Skeleton className="h-7 w-32 bg-[#f9f4f0]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity Chart & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart Skeleton */}
            <Card className="border-none shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-6 w-24 bg-[#f9f4f0]" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                  <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                  <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full bg-[#f9f4f0]" />
              </CardContent>
            </Card>

            {/* Recent Activity Skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-none border-none">
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div className="flex gap-4 w-full">
                      <Skeleton className="w-2 h-2 rounded-full mt-1 bg-[#f9f4f0]" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-48 bg-[#f9f4f0]" />
                        <Skeleton className="h-3 w-64 bg-[#f9f4f0]" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24 bg-[#f9f4f0]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Side Charts */}
          <div className="space-y-6">
            {/* SeoAnalyzerCard Skeleton */}
            <Card className="border-none shadow-none">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40 bg-[#f9f4f0]" />
                <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-8 bg-[#f9f4f0]" />
                      <Skeleton className="h-3 w-8 bg-[#f9f4f0]" />
                      <Skeleton className="h-3 w-8 bg-[#f9f4f0]" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full bg-[#f9f4f0]" />
                    <div className="flex gap-4 pt-1">
                      <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                      <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                      <Skeleton className="h-4 w-16 bg-[#f9f4f0]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* StatusDonutChart Skeleton */}
            <Card className="border-none shadow-none flex flex-col h-[430px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-6 w-32 bg-[#f9f4f0]" />
                <Skeleton className="h-6 w-16 rounded-full bg-[#f9f4f0]" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <Skeleton className="h-[280px] w-[280px] rounded-full mx-auto bg-[#f9f4f0]" />
                <div className="mt-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-2.5 h-2.5 rounded-full bg-[#f9f4f0]" />
                        <Skeleton className="h-4 w-20 bg-[#f9f4f0]" />
                      </div>
                      <Skeleton className="h-4 w-12 bg-[#f9f4f0]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
