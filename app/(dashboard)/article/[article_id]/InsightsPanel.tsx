"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  useOutlineApi,
  OutlineData,
} from "../../outline-generation/hooks/useOutlineApi";

interface InsightsPanelProps {
  showMetrics: boolean;
  toggleMetricsVisibility: () => void;
  isAnalyzing: boolean;
  onAnalyzeClick: () => void;
  insights: any;
  savedResult?: any;
  articleTitle?: string;
  articleId?: string;
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
}: InsightsPanelProps) => {
  const [outlineTopic, setOutlineTopic] = useState(articleTitle || "");
  const { generateOutline } = useOutlineApi();
  const [generatedOutline, setGeneratedOutline] = useState<OutlineData | null>(
    null
  );

  // Update topic when article title changes
  React.useEffect(() => {
    if (articleTitle && !outlineTopic) {
      setOutlineTopic(articleTitle);
    }
  }, [articleTitle]);

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
      },
      {
        onSuccess: (data: OutlineData) => {
          setGeneratedOutline(data);
        },
      }
    );
  };

  return (
    <div className="bg-white max-h-[calc(100vh-100px)] rounded-xl flex flex-col">
      <Tabs defaultValue="insights" className="w-full flex flex-col h-full">
        <div className="sticky top-0 bg-white z-10 p-4 pb-2 rounded-t-xl">
          <TabsList className="w-full">
            <TabsTrigger value="insights" className="flex-1">
              Content Insights
            </TabsTrigger>
            <TabsTrigger value="outline" className="flex-1">
              Outline
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Insights Tab */}
        <TabsContent
          value="insights"
          className="flex-1 overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar px-4 pb-4"
        >
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Top Section — Content Insights */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black font-poppins">
                  Content Insights
                </h3>
                <Button
                  onClick={onAnalyzeClick}
                  disabled={isAnalyzing}
                  className="text-sm"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Article"}
                </Button>
              </div>

              {/* Readability Score */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-black font-poppins">
                    Readability Score
                  </p>
                  <p className="text-sm font-inter">{readability}/10</p>
                </div>
                <ScoreMeter value={readability / 10} />
              </div>

              {/* SEO Details */}
              <div>
                <p className="text-sm font-semibold text-black font-poppins mb-2">
                  SEO Details
                </p>
                <div className="bg-gray-100 p-2 rounded-md space-y-1 text-sm font-inter">
                  <p>Title Keyword: {seo_details?.title_keyword ? "✔" : "✖"}</p>
                  <p>
                    Header Variants: {seo_details?.header_variants ? "✔" : "✖"}
                  </p>
                  <p>
                    Semantic Matches:{" "}
                    {seo_details?.semantic_matches ? "✔" : "✖"}
                  </p>
                  <p>Coverage: {seo_details?.coverage ? "✔" : "✖"}</p>
                </div>
              </div>

              {/* SEO Score */}
              <div>
                <Gauge label="SEO Score" value={seo_score} max={100} />
              </div>

              {/* Authority Score */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-black font-poppins">
                    Authority Score
                  </p>
                  <p className="text-sm font-inter">{authority}/100</p>
                </div>
                <ScoreMeter value={authority / 100} />
              </div>

              {/* Plagiarism Score */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-black font-poppins">
                    Plagiarism Score
                  </p>
                  <p className="text-sm font-inter">{plagiarism}/100</p>
                </div>
                <ScoreMeter value={plagiarism / 100} />
              </div>

              {/* Sentiment Score */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-black font-poppins">
                    Sentiment Score
                  </p>
                  <p className="text-sm font-inter">{sentiment}/1000</p>
                </div>
                <ScoreMeter value={sentiment / 1000} />
              </div>
            </div>

            {/* Grammar Suggestions */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black capitalize font-poppins">
                Grammar Suggestions
              </h3>
              {suggestions.length === 0 ? (
                <p className="text-sm italic text-gray-500">
                  No suggestions detected.
                </p>
              ) : (
                <ul className="list-disc list-inside bg-gray-100 p-3 rounded-md text-sm font-inter space-y-1">
                  {suggestions.map((suggestion: any, idx: number) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-lg font-bold text-black capitalize font-poppins mb-2">
                Quick Stats
              </h3>

              <div className="space-y-1 bg-gray-100 p-3 rounded-md text-sm font-inter">
                <p>Word Count: {stats.word_count || 0}</p>
                <p>Reading Time: {stats.reading_time || 0} min</p>
                <p>Headings: {stats.headings_count || 0}</p>
                <p>Paragraphs: {stats.paragraphs_count || 0}</p>
                <p>Keyword Count: {stats.keyword_count || 0}</p>
                <p>Difficulty: {stats.difficulty || 0}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent
          value="outline"
          className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 min-h-[calc(100vh-160px)] max-h-[calc(100vh-160px)]"
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

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
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
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
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
                              className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium border border-green-100"
                            >
                              {keyword}
                            </span>
                          )
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
                      <div className="bg-gray-50 p-3 rounded-lg">
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
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-gray-400 text-xs mt-0.5">
                            {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <h5 className="text-sm font-semibold text-gray-900 mb-1">
                              {section.heading}
                            </h5>
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
                                    )
                                  )}
                                </ul>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Conclusion */}
                    {outlineData.conclusion && (
                      <div className="bg-gray-50 p-3 rounded-lg">
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
      </Tabs>
    </div>
  );
};

export default InsightsPanel;
