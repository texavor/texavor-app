"use client";

import { useRouter } from "next/navigation";
import {
  ContentGapDetail,
  KeywordOpportunityDetail,
  Recommendation,
} from "@/lib/api/competitors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({
  recommendations,
}: RecommendationsListProps) {
  const router = useRouter();

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border-none shadow-none">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No Recommendations Yet
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            We haven't generated any specific recommendations for this
            competitor yet. Try running a new analysis.
          </p>
        </div>
      </div>
    );
  }

  const contentGapRec = recommendations.find((r) => r.type === "content_gaps");
  const keywordOppRec = recommendations.find(
    (r) => r.type === "keyword_opportunities"
  );

  const handleGenerateOutline = (topic: string) => {
    router.push(`/outline-generation?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="space-y-8">
      {/* Content Gaps Section */}
      {contentGapRec && contentGapRec.details && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Content Gaps</h3>
              <p className="text-sm text-gray-500 mt-1">
                {contentGapRec.message}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-3 py-1 text-xs font-medium rounded-full ${
                contentGapRec.priority === "high"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : contentGapRec.priority === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {contentGapRec.priority} Priority
            </Badge>
          </div>

          {/* Grid Layout - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(contentGapRec.details as ContentGapDetail[]).map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border-none shadow-none space-y-3"
              >
                {/* Topic */}
                <div>
                  <h4 className="text-base font-medium text-gray-900 leading-snug">
                    {item.topic}
                  </h4>
                </div>

                {/* Example - only show if exists */}
                {item.example_article && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    Example: {item.example_article}
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* All Suggestions with individual buttons */}
                {item.suggested_titles && item.suggested_titles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Top Suggestions
                    </p>
                    <div className="space-y-2">
                      {item.suggested_titles.map((title, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                tIdx === 0
                                  ? "bg-green-500"
                                  : tIdx === 1
                                  ? "bg-orange-500"
                                  : "bg-purple-500"
                              }`}
                            />
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">
                              {title}
                            </p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleGenerateOutline(title)}
                                  size="icon"
                                  className="h-6 w-6 bg-[#104127] hover:bg-[#0d3520] text-white flex-shrink-0"
                                >
                                  <Sparkles className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate Outline</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Opportunities Section */}
      {keywordOppRec && keywordOppRec.details && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Keyword Opportunities
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {keywordOppRec.message}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-3 py-1 text-xs font-medium rounded-full ${
                keywordOppRec.priority === "high"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : keywordOppRec.priority === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {keywordOppRec.priority} Priority
            </Badge>
          </div>

          {/* Grid Layout - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(keywordOppRec.details as KeywordOpportunityDetail[]).map(
              (item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border-none shadow-none space-y-3"
                >
                  {/* Keyword */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 leading-snug">
                      {item.keyword}
                    </h4>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* All Suggestions with individual buttons */}
                  {item.suggested_titles && item.suggested_titles.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Top Suggestions
                      </p>
                      <div className="space-y-2">
                        {item.suggested_titles.map((title, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <div
                                className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                  tIdx === 0
                                    ? "bg-blue-500"
                                    : tIdx === 1
                                    ? "bg-cyan-500"
                                    : "bg-indigo-500"
                                }`}
                              />
                              <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                {title}
                              </p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => handleGenerateOutline(title)}
                                    size="icon"
                                    className="h-6 w-6 bg-[#104127] hover:bg-[#0d3520] text-white flex-shrink-0"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Generate Outline</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
