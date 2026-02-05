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
  onApplyLink?: (anchorText: string, url: string) => void;
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

  return (
    <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
      <img
        src={href}
        alt={payload.value}
        className="w-full h-full rounded-md object-cover m-1"
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
    <div className="h-[200px] w-full -ml-6">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
    readability = 0,
    seo_details = {},
    seo_score = 0,
    authority = 0,
    grammar = {},
    stats = {},
    plagiarism = 0,
    sentiment = 0,
  } = insights || {};

  const { suggestions = [] } = grammar;

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
                  <p className="font-bold text-white">{liveStats.wordCount}</p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Reading Time
                  </p>
                  <p className="font-bold text-white">
                    {liveStats.readingTime}m
                  </p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Headings
                  </p>
                  <p className="font-bold text-white">
                    {liveStats.headingCount}
                  </p>
                </div>
                <div className="bg-[#104127] p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-200 uppercase tracking-wide">
                    Paragraphs
                  </p>
                  <p className="font-bold text-white">
                    {liveStats.paragraphCount}
                  </p>
                </div>
              </div>

              {insights?.insight_data ? (
                // NEW STRUCTURE
                <div className="space-y-4">
                  {/* AEO Section */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base">
                        AEO Analysis
                      </h4>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (insights.insight_data.aeo?.score || 0) >= 80
                            ? "text-green-600"
                            : (insights.insight_data.aeo?.score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {insights.insight_data.aeo?.score || 0}
                      </span>
                    </div>
                    {insights.insight_data.aeo?.platform_scores && (
                      <PlatformRadarChart
                        platformScores={
                          insights.insight_data.aeo.platform_scores
                        }
                      />
                    )}
                    <div className="space-y-3">
                      {insights.insight_data.aeo?.issues?.length > 0 ? (
                        insights.insight_data.aeo.issues.map(
                          (issue: any, i: number) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500 shrink-0" />
                              <p className="text-sm text-gray-600 leading-relaxed font-inter">
                                {issue.message}
                              </p>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>No critical AEO issues found.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base">
                        SEO Analysis
                      </h4>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (insights.insight_data.seo?.score || 0) >= 80
                            ? "text-green-600"
                            : (insights.insight_data.seo?.score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {insights.insight_data.seo?.score || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {insights.insight_data.seo?.issues?.length > 0 ? (
                        insights.insight_data.seo.issues.map(
                          (issue: any, i: number) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500 shrink-0" />
                              <p className="text-sm text-gray-600 leading-relaxed font-inter">
                                {issue.message}
                              </p>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>No critical SEO issues found.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Readability Section */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base">
                        Readability
                      </h4>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (insights.insight_data.readability?.score || 0) >= 80
                            ? "text-green-600"
                            : (insights.insight_data.readability?.score || 0) >=
                                50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {insights.insight_data.readability?.score || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {insights.insight_data.readability?.issues?.length > 0 ? (
                        insights.insight_data.readability.issues.map(
                          (issue: any, i: number) => (
                            <div
                              key={i}
                              className="bg-white rounded-lg p-3 space-y-2"
                            >
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${
                                      (insights.insight_data.readability
                                        ?.score || 0) >= 80
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
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

                                {issue.examples &&
                                  issue.examples.length > 0 && (
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
                                                  onHighlightText?.(
                                                    cleanExample,
                                                  )
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
                          ),
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>Text is easy to read.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grammar Section */}
                  <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                      <h4 className="font-bold text-gray-900 font-poppins text-base">
                        Grammar
                      </h4>
                      <span
                        className={`text-2xl font-poppins font-bold ${
                          (insights.grammar?.score ?? 100) >= 90
                            ? "text-green-600"
                            : (insights.grammar?.score ?? 100) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {insights.grammar?.score || 100}
                      </span>
                    </div>
                    <div>
                      {insights.grammar?.issues?.length > 0 ? (
                        <div className="space-y-3">
                          {insights.grammar.issues.map(
                            (issue: any, i: number) => {
                              // Backward compatibility
                              if (typeof issue === "string") {
                                return (
                                  <div
                                    key={i}
                                    className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm flex gap-3 items-start"
                                  >
                                    <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500 shrink-0" />
                                    <span className="flex-1 text-sm text-gray-600 font-inter leading-relaxed">
                                      {issue}
                                    </span>
                                  </div>
                                );
                              }

                              const severityColor =
                                issue.severity === "error"
                                  ? "text-red-700 bg-red-50 border-red-200"
                                  : issue.severity === "warning"
                                    ? "text-amber-700 bg-amber-50 border-amber-200"
                                    : "text-blue-700 bg-blue-50 border-blue-200";

                              return (
                                <div
                                  key={i}
                                  className="bg-white rounded-lg p-3 space-y-3"
                                >
                                  {/* Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityColor}`}
                                      >
                                        {issue.severity || "Info"}
                                      </span>
                                      <span className="text-xs font-semibold text-gray-900 capitalize font-inter">
                                        {issue.type?.replace(/_/g, " ") ||
                                          "Issue"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-800 font-medium font-inter">
                                      {issue.message}
                                    </p>

                                    {/* Context with Highlight Action */}
                                    {issue.context && (
                                      <div className="group relative">
                                        <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-xs font-mono text-gray-600 flex justify-between items-center transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                                          <span className="truncate pr-8">
                                            "{issue.context}"
                                          </span>
                                          <button
                                            onClick={() =>
                                              onHighlightText?.(
                                                cleanText(issue.context),
                                              )
                                            }
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-md shadow-sm"
                                            title="Highlight in editor"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <circle cx="11" cy="11" r="8" />
                                              <path d="m21 21-4.3-4.3" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Suggestion */}
                                    {issue.suggestion && (
                                      <div className="flex gap-2 items-start bg-green-50 p-2.5 rounded-md border border-green-100">
                                        <div className="mt-0.5 text-green-600 shrink-0">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M20 6 9 17l-5-5" />
                                          </svg>
                                        </div>
                                        <div className="text-xs">
                                          <span className="font-bold text-green-700 mr-1">
                                            Suggestion:
                                          </span>
                                          <span className="text-green-800 italic">
                                            {issue.suggestion}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                          <span>No grammar issues found.</span>
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
                    Click "Analyze" to generate AEO, SEO, and Readability
                    scores.
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
                              className="bg-[#104127] rounded-sm text-white px-2 py-0.5 rounded text-xs font-medium border border-green-100"
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
