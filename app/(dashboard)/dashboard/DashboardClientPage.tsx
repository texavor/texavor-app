"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { FileText, CheckCircle2, FileEdit, Lightbulb } from "lucide-react";
import { StatsCard } from "./components/StatsCard";
import { ActivityChart } from "./components/ActivityChart";
import { StatusDonutChart } from "./components/StatusDonutChart";
import { ContentInsightsCard } from "./components/ContentInsightsCard";
import { useRouter } from "next/navigation";
import { getStatusColor } from "@/lib/constants";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import NextImage from "next/image";

interface DashboardData {
  highlights: {
    total_articles: { value: number; trend: number; trend_direction: string };
    published: { value: number; trend: number; trend_direction: string };
    drafts: { value: number; trend: number; trend_direction: string };
    topic_ideas: { value: number; trend: number; trend_direction: string };
  };
  overview: {
    activity_chart: {
      date: string;
      published: number;
      drafts: number;
      scheduled: number;
    }[];
    recent_activity: {
      id: string;
      title: string;
      description: string;
      status: string;
      time_ago: string;
    }[];
  };
  analytics: {
    content_insights: {
      total_words: number;
      avg_words_per_article: number;
      avg_reading_time_minutes: number;
    };
    article_status_distribution: {
      published: number;
      drafts: number;
      scheduled: number;
      trend: number;
    };
  };
}

const DashboardClientPage = () => {
  const { blogs } = useAppStore();
  const router = useRouter();

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", blogs?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/dashboard`,
      );
      return res?.data?.data || {};
    },
    enabled: !!blogs?.id,
  });

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const highlights = dashboardData?.highlights;
  const overview = dashboardData?.overview;
  const analytics = dashboardData?.analytics;

  return (
    <div className="mx-auto space-y-8 h-full">
      {/* Highlights Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            count={highlights?.total_articles?.value || 0}
            trend={highlights?.total_articles?.trend || 0}
            icon={<FileText className="w-full h-full" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Published"
            count={highlights?.published?.value || 0}
            trend={highlights?.published?.trend || 0}
            icon={<CheckCircle2 className="w-full h-full" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            subTitle="Live on blog"
          />
          <StatsCard
            title="Drafts"
            count={highlights?.drafts?.value || 0}
            trend={highlights?.drafts?.trend || 0}
            icon={<FileEdit className="w-full h-full" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            subTitle="Work in progress"
          />
          <StatsCard
            title="Topic Ideas"
            count={highlights?.topic_ideas?.value || 0}
            trend={highlights?.topic_ideas?.trend || 0}
            icon={<Lightbulb className="w-full h-full" />}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            subTitle="Generated topics"
          />
        </div>
      </div>

      {/* Overview Section */}
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity Chart & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px]">
              <ActivityChart data={overview?.activity_chart} />
            </div>
            {/* Recent Activity List */}
            <div className="bg-white rounded-xl p-6 shadow-none border-none">
              <div className="space-y-6">
                {overview?.recent_activity &&
                overview.recent_activity.length > 0 ? (
                  overview.recent_activity.map((item: any, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between group"
                    >
                      <div className="flex gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#104127] transition-colors" />
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(item?.status).bg,
                            color: getStatusColor(item?.status).text,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(item?.status)
                                .text,
                            }}
                          />
                          <p className="capitalize">{item?.status}</p>
                        </div>
                        <span className="text-xs text-gray-500 font-medium w-16 text-right">
                          {item?.time_ago}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative w-48 h-48 mb-4 opacity-60">
                      <NextImage
                        src="/empty-state.png"
                        alt="No Recent Activity"
                        fill
                        className="object-contain grayscale"
                      />
                    </div>
                    <h4 className="text-lg font-semibold text-[#0A2918] font-poppins">
                      No Activity Yet
                    </h4>
                    <p className="text-sm text-gray-500 font-inter max-w-xs mx-auto">
                      Your recent article actions and updates will appear here.
                      Start by creating a new article!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Side Charts */}
          <div className="space-y-6">
            <ContentInsightsCard data={analytics?.content_insights} />
            <StatusDonutChart data={analytics?.article_status_distribution} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClientPage;
