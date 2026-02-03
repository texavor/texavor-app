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
    <div className="mx-auto space-y-8 h-full">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Answer Engine Optimization
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your brand visibility across AI platforms
          </p>
        </div>
        <RefreshDataButton />
      </div>

      {/* Top Metrics Row */}
      {/* Top Metrics Row */}
      {/* Top Metrics Section */}
      <div className="flex flex-col gap-6">
        {/* Row 1: Primary + 2 Secondaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Primary Visibility Score (50% width) */}
          <VisibilityScoreCard score={currentScore || null} className="h-48" />

          {/* Right: Two Secondary Cards */}
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

        {/* Row 2: Three Metrics (3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Middle Section - Trend Chart Only (Full Width) */}
      <div className="grid grid-cols-1 gap-6">
        <VisibilityTrendChart
          historicalScores={aeoMetrics?.historical_scores || []}
        />
      </div>

      {/* Platform Performance Section - Cards System */}
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Platform Performance
        </h2>

        {/* Sort and prepare platform data */}
        {(() => {
          const platforms = aeoMetrics?.platform_breakdown || {};
          const sortedPlatforms = Object.entries(platforms)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.score - a.score);

          if (sortedPlatforms.length === 0)
            return <p>No platform data available.</p>;

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
            <>
              {/* Top 2 Primary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topTwo.map((p) => (
                  <MetricCard
                    key={p.name}
                    type="primary"
                    label={p.name}
                    value={p.score.toFixed(1)}
                    interpretation={getInterpretation(p.score)}
                    subtext={
                      <span className="flex items-center gap-2 opacity-80">
                        Avg Position:{" "}
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
                    className="h-56"
                    gaugeValue={p.score}
                  />
                ))}
              </div>

              {/* Others - Secondary Cards */}
              {others.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="h-48"
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Bottom Section - Prompts & Competitive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {/* Active Prompts List */}
        <PromptsListCard
          prompts={prompts}
          isLoading={promptsLoading}
          blogId={blogs?.id}
        />

        {/* Competitive Rankings */}
        <CompetitiveRankingsCard rankings={rankings} />
      </div>
    </div>
  );
};

export default DashboardClientPage;
