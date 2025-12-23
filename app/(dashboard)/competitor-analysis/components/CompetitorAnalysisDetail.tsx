"use client";

import { Analysis, Article } from "@/lib/api/competitors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  FileText,
  Globe,
  Hash,
  LayoutTemplate,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CustomTable } from "@/components/ui/CustomTable";
import { articleColumns } from "./article-columns";
import RecommendationsList from "./RecommendationsList";

interface CompetitorAnalysisDetailProps {
  analysis: Analysis;
}

type TabType = "content" | "seo" | "topics" | "recommendations";

export default function CompetitorAnalysisDetail({
  analysis,
}: CompetitorAnalysisDetailProps) {
  const {
    content_analysis,
    seo_analysis,
    topics_identified,
    keywords_found,
    content_quality_score,
    seo_score,
    overall_score,
  } = analysis;

  const [activeTab, setActiveTab] = useState<TabType>("content");

  return (
    <div className="space-y-6">
      {/* Overview Cards - Dashboard Style */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-none p-2">
          <CardContent className="flex items-start justify-between p-0">
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  (content_quality_score || 0) >= 70
                    ? "bg-green-100"
                    : (content_quality_score || 0) >= 40
                    ? "bg-orange-100"
                    : "bg-red-100"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6",
                    (content_quality_score || 0) >= 70
                      ? "text-green-600"
                      : (content_quality_score || 0) >= 40
                      ? "text-orange-600"
                      : "text-red-600"
                  )}
                >
                  <FileText className="w-full h-full" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#7A7A7A] font-poppins">
                  Content Score
                </p>
                <h3 className="text-2xl font-semibold text-[#0A2918] font-poppins">
                  {content_quality_score
                    ? content_quality_score.toFixed(1)
                    : "N/A"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none p-2">
          <CardContent className="flex items-start justify-between p-0">
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  (seo_score || 0) >= 70
                    ? "bg-green-100"
                    : (seo_score || 0) >= 40
                    ? "bg-orange-100"
                    : "bg-red-100"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6",
                    (seo_score || 0) >= 70
                      ? "text-green-600"
                      : (seo_score || 0) >= 40
                      ? "text-orange-600"
                      : "text-red-600"
                  )}
                >
                  <Globe className="w-full h-full" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#7A7A7A] font-poppins">
                  SEO Score
                </p>
                <h3 className="text-2xl font-semibold text-[#0A2918] font-poppins">
                  {seo_score ? seo_score.toFixed(1) : "N/A"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none p-2">
          <CardContent className="flex items-start justify-between p-0">
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  (overall_score || 0) >= 70
                    ? "bg-blue-100"
                    : (overall_score || 0) >= 40
                    ? "bg-orange-100"
                    : "bg-red-100"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6",
                    (overall_score || 0) >= 70
                      ? "text-blue-600"
                      : (overall_score || 0) >= 40
                      ? "text-orange-600"
                      : "text-red-600"
                  )}
                >
                  <TrendingUp className="w-full h-full" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#7A7A7A] font-poppins">
                  Overall Score
                </p>
                <h3 className="text-2xl font-semibold text-[#0A2918] font-poppins">
                  {overall_score ? overall_score.toFixed(1) : "N/A"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none p-2">
          <CardContent className="flex items-start justify-between p-0">
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  "bg-green-100"
                )}
              >
                <div className={cn("w-6 h-6", "text-green-600")}>
                  <FileText className="w-full h-full" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#7A7A7A] font-poppins">
                  New Articles
                </p>
                <h3 className="text-2xl font-semibold text-[#0A2918] font-poppins">
                  {content_analysis.new_articles_count}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-2 p-1 rounded-xl bg-white h-12 items-center w-fit">
        <Button
          variant={activeTab === "content" ? "default" : "outline"}
          onClick={() => setActiveTab("content")}
          className="border-none"
        >
          Content
        </Button>
        <Button
          variant={activeTab === "seo" ? "default" : "outline"}
          onClick={() => setActiveTab("seo")}
          className="border-none"
        >
          SEO
        </Button>
        <Button
          variant={activeTab === "topics" ? "default" : "outline"}
          onClick={() => setActiveTab("topics")}
          className="border-none"
        >
          Topics & Keywords
        </Button>
        <Button
          variant={activeTab === "recommendations" ? "default" : "outline"}
          onClick={() => setActiveTab("recommendations")}
          className="border-none"
        >
          Recommendations
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "content" && (
        <div className="space-y-4">
          <div className="rounded-md">
            <CustomTable
              columns={articleColumns}
              data={content_analysis.recent_articles || []}
              isLoading={false}
              className="border-none"
              onClick={(row: Article) => window.open(row.url, "_blank")}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Publishing Frequency - Takes up 1 column */}
            <Card className="border-none shadow-none bg-white h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Publishing Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content_analysis.publishing_frequency ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">
                        Articles / Month
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {content_analysis.publishing_frequency.articles_per_month.toFixed(
                            1
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          avg
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                          Activity Rating
                        </span>
                        <Badge
                          variant={
                            content_analysis.publishing_frequency
                              .frequency_rating === "high" ||
                            content_analysis.publishing_frequency
                              .frequency_rating === "very_high"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {content_analysis.publishing_frequency.frequency_rating.replace(
                            "_",
                            " "
                          )}
                        </Badge>
                      </div>
                      {/* Visual Rating Meter */}
                      <div className="flex gap-1 h-2">
                        {["low", "moderate", "high", "very_high"].map(
                          (level, index) => {
                            const currentLevel =
                              content_analysis.publishing_frequency
                                ?.frequency_rating;
                            const levels = [
                              "low",
                              "moderate",
                              "high",
                              "very_high",
                            ];
                            const currentIndex = levels.indexOf(
                              currentLevel || "low"
                            );
                            const isActive = index <= currentIndex;

                            return (
                              <div
                                key={level}
                                className={cn(
                                  "flex-1 rounded-full transition-all duration-500",
                                  isActive
                                    ? index === 0
                                      ? "bg-red-400"
                                      : index === 1
                                      ? "bg-orange-400"
                                      : index === 2
                                      ? "bg-green-400"
                                      : "bg-emerald-500"
                                    : "bg-gray-100"
                                )}
                              />
                            );
                          }
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Based on{" "}
                        {
                          content_analysis.publishing_frequency
                            .total_articles_analyzed
                        }{" "}
                        articles analyzed
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Content Types - Takes up 2 columns */}
            <Card className="border-none shadow-none bg-white md:col-span-2 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Content Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content_analysis.content_types ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(content_analysis.content_types)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count], index) => {
                        const maxCount = Math.max(
                          ...Object.values(content_analysis.content_types || {})
                        );
                        const percentage = (count / maxCount) * 100;

                        return (
                          <div key={type} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700 capitalize">
                                {type}
                              </span>
                              <span className="text-gray-500 font-mono">
                                {count}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full opacity-80"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="space-y-4">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>SEO Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Domain Authority
                  </span>
                  <div className="text-2xl font-bold">
                    {seo_analysis.domain_authority ?? "N/A"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Backlinks
                  </span>
                  <div className="text-2xl font-bold">
                    {seo_analysis.backlinks?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Referring Domains
                  </span>
                  <div className="text-2xl font-bold">
                    {seo_analysis.referring_domains?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Organic Keywords
                  </span>
                  <div className="text-2xl font-bold">
                    {seo_analysis.organic_keywords?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Organic Traffic
                  </span>
                  <div className="text-2xl font-bold">
                    {seo_analysis.organic_traffic?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </span>
                  <div className="text-sm font-medium">
                    {new Date(seo_analysis.last_refreshed).toLocaleDateString()}
                  </div>
                  {seo_analysis.cached && (
                    <span className="text-xs text-muted-foreground">
                      Cached
                    </span>
                  )}
                </div>
              </div>
              {seo_analysis.note && (
                <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                  {seo_analysis.note}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "topics" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle>Top Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topics_identified.topics.map((topic) => (
                    <Badge
                      key={topic.name}
                      variant="outline"
                      className="text-sm py-1"
                    >
                      {topic.name} ({topic.count})
                    </Badge>
                  ))}
                  {topics_identified.topics.length === 0 && (
                    <p className="text-muted-foreground">
                      No topics identified.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywords_found.keywords.slice(0, 20).map((keyword) => (
                    <Badge
                      key={keyword.word}
                      variant="secondary"
                      className="text-sm py-1"
                    >
                      {keyword.word} ({keyword.frequency})
                    </Badge>
                  ))}
                  {keywords_found.keywords.length === 0 && (
                    <p className="text-muted-foreground">No keywords found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <RecommendationsList
            recommendations={analysis.recommendations || []}
          />
        </div>
      )}
    </div>
  );
}
