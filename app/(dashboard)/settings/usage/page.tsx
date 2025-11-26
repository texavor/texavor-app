"use client";

import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useGetUsage } from "../hooks/useUsageApi";
import {
  FileText,
  Search,
  Lightbulb,
  ListTree,
  Zap,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export default function UsagePage() {
  const { data: usage, isLoading } = useGetUsage();

  if (isLoading) {
    return (
      <div>
        <SettingHeader
          title="Usage & Statistics"
          description="View your usage metrics and limits"
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6 border-none">
                <Skeleton className="h-12 w-12 rounded-full bg-[#f9f4f0] mb-4" />
                <Skeleton className="h-8 w-20 bg-[#f9f4f0] mb-2" />
                <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = usage?.current_month;
  const allTime = usage?.all_time;

  return (
    <div>
      <SettingHeader
        title="Usage & Statistics"
        description="View your usage metrics and limits"
      />

      <div className="space-y-8">
        {/* Current Month Usage */}
        <div>
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            Current Month Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {currentMonth?.articles_created || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Articles Created
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {currentMonth?.keyword_searches || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Keyword Searches
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {currentMonth?.topic_generations || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Topic Generations
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ListTree className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {currentMonth?.outline_generations || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Outline Generations
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {currentMonth?.api_calls?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">API Calls</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* All-Time Statistics */}
        <div>
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            All-Time Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {allTime?.total_articles?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Total Articles
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {allTime?.total_words?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Total Words
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <ListTree className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold font-poppins text-[#0A2918]">
                    {allTime?.total_outlines?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    Total Outlines
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
