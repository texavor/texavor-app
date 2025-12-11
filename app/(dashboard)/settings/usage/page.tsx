"use client";

import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUsage } from "../hooks/useUsageApi";
import { ScoreMeter } from "@/components/ScoreMeter";
import {
  FileText,
  Search,
  Lightbulb,
  ListTree,
  Zap,
  TrendingUp,
  FileCheck,
  Puzzle,
} from "lucide-react";

import { useAppStore } from "@/store/appStore";

export default function UsagePage() {
  const { blogs } = useAppStore();
  const { data: usage, isLoading } = useGetUsage(blogs?.id);

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

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Unlimited";
    return limit.toLocaleString();
  };

  const UsageCard = ({
    icon: Icon,
    colorClass,
    bgClass,
    label,
    used,
    limit,
  }: {
    icon: any;
    colorClass: string;
    bgClass: string;
    label: string;
    used: number;
    limit: number;
  }) => {
    const percentage = limit === -1 ? 0 : Math.min(used / limit, 1);

    return (
      <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center`}
            >
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-inter">{label}</p>
              <p className="text-2xl font-bold font-poppins text-[#0A2918]">
                {used.toLocaleString()}
                <span className="text-sm text-gray-400 font-normal ml-1">
                  / {formatLimit(limit)}
                </span>
              </p>
            </div>
          </div>
        </div>
        {limit !== -1 && (
          <div className="mt-2">
            <ScoreMeter value={percentage} inverse={true} />
            <p className="text-xs text-right text-gray-500 mt-1 font-inter">
              {Math.round(percentage * 100)}% used
            </p>
          </div>
        )}
      </Card>
    );
  };

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
            <UsageCard
              icon={FileText}
              bgClass="bg-blue-100"
              colorClass="text-blue-600"
              label="Articles Created"
              used={currentMonth?.articles_created || 0}
              limit={currentMonth?.articles_limit || 0}
            />

            <UsageCard
              icon={ListTree}
              bgClass="bg-orange-100"
              colorClass="text-orange-600"
              label="Outlines Generated"
              used={currentMonth?.outlines_created || 0}
              limit={currentMonth?.outlines_limit || 0}
            />

            <UsageCard
              icon={Lightbulb}
              bgClass="bg-green-100"
              colorClass="text-green-600"
              label="Topic Ideas"
              used={currentMonth?.topics_generated || 0}
              limit={currentMonth?.topics_limit || 0}
            />

            <UsageCard
              icon={Search}
              bgClass="bg-purple-100"
              colorClass="text-purple-600"
              label="Keyword Queries"
              used={currentMonth?.keyword_queries || 0}
              limit={currentMonth?.keyword_limit || 0}
            />

            <UsageCard
              icon={Puzzle}
              bgClass="bg-yellow-100"
              colorClass="text-yellow-600"
              label="Integrations Used"
              used={currentMonth?.integrations_used || 0}
              limit={currentMonth?.integrations_limit || 0}
            />
          </div>
        </div>

        {/* All-Time Statistics */}
        <div>
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            All-Time Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-none shadow-sm">
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

            <Card className="p-6 border-none shadow-sm">
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

            <Card className="p-6 border-none shadow-sm">
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
