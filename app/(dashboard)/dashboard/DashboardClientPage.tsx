"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import {
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import MetricCard from "./MetriCard";
import { VisibilityScoreCard } from "./components/VisibilityScoreCard";
import { VisibilityTrendChart } from "./components/VisibilityTrendChart";
import { PromptsListCard } from "./components/PromptsListCard";
import { CompetitiveRankingsCard } from "./components/CompetitiveRankingsCard";
import { RefreshDataButton } from "./components/RefreshDataButton";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import {
  useAeoMetrics,
  useAeoPrompts,
  useCompetitiveRankings,
} from "./services/aeoService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardClientPage = () => {
  const { blogs } = useAppStore();

  const { data: aeoMetrics, isLoading: metricsLoading } = useAeoMetrics(
    blogs?.id,
  );
  const { data: promptsData, isLoading: promptsLoading } = useAeoPrompts(
    blogs?.id,
  );
  const { data: competitiveData } = useCompetitiveRankings(blogs?.id);

  if (metricsLoading || promptsLoading) {
    return <DashboardSkeleton />;
  }

  const currentScore = aeoMetrics?.current_score;
  const summary = aeoMetrics?.summary;
  const prompts = promptsData?.prompts || [];
  const rankings = competitiveData?.rankings || [];

  return (
    <div className="mx-auto h-full">
      <div className="mx-auto">
        <Tabs defaultValue="overview" className="w-full space-y-8">
          {/* Header with Nav and Refresh button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-poppins tracking-tight">
                Answer Engine Optimization
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Track your brand visibility across AI platforms
              </p>
            </div>

            <div className="flex items-center gap-4">
              <TabsList className="bg-black/5 dark:bg-white/10 p-1 border-none rounded-xl h-11">
                <TabsTrigger
                  value="overview"
                  className="px-6 py-2 h-9 text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all duration-200"
                >
                  Insights & Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  className="px-6 py-2 h-9 text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all duration-200"
                >
                  Prompts & Analysis
                </TabsTrigger>
              </TabsList>
              <RefreshDataButton />
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8 mt-4 outline-none">
            {/* Top Metrics Section */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisibilityScoreCard
                  score={currentScore || null}
                  className="h-48"
                />
                <div className="grid grid-cols-2 gap-6">
                  <MetricCard
                    type="secondary"
                    label="Total Mentions"
                    value={currentScore?.total_mentions || 0}
                    icon={<Target className="w-5 h-5" />}
                    subtext={`Across ${currentScore?.total_prompts_tested || 0} prompts`}
                    className="h-48"
                  />
                  <MetricCard
                    type="secondary"
                    label="Platforms"
                    value={`${currentScore?.platforms_count || 0}/${summary?.platforms_tracked || 5}`}
                    icon={<Brain className="w-5 h-5" />}
                    subtext={
                      currentScore?.best_platform
                        ? `Best: ${currentScore.best_platform}`
                        : "No data"
                    }
                    className="h-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  type="secondary"
                  label="Cross-Model Consistency"
                  value={`${currentScore?.cross_model_consistency?.toFixed(1) || 0}%`}
                  icon={<TrendingUp className="w-5 h-5" />}
                  subtext="Platform coverage rate"
                  className="h-48"
                />
                <MetricCard
                  type="secondary"
                  label="Presence Rate"
                  value={`${currentScore?.presence_rate?.toFixed(1) || 0}%`}
                  icon={<Sparkles className="w-5 h-5" />}
                  subtext="Visibility across all prompts"
                  className="h-48"
                />
                <MetricCard
                  type="secondary"
                  label="Active Prompts"
                  value={summary?.total_prompts || 0}
                  icon={<MessageSquare className="w-5 h-5" />}
                  subtext="Keywords/Questions tracked"
                  className="h-48"
                />
              </div>
            </div>

            <VisibilityTrendChart
              historicalScores={aeoMetrics?.historical_scores || []}
            />

            {/* Platform Performance Grid */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Platform Performance
              </h2>
              {(() => {
                const platforms = aeoMetrics?.platform_breakdown || {};
                const sortedPlatforms = Object.entries(platforms)
                  .map(([name, data]) => ({ name, ...data }))
                  .sort((a, b) => b.score - a.score);

                if (sortedPlatforms.length === 0)
                  return (
                    <p className="text-slate-500 italic">
                      No platform data available.
                    </p>
                  );

                const topTwo = sortedPlatforms.slice(0, 2);
                const others = sortedPlatforms.slice(2);

                const getIconPath = (name: string) => {
                  const lower = name.toLowerCase();
                  if (lower.includes("chatgpt")) return "/ai/chatgpt.png";
                  if (lower.includes("claude")) return "/ai/claude.jpg";
                  if (lower.includes("gemini")) return "/ai/gemini.jpg";
                  if (lower.includes("grok")) return "/ai/grok.jpg";
                  if (lower.includes("perplexity")) return "/ai/perplexity.png";
                  return null;
                };

                const getInterpretation = (score: number) => {
                  if (score >= 90) return "Excellent";
                  if (score >= 70) return "Good";
                  if (score >= 50) return "Fair";
                  return "Poor";
                };

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {topTwo.map((p) => (
                        <MetricCard
                          key={p.name}
                          type="primary"
                          label={p.name}
                          value={p.score.toFixed(1)}
                          interpretation={getInterpretation(p.score)}
                          subtext={
                            <span className="opacity-80">
                              Avg Pos:{" "}
                              <strong className="text-white">
                                #{(p.avg_position || 0).toFixed(1)}
                              </strong>
                            </span>
                          }
                          icon={
                            getIconPath(p.name) ? (
                              <img
                                src={getIconPath(p.name)!}
                                alt={p.name}
                                className="w-full h-full object-contain rounded-full"
                              />
                            ) : (
                              <Brain className="w-6 h-6" />
                            )
                          }
                          className="h-52"
                          gaugeValue={p.score}
                        />
                      ))}
                    </div>
                    {others.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {others.map((p) => (
                          <MetricCard
                            key={p.name}
                            type="secondary"
                            label={p.name}
                            value={p.score.toFixed(1)}
                            subtext={`Avg Pos: #${(p.avg_position || 0).toFixed(1)}`}
                            icon={
                              getIconPath(p.name) ? (
                                <img
                                  src={getIconPath(p.name)!}
                                  alt={p.name}
                                  className="w-full h-full object-contain rounded-full"
                                />
                              ) : (
                                <Brain className="w-5 h-5 text-slate-400" />
                              )
                            }
                            className="h-44"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent
            value="analysis"
            className="space-y-12 mt-8 outline-none pb-8"
          >
            <PromptsListCard
              prompts={prompts}
              isLoading={promptsLoading}
              blogId={blogs?.id}
            />

            <div className="pt-8 border-t border-slate-100 dark:border-zinc-800">
              <CompetitiveRankingsCard rankings={rankings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardClientPage;
