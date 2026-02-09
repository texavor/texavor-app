"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";
import { calculateArticleStats } from "@/lib/textStats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Book } from "lucide-react";
import {
  useOutlineApi,
  OutlineData,
} from "../../outline-generation/hooks/useOutlineApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";
import { SmartLinkingPanel } from "./components/SmartLinkingPanel";
import { LinkSuggestion } from "@/hooks/useSmartLinking";
import { AeoHeroSection } from "./components/insights/AeoHeroSection";
import { PlatformBlockers } from "./components/insights/PlatformBlockers";
import { AnswerabilityBreakdown } from "./components/insights/AnswerabilityBreakdown";
import { RetrievableChunks } from "./components/insights/RetrievableChunks";
import { CitationPotential } from "./components/insights/CitationPotential";
import { AuthoritySignals } from "./components/insights/AuthoritySignals";
import { ReadabilitySeo } from "./components/insights/ReadabilitySeo";

interface InsightsPanelProps {
  showMetrics: boolean;
  toggleMetricsVisibility: () => void;
  isAnalyzing: boolean;
  onAnalyzeClick: () => void;
  insights: any;
  savedResult?: any;
  articleTitle?: string;
  articleId?: string;
  articleContent?: string;
  blogId?: string;
  onApplyLink?: (suggestion: LinkSuggestion) => void;
  onRemoveLink?: (anchorText: string, url: string) => void;
  onHighlightText?: (text: string) => void;
}

