import React from "react";
import {
  Target,
  LayoutTemplate,
  Sparkles,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ArticleNode {
  type: string;
  title: string;
  slug?: string;
  description: string;
  primary_keyword?: string;
  search_intent?: string;
  funnel_stage?: string;
  format?: string;
  experience_hook?: string;
  content_outline?: string[];
  relevance_score: number;
  search_volume?: number;
  keyword_difficulty?: number;
  internal_links?: string[];
}

export function ArticleCard({
  article,
  index,
}: {
  article: ArticleNode;
  index?: number;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border-none shadow-none font-inter">
      {/* Type label + Title */}
      <div className="flex items-start gap-3 mb-2">
        {index && (
          <span className="shrink-0 w-6 h-6 rounded bg-gray-200 text-gray-600 flex items-center justify-center text-[11px] font-bold mt-0.5">
            {index}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Article
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug font-poppins">
            {article.title}
          </h3>
        </div>
      </div>

      {article.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 ml-9">
          {article.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-3 ml-9">
        {article.funnel_stage && (
          <Badge
            variant="secondary"
            className="bg-[#104127]/10 text-[#104127] hover:bg-[#104127]/20 border-none shadow-none text-[11px] px-2 py-0.5"
          >
            <Target className="w-3 h-3 mr-1" />
            {article.funnel_stage}
          </Badge>
        )}
        {article.format && (
          <Badge
            variant="secondary"
            className="border-none shadow-none text-[11px] px-2 py-0.5"
            style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
          >
            <LayoutTemplate className="w-3 h-3 mr-1" />
            {article.format}
          </Badge>
        )}
        {article.primary_keyword && (
          <Badge
            variant="secondary"
            className="border-none shadow-none text-[11px] px-2 py-0.5"
            style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
          >
            {article.primary_keyword}
          </Badge>
        )}
        {article.search_volume && (
          <Badge
            variant="secondary"
            className="border-none shadow-none text-[11px] px-2 py-0.5"
            style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
          >
            Vol: {article.search_volume.toLocaleString()}
          </Badge>
        )}
        {article.keyword_difficulty && (
          <Badge
            variant="secondary"
            className="border-none shadow-none text-[11px] px-2 py-0.5"
            style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
          >
            KD: {article.keyword_difficulty}
          </Badge>
        )}
      </div>

      {/* E-E-A-T Hook */}
      {article.experience_hook && (
        <div className="bg-[#104127]/5 rounded-md px-3 py-2 text-xs text-gray-700 leading-relaxed mb-3 ml-9">
          <span className="font-semibold text-[#104127] mr-1 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> E-E-A-T:
          </span>
          {article.experience_hook}
        </div>
      )}

      {/* Content Outline */}
      {article.content_outline && article.content_outline.length > 0 && (
        <div className="mb-3 ml-9">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Suggested H2s
          </p>
          <ul className="space-y-1 text-xs text-gray-600">
            {article.content_outline.map((heading, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-gray-300 mt-0.5">•</span>
                {heading}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Internal Links */}
      {article.internal_links && article.internal_links.length > 0 && (
        <div className="ml-9">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 inline-flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Internal Links
          </p>
          <div className="flex flex-wrap gap-1.5">
            {article.internal_links.map((linkTitle, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border-none"
                style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
              >
                {linkTitle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
