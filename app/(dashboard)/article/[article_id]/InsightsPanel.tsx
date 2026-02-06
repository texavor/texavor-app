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

// Helper to strip markdown
const cleanText = (text: string) => {
  if (!text) return "";
  return (
    text
      // Remove bold/italic markers (* or _)
      .replace(/[*_]/g, "")
      // Remove code ticks (`)
      .replace(/`/g, "")
      // Remove heading hashes (#)
      .replace(/#/g, "")
      // Remove link brackets but keep text: [text](url) -> text
      // This simple regex handles standard markdown links.
      // For nested or complex links, it might be partial, but sufficient for readability snippets.
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove stand-alone brackets if any remain
  );
};

const CustomTick = ({ payload, x, y, cx, cy, ...rest }: any) => {
  const images: Record<string, string> = {
    Gemini: "/ai/gemini.jpg",
    Perplexity: "/ai/perplexity.png",
    ChatGPT: "/ai/chatgpt.png",
  };

  const href = images[payload.value];

  if (!href) return null;

  // Calculate direction vector from center
  const dx = x - cx;
  const dy = y - cy;
  // Calculate offset position (push out by 15px)
  // We don't need full vector math because x,y are already on the circle.
  // Just adding a bit of margin based on the angle would be safer but complex.
  // Simple approximation: add constant offset in the direction of the tick
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = 15; // 15px gap
  const scale = (dist + offset) / dist;

  const finalX = cx + dx * scale;
  const finalY = cy + dy * scale;

  return (
    <foreignObject x={finalX - 12} y={finalY - 12} width={24} height={24}>
      <img
        src={href}
        alt={payload.value}
        className="w-full h-full rounded-md object-cover shadow-sm bg-white"
      />
    </foreignObject>
  );
};

const PlatformRadarChart = ({ platformScores }: { platformScores: any }) => {
  if (!platformScores) return null;

  const data = [
    {
      subject: "Gemini",
      A: platformScores.gemini || 0,
      fullMark: 100,
    },
    {
      subject: "Perplexity",
      A: platformScores.perplexity || 0,
      fullMark: 100,
    },
    {
      subject: "ChatGPT",
      A: platformScores.chatgpt || 0,
      fullMark: 100,
    },
  ];

  return (
    <div className="h-[200px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="#9ca3af" />
          <PolarAngleAxis
            dataKey="subject"
            tick={(props) => <CustomTick {...props} />}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#104127"
            fill="#104127"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SimulationCard = ({ simulation }: { simulation: any }) => {
  if (!simulation?.snippet) return null;

  return (
    <div className="bg-white border-2 border-[#104127]/10 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-[#104127]/5 px-4 py-2 border-b border-[#104127]/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#104127] animate-pulse" />
          <span className="text-[10px] font-bold text-[#104127] uppercase tracking-wider">
            AI Search Simulation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-400 leading-none">Style</span>
            <span className="text-[10px] font-bold text-[#104127]">
              {simulation.style || "AI"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-400 leading-none">
              Readiness
            </span>
            <span className="text-[10px] font-bold text-green-600">
              {simulation.aeo_readiness}%
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg p-3 relative">
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <div className="w-1 h-1 rounded-full bg-red-400" />
            <div className="w-1 h-1 rounded-full bg-yellow-400" />
            <div className="w-1 h-1 rounded-full bg-green-400" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed font-inter italic">
            "{simulation.snippet}"
          </p>
        </div>
        <p className="text-[10px] text-gray-400 mt-3 text-center italic">
          Disclaimer: This is a generated preview of how AI search engines might
          summarize this article.
        </p>
      </div>
    </div>
  );
};

const EntityGapAnalysis = ({ entityGaps }: { entityGaps: any }) => {
  if (!entityGaps?.missing || entityGaps.missing.length === 0) return null;

  return (
    <div className="bg-primary/5 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
        <h4 className="font-bold text-gray-900 font-poppins text-base">
          Topic Overlap Gaps
        </h4>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#104127] leading-none uppercase">
            Overlap Score
          </span>
          <span className="text-xl font-poppins font-bold text-yellow-600">
            {entityGaps.score}%
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-inter leading-relaxed">
        {entityGaps.message ||
          "These entities are frequently mentioned by top-ranking competitors but missing in your content."}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {entityGaps.missing.map((entity: string, i: number) => (
          <div
            key={i}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm hover:border-[#104127]/30 transition-colors"
          >
            + {entity}
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveBenchmarkList = ({ benchmarks }: { benchmarks: any[] }) => {
  if (!benchmarks || benchmarks.length === 0) return null;

  return (
    <div className="bg-primary/5 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
        <h4 className="font-bold text-gray-900 font-poppins text-base">
          Competitor Benchmark
        </h4>
      </div>
      <div className="space-y-2">
        {benchmarks.map((comp: any, i: number) => (
          <div
            key={i}
            className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm flex flex-col gap-1.5 hover:border-[#104127]/20 transition-all group"
          >
            <div className="flex justify-between items-start gap-2">
              <a
                href={comp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#104127] hover:underline flex-1 line-clamp-2"
              >
                {comp.title || "Competitor Article"}
              </a>
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase">
                {comp.type || "Page"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <p className="text-[10px] text-gray-400 truncate flex-1">
                {comp.url}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
                  {/* AI Simulation Preview - Primary Insight */}
                  <SimulationCard simulation={simulation} />

                  {/* Top Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 rounded-xl p-3 text-center border border-[#104127]/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                        SEO Score
                      </p>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (seo_score || 0) >= 80
                            ? "text-green-600"
                            : (seo_score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {seo_score || 0}
                      </span>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3 text-center border border-[#104127]/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                        AEO Readiness
                      </p>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (aeo.score || 0) >= 80
                            ? "text-green-600"
                            : (aeo.score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {aeo.score || 0}
                      </span>
                    </div>
                  </div>

                  {/* AEO Radar & Issues */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base">
                        AEO Breakdown
                      </h4>
                    </div>
                    {aeo.platform_scores && (
                      <PlatformRadarChart
                        platformScores={aeo.platform_scores}
                      />
                    )}
                    <div className="space-y-3">
                      {aeo.issues?.length > 0 ? (
                        aeo.issues.map((issue: any, i: number) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500 shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed font-inter">
                              {issue.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>No critical AEO structural issues.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entity Gaps */}
                  <EntityGapAnalysis entityGaps={entity_gaps} />

                  {/* Competitors */}
                  <LiveBenchmarkList benchmarks={live_benchmark} />

                  {/* Readability Section (Keep but at bottom) */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base text-sm opacity-70">
                        Content Readability
                      </h4>
                      <span
                        className={`text-lg font-poppins font-bold ${
                          (readability.score || 0) >= 80
                            ? "text-green-600"
                            : (readability.score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {readability.score || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {readability.issues?.length > 0 ? (
                        readability.issues.map((issue: any, i: number) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg p-3 space-y-2"
                          >
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 bg-red-500`}
                                />
                                <h5 className="text-sm font-semibold text-gray-900 font-poppins">
                                  {issue.type
                                    ? issue.type
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l: string) =>
                                          l.toUpperCase(),
                                        )
                                    : "Improvement"}
                                </h5>
                              </div>

                              <p className="text-sm text-gray-700 leading-relaxed font-inter">
                                {issue.message}
                              </p>

                              {issue.examples && issue.examples.length > 0 && (
                                <div className="bg-gray-50 border border-gray-100 rounded-md p-2 mt-1">
                                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                                    Examples found:
                                  </p>
                                  <ul className="space-y-1">
                                    {issue.examples.map(
                                      (ex: string, j: number) => {
                                        const cleanExample = cleanText(ex);
                                        return (
                                          <li
                                            key={j}
                                            className="flex items-start gap-2 group cursor-pointer hover:bg-white rounded p-1 -ml-1 transition-all"
                                            onClick={() =>
                                              onHighlightText?.(cleanExample)
                                            }
                                            title="Click to highlight in editor"
                                          >
                                            <span className="text-xs text-gray-600 italic group-hover:text-primary transition-colors">
                                              "{cleanExample}"
                                            </span>
                                          </li>
                                        );
                                      },
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>Text is easy to read.</span>
                        </div>
                      )}
                    </div>
                  </div>
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
