import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex justify-between gap-2 h-[calc(100vh-100px)]">
      {/* LEFT — Editor Skeleton (w-8/12) */}
      <div className="w-8/12 bg-white rounded-xl p-6 space-y-8 font-inter h-full overflow-y-auto no-scrollbar">
        {/* Toolbar Placeholder */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-32 h-8 rounded-md bg-[#f9f4f0]" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-md bg-[#f9f4f0]" />
            <Skeleton className="w-8 h-8 rounded-md bg-[#f9f4f0]" />
            <Skeleton className="w-8 h-8 rounded-md bg-[#f9f4f0]" />
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <Skeleton className="w-full h-10 rounded-md bg-[#f9f4f0]" />
          <Skeleton className="w-3/4 h-12 rounded-md mt-8 bg-[#f9f4f0]" />
          <div className="space-y-4 mt-8">
            <Skeleton className="w-full h-4 rounded bg-[#f9f4f0]" />
            <Skeleton className="w-full h-4 rounded bg-[#f9f4f0]" />
            <Skeleton className="w-5/6 h-4 rounded bg-[#f9f4f0]" />
            <Skeleton className="w-full h-4 rounded bg-[#f9f4f0]" />
            <Skeleton className="w-4/5 h-4 rounded bg-[#f9f4f0]" />
          </div>
        </div>
      </div>

      {/* RIGHT — Insights Panel Skeleton (w-4/12) */}
      <div className="w-4/12 bg-white rounded-xl p-4 h-full overflow-y-auto no-scrollbar space-y-6 font-inter">
        {/* Tabs Placeholder */}
        <div className="flex bg-[#f9f4f0] p-1 rounded-lg mb-6">
          <Skeleton className="h-7 w-1/2 rounded-md bg-white shadow-sm" />
          <div className="w-1/2" />
        </div>

        {/* Header + Action Button */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 bg-[#f9f4f0]" />
          <Skeleton className="h-8 w-24 rounded-md bg-[#15803d]" />
        </div>

        {/* Readability Score */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24 bg-[#f9f4f0]" />
            <Skeleton className="h-4 w-8 bg-[#f9f4f0]" />
          </div>
          <Skeleton className="h-2 w-full rounded-full bg-[#f9f4f0]" />
        </div>

        {/* SEO Details Box */}
        <div className="bg-[#f9f4f0] rounded-lg p-4 space-y-3">
          <Skeleton className="h-4 w-32 bg-white" />
          <Skeleton className="h-4 w-28 bg-white" />
          <Skeleton className="h-4 w-36 bg-white" />
          <Skeleton className="h-4 w-24 bg-white" />
        </div>

        {/* SEO Score Donut */}
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton className="h-24 w-24 rounded-full border-8 border-[#f9f4f0]" />
        </div>

        {/* Other Scores */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 bg-[#f9f4f0]" />
              <Skeleton className="h-4 w-10 bg-[#f9f4f0]" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-[#f9f4f0]" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 bg-[#f9f4f0]" />
              <Skeleton className="h-4 w-10 bg-[#f9f4f0]" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-[#f9f4f0]" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#f9f4f0] rounded-lg p-4 space-y-2">
          <Skeleton className="h-5 w-24 bg-white mb-2" />
          <Skeleton className="h-4 w-full bg-white" />
          <Skeleton className="h-4 w-full bg-white" />
          <Skeleton className="h-4 w-2/3 bg-white" />
        </div>
      </div>
    </div>
  );
}
