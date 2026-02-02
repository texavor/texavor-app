"use client";

import React from "react";
import { useAppStore } from "@/store/appStore";
import { Brain, Target, Sparkles, TrendingUp } from "lucide-react";
import MetricCard from "./MetriCard";
import { VisibilityScoreCard } from "./components/VisibilityScoreCard";
import { PlatformBreakdownCard } from "./components/PlatformBreakdownCard";
import { CategoryPerformanceCard } from "./components/CategoryPerformanceCard";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary: AI Visibility Score */}
        <VisibilityScoreCard score={currentScore || null} />

        {/* Secondary: Total Mentions */}
        <MetricCard
          type="secondary"
          label="Total Mentions"
          value={currentScore?.total_mentions || 0}
          icon={<Target className="w-5 h-5" />}
          subtext={`Across ${currentScore?.total_prompts_tested || 0} prompts`}
        />

        {/* Secondary: Platforms Tracked */}
        <MetricCard
          type="secondary"
          label="Platforms Tracked"
          value={`${currentScore?.platforms_count || 0}/${summary?.platforms_tracked || 7}`}
          icon={<Brain className="w-5 h-5" />}
          subtext={
            currentScore?.best_platform
              ? `Best: ${currentScore.best_platform}`
              : "No data"
          }
        />

        {/* Secondary: Active Prompts */}
        <MetricCard
          type="secondary"
          label="Active Prompts"
          value={summary?.total_prompts || 0}
          icon={<Sparkles className="w-5 h-5" />}
          subtext={`${summary?.total_responses || 0} total responses`}
        />
      </div>

      {/* Middle Section - Trend Chart & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Visibility Trend Chart */}
        <div className="lg:col-span-2">
          <VisibilityTrendChart
            historicalScores={aeoMetrics?.historical_scores || []}
          />
        </div>

        {/* Right: Quick Stats Summary */}
        <div className="space-y-6">
          <MetricCard
            type="secondary"
            label="Cross-Model Consistency"
            value={`${currentScore?.cross_model_consistency?.toFixed(1) || 0}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            subtext="Platform coverage rate"
          />
        </div>
      </div>

      {/* Performance Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <PlatformBreakdownCard
          platforms={aeoMetrics?.platform_breakdown || {}}
        />

        {/* Category Performance */}
        <CategoryPerformanceCard
          categories={aeoMetrics?.category_breakdown || {}}
        />
      </div>

      {/* Bottom Section - Prompts & Competitive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        {/* Active Prompts List */}
        <PromptsListCard prompts={prompts} />

        {/* Competitive Rankings */}
        <CompetitiveRankingsCard rankings={rankings} />
      </div>
    </div>
  );
};

export default DashboardClientPage;
