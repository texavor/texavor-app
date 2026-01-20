import React from "react";
import { ResearchBrief } from "../hooks/useOutlineApi";
import {
  AlertCircle,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResearchBriefPanelProps {
  data: ResearchBrief;
}

export const ResearchBriefPanel: React.FC<ResearchBriefPanelProps> = ({
  data,
}) => {
  if (!data) return null;

  return (
    <div className="h-full flex flex-col gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-poppins font-semibold text-gray-900 text-sm">
            Research Brief
          </h3>
          <p className="text-xs text-gray-500 font-inter">
            Insights from top competitors
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-6">
          {/* Market Gaps */}
          {data.market_gaps && data.market_gaps.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Lightbulb className="w-3 h-3" /> Market Gaps
              </h4>
              <div className="space-y-2">
                {data.market_gaps.map((gap, i) => (
                  <div
                    key={i}
                    className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs font-medium text-orange-800 leading-relaxed"
                  >
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Statistics */}
          {data.key_statistics && data.key_statistics.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <BarChart3 className="w-3 h-3" /> Key Stats
              </h4>
              <div className="grid gap-2">
                {data.key_statistics.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm"
                  >
                    <p className="text-sm font-bold text-gray-800 font-poppins">
                      {stat}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Questions */}
          {data.common_questions && data.common_questions.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" /> Common Questions
              </h4>
              <ul className="space-y-2">
                {data.common_questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100"
                  >
                    <span className="text-blue-500 font-bold">?</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {data.sources && data.sources.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <LinkIcon className="w-3 h-3" /> Sources
              </h4>
              <div className="space-y-2">
                {data.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm p-3 rounded-lg transition-all"
                  >
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 truncate mb-1">
                      {source.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {source.url}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