const InsightsPanel = ({
  showMetrics,
  toggleMetricsVisibility,
  isAnalyzing,
  onAnalyzeClick,
  insights,
  savedResult,
  articleTitle,
  articleId,
  articleContent = "",
  blogId,
  onApplyLink,
  onRemoveLink,
  onHighlightText,
}: InsightsPanelProps) => {
  const [outlineTopic, setOutlineTopic] = useState(articleTitle || "");
  const { generateOutline } = useOutlineApi();
  const [generatedOutline, setGeneratedOutline] = useState<OutlineData | null>(
    null,
  );

  // Update topic when article title changes
  React.useEffect(() => {
    if (articleTitle && !outlineTopic) {
      setOutlineTopic(articleTitle);
    }
  }, [articleTitle]);

  const liveStats = React.useMemo(() => {
    return calculateArticleStats(articleContent);
  }, [articleContent]);

  if (!showMetrics) {
    return null;
  }

  const {
    aeo = {},
    seo_score = 0,
    seo = {}, // Ensure seo object is available
    simulation = {},
    entity_gaps = {},
    live_benchmark = [],
    readability = {},
    stats = {},
  } = insights || {};

  const { suggestions = [] } = (insights as any)?.grammar || {};

  // Determine which outline to display
  const outlineData =
    savedResult?.result_type === "outline_generation"
      ? savedResult.result_data
      : generatedOutline;

  const handleGenerateOutline = () => {
    if (!outlineTopic.trim()) return;

    generateOutline.mutate(
      {
        topic: outlineTopic,
        article_id: articleId,
        deep_research: true,
        aeo_optimization: true,
      },
      {
        onSuccess: (data: OutlineData) => {
          setGeneratedOutline(data);
        },
      },
    );
  };

  return (
    <div className="bg-white h-[calc(100vh-100px)] rounded-xl flex flex-col">
      <Tabs defaultValue="insights" className="w-full flex flex-col h-full">
        <div className="sticky top-0 bg-white z-10 p-4 pb-2 rounded-t-xl">
          <TabsList className="w-full">
            <TabsTrigger value="insights" className="flex-1">
              Content Insights
            </TabsTrigger>
            <TabsTrigger value="outline" className="flex-1">
              Outline
            </TabsTrigger>
            <TabsTrigger value="smart_links" className="flex-1">
              Smart Links
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Insights Tab */}
        <TabsContent
          value="insights"
          className="flex-1 overflow-y-auto h-[calc(100vh-160px)] no-scrollbar px-4 pb-4"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Top Section — Header & Action */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black font-poppins">
                  Content Analysis
                </h3>
                <Button
                  onClick={onAnalyzeClick}
                  disabled={isAnalyzing}
                  className="text-xs h-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Words
                  </p>
                  <p className="font-bold text-white">
                    {stats.word_count || liveStats.wordCount}
                  </p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Reading Time
                  </p>
                  <p className="font-bold text-white">
                    {stats.reading_time || liveStats.readingTime}m
                  </p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Keywords
                  </p>
                  <p className="font-bold text-white">
                    {stats.keyword_count || 0}
                  </p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Difficulty
                  </p>
                  <p className="font-bold text-white">
                    {stats.difficulty || 1}
                  </p>
                </div>
              </div>

              {insights ? (
                // NEW STRUCTURE
                <div className="space-y-4">
                  {/* 1. AEO Readiness (Hero) */}
                  <AeoHeroSection
                    aeoScore={aeo.score || 0}
                    answerabilityScore={aeo.answerability?.score || 0}
                    platformScores={aeo.platform_scores}
                  />

                  {/* 2. Platform Blockers (Most Important) */}
                  <PlatformBlockers
                    blockers={aeo.platform_blockers}
                    recommendations={aeo.platform_recommendations}
                  />

                  {/* 3. Answerability Breakdown */}
                  <AnswerabilityBreakdown data={aeo.answerability} />

                  {/* 4. Retrievable Chunks (Expandable) */}
                  <RetrievableChunks chunks={aeo.retrievable_chunks} />

                  {/* 5. Citation Potential */}
                  <CitationPotential data={insights.citation_potential} />

                  {/* 6. Authority Signals */}
                  <AuthoritySignals score={insights.authority} />

                  {/* 7. Readability & SEO (Lowest Priority) */}
                  <ReadabilitySeo
                    readability={readability}
                    seo={seo}
                    stats={stats}
                    onHighlightText={onHighlightText}
                  />
                </div>
              ) : (
                // FALLBACK / EMPTY STATE (Before first analysis)
                <div className="text-center py-12 text-gray-500">
                  <Book className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium">No insights yet</p>
                  <p className="text-xs max-w-[200px] mx-auto mt-1 text-gray-400">
                    Click "Analyze" to trigger live AEO, entity gap, and
                    competitor benchmarking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent
          value="outline"
          className="flex-1 overflow-y-auto h-[calc(100vh-160px)] no-scrollbar px-4 pb-4"
        >
          <div className="space-y-4">
            {!outlineData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black font-poppins">
                    Generate Outline
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Topic
                    </label>
                    <Input
                      value={outlineTopic}
                      onChange={(e) => setOutlineTopic(e.target.value)}
                      placeholder="Enter topic for outline..."
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateOutline}
                    disabled={generateOutline.isPending || !outlineTopic.trim()}
                    className="w-full bg-[#104127] text-white hover:bg-[#0d3320]"
                  >
                    {generateOutline.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Outline"
                    )}
                  </Button>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg text-sm text-gray-600">
                  <p className="font-medium mb-2">No outline available</p>
                  <p>
                    {savedResult
                      ? "This article doesn't have an associated outline."
                      : "Generate an outline to help structure your article content."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header with Edit Button */}
                <div className="flex justify-between items-center">
                  <h3 className="font-poppins text-base font-semibold text-gray-900">
                    Outline
                  </h3>
                  {(savedResult?.id || generatedOutline?.id) && (
                    <Link
                      href={`/outline-generation/${
                        savedResult?.id || generatedOutline?.id
                      }`}
                    >
                      <Button
                        size="sm"
                        className="text-xs bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none"
                      >
                        Edit Outline
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Compact Metrics */}
                <div className="bg-primary/5 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Est. Words
                    </span>
                    <span className="text-sm font-bold text-[#104127]">
                      {outlineData.estimated_word_count?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>

                  {outlineData.target_keywords &&
                    outlineData.target_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {outlineData.target_keywords.map(
                          (keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-primary/5 rounded-sm text-primary px-2 py-0.5 rounded text-xs font-medium border border-green-100"
                            >
                              {keyword}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </div>

                {/* Sections with Key Points */}
                <div className="space-y-3">
                  <h4 className="font-poppins text-sm font-semibold text-gray-900">
                    Outline Structure
                  </h4>

                  <div className="space-y-2">
                    {/* Introduction */}
                    {outlineData.introduction && (
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            Introduction
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 pl-3.5">
                          {outlineData.introduction}
                        </p>
                      </div>
                    )}

                    {/* Sections */}
                    {outlineData.sections?.map((section: any, idx: number) => (
                      <div key={idx} className="bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-gray-400 text-xs mt-0.5">
                            {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-semibold text-gray-900">
                                {section.heading}
                              </h5>
                              {section.citations &&
                                section.citations.length > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-help border border-blue-100/50">
                                          <Book size={10} />
                                          <span>
                                            {section.citations.length}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-3">
                                        <p className="font-semibold mb-1 text-xs">
                                          Sources:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {section.citations.map(
                                            (c: any, i: number) => (
                                              <li
                                                key={i}
                                                className="text-xs truncate"
                                              >
                                                <a
                                                  href={c.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="hover:underline"
                                                >
                                                  {c.title}
                                                </a>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                            </div>
                            {section.key_points &&
                              section.key_points.length > 0 && (
                                <ul className="space-y-1 pl-2">
                                  {section.key_points.map(
                                    (point: string, pIdx: number) => (
                                      <li
                                        key={pIdx}
                                        className="flex items-start gap-1.5"
                                      >
                                        <span className="text-green-600 text-xs mt-0.5">
                                          •
                                        </span>
                                        <span className="text-xs text-gray-600 flex-1">
                                          {point}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Conclusion */}
                    {outlineData.conclusion && (
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            Conclusion
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 pl-3.5">
                          {outlineData.conclusion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Smart Links Tab */}
        <TabsContent
          value="smart_links"
          className="flex-1 overflow-y-auto h-[calc(100vh-160px)] no-scrollbar px-4 pb-4"
        >
          {articleId && blogId && onApplyLink && onRemoveLink ? (
            <SmartLinkingPanel
              articleId={articleId}
              blogId={blogId}
              onApplyLink={onApplyLink}
              onRemoveLink={onRemoveLink}
              onHighlightText={onHighlightText}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Please save the article to use Smart Links.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsPanel;
