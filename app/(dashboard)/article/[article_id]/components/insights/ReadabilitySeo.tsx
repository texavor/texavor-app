import React, { useState } from "react";
import { ReadabilityData, SeoData, StatsData } from "./types";
import { ChevronDown, ChevronUp, Sliders } from "lucide-react";

interface ReadabilitySeoProps {
  readability: ReadabilityData;
  seo: SeoData;
  stats: StatsData;
  onHighlightText?: (text: string) => void;
}

// Helper to strip markdown (duplicated from InsightsPanel for self-containment)
const cleanText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[*_]/g, "")
    .replace(/`/g, "")
    .replace(/#/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
};

const ReadabilityIssue = ({
  issue,
  onHighlightText,
}: {
  issue: any;
  onHighlightText?: (text: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const examples = issue.examples || [];
  const displayExamples = isExpanded ? examples : examples.slice(0, 3);
  const remaining = examples.length - 3;

  return (
    <div className="bg-white/40 p-2 rounded">
      <p className="text-xs text-gray-700 font-medium mb-1">{issue.message}</p>
      {examples.length > 0 && (
        <div className="pl-2 border-l-2 border-red-200 space-y-1">
          {displayExamples.map((ex: string, i: number) => (
            <p
              key={i}
              className="text-[10px] text-gray-500 italic cursor-pointer hover:text-blue-500 truncate"
              onClick={() => onHighlightText?.(cleanText(ex))}
              title="Click to highlight"
            >
              "{cleanText(ex)}"
            </p>
          ))}
          {!isExpanded && remaining > 0 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[10px] font-bold text-blue-600 hover:underline mt-1"
            >
              + {remaining} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const ReadabilitySeo = ({
  readability,
  seo,
  stats,
  onHighlightText,
}: ReadabilitySeoProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 border-t border-gray-200/50 pt-4 mt-6">
      <div
        className="flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sliders className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          More Diagnostics
        </span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </div>

      {isOpen && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Readability Section */}
          <div className="bg-primary/5 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-bold text-gray-900">Readability</h5>
              <span
                className={`text-lg font-bold ${
                  (readability?.score || 0) >= 80
                    ? "text-green-600"
                    : (readability?.score || 0) >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {readability?.score || 0}
              </span>
            </div>

            {readability?.issues?.length > 0 ? (
              <div className="space-y-2">
                {readability.issues.map((issue, idx) => (
                  <ReadabilityIssue
                    key={idx}
                    issue={issue}
                    onHighlightText={onHighlightText}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No readability issues detected.
              </p>
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-primary/5 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-bold text-gray-900">SEO Score</h5>
              <span
                className={`text-lg font-bold ${
                  (seo?.score || 0) >= 80
                    ? "text-green-600"
                    : (seo?.score || 0) >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {seo?.score || 0}
              </span>
            </div>
            {seo?.issues?.length > 0 ? (
              <ul className="space-y-1">
                {seo.issues.map((issue, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-red-500 mt-0.5">•</span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">SEO checks passed.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
