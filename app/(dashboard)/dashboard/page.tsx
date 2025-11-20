"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, FileEdit, Lightbulb } from "lucide-react";
import { StatsCard } from "./components/StatsCard";
import { ActivityChart } from "./components/ActivityChart";
import { StatusDonutChart } from "./components/StatusDonutChart";
import { SeoAnalyzerCard } from "./components/SeoAnalyzerCard";

interface Article {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Pagination {
  count: number;
}

const DashboardPage = () => {
  const { blogs, user } = useAppStore();

  // Fetch Articles (for count and recent list)
  const { data: articlesData, isLoading: isLoadingArticles } = useQuery<{
    articles: Article[];
    pagination: Pagination;
  }>({
    queryKey: ["dashboard-articles", blogs?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles`,
        {
          params: {
            per_page: 10,
            page: 1,
          },
        }
      );
      return res?.data || { articles: [], pagination: { count: 0 } };
    },
    enabled: !!blogs?.id,
  });

  // Fetch Recent Searches (for Topic Ideas count)
  const { data: recentSearches = [], isLoading: isLoadingSearches } = useQuery<
    any[]
  >({
    queryKey: ["recentSearches", blogs?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/recent_searches`
      );
      return res?.data?.data || [];
    },
    enabled: !!blogs?.id,
  });

  // Calculate Stats
  const totalArticles = articlesData?.pagination?.count || 0;
  const publishedCount =
    articlesData?.articles?.filter((a) => a.status === "published").length || 0; // Note: This is only from the first page, ideally backend provides stats
  const draftCount =
    articlesData?.articles?.filter((a) => a.status === "draft").length || 0;
  const topicIdeasCount = recentSearches.length;

  return (
    <div className="container mx-auto p-6 space-y-8 bg-[#FAFAFA] h-full">
      {/* Highlights Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-poppins text-gray-900">
            Blog Highlights
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Articles"
            count={totalArticles}
            trend={12.8}
            icon={<FileText className="w-full h-full" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Published"
            count={publishedCount} // Placeholder logic
            trend={9.6}
            icon={<CheckCircle2 className="w-full h-full" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            subTitle="Live on blog"
          />
          <StatsCard
            title="Drafts"
            count={draftCount} // Placeholder logic
            trend={14.3}
            icon={<FileEdit className="w-full h-full" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            subTitle="Work in progress"
          />
          <StatsCard
            title="Topic Ideas"
            count={topicIdeasCount}
            trend={4.8}
            icon={<Lightbulb className="w-full h-full" />}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            subTitle="Generated topics"
          />
        </div>
      </div>

      {/* Overview Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-poppins text-gray-900">
          Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity Chart & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px]">
              <ActivityChart />
            </div>
            {/* Recent Activity List (Mocked for visual match) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-6">
                {[
                  {
                    title: "New Article Published",
                    desc: "The Future of AI in Writing",
                    status: "Active",
                    load: "Just now",
                  },
                  {
                    title: "Topic Generation",
                    desc: "Generated 10 ideas for 'Healthy Eating'",
                    status: "Completed",
                    load: "2h ago",
                  },
                  {
                    title: "SEO Analysis",
                    desc: "Optimized '10 Tips for React'",
                    status: "Active",
                    load: "5h ago",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between group"
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded text-xs font-medium text-green-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {item.status}
                      </div>
                      <span className="text-xs text-gray-500 font-medium w-16 text-right">
                        {item.load}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400"
                      >
                        <FileEdit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Side Charts */}
          <div className="space-y-6">
            <SeoAnalyzerCard />
            <StatusDonutChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
