"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";

const InsightsPanel = ({
  showMetrics,
  toggleMetricsVisibility,
  isAnalyzing,
  onAnalyzeClick,
  insights, // backend result object
}: any) => {
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

  return (
    <div className="bg-white max-h-[calc(100vh-100px)] p-4 rounded-xl overflow-y-auto no-scrollbar space-y-6">
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

        {/* SEO Details (formerly Keyword Optimization) */}
        <div>
          <p className="text-sm font-semibold text-black font-poppins mb-2">
            SEO Details
          </p>
          <div className="bg-gray-100 p-2 rounded-md space-y-1 text-sm font-inter">
            <p>Title Keyword: {seo_details?.title_keyword ? "✔" : "✖"}</p>
            <p>Header Variants: {seo_details?.header_variants ? "✔" : "✖"}</p>
            <p>Semantic Matches: {seo_details?.semantic_matches ? "✔" : "✖"}</p>
            <p>Coverage: {seo_details?.coverage ? "✔" : "✖"}</p>
          </div>
        </div>

        {/* SEO Score (formerly Topical Coverage) */}
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

      {/* Grammar Suggestions (formerly Issues/Suggestions) */}
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
  );
};

export default InsightsPanel;
