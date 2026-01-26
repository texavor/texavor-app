"use client";

import { CustomTable } from "@/components/ui/CustomTable";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Bookmark,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Bot,
  Sparkles,
  Brain,
  Star,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeywordDiscoveryKeyword } from "../hooks/useKeywordDiscoveryApi";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useState } from "react";
import { ColumnDef, Column } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeywordDiscoveryTableProps {
  data: KeywordDiscoveryKeyword[];
  isLoading: boolean;
  onSave: (keyword: KeywordDiscoveryKeyword) => void;
  onGenerateTopic: (keyword: string) => void;
  savedKeywords: Set<string>;
}

const getOpportunityColor = (score: number) => {
  if (score >= 70) return { bg: "#ecfdf5", text: "#15803d", label: "High" };
  if (score >= 40) return { bg: "#fefce8", text: "#a16207", label: "Medium" };
  return { bg: "#fef2f2", text: "#b91c1c", label: "Low" };
};

const getSourceColor = (source: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    semantic_similarity: { bg: "#ede9fe", text: "#6b21a8" },
    competitor: { bg: "#fef3c7", text: "#b45309" },
    ai_prediction: { bg: "#dbeafe", text: "#1e40af" },
    google_autocomplete: { bg: "#fce7f3", text: "#be123c" },
    blog_content: { bg: "#d1fae5", text: "#065f46" },
  };
  return colors[source] || { bg: "#f3f4f6", text: "#6b7280" };
};

const formatSource = (source: string) => {
  const labels: Record<string, string> = {
    semantic_similarity: "Semantic",
    competitor: "Competitor",
    ai_prediction: "AI Prediction",
    google_autocomplete: "Google",
    blog_content: "Blog Content",
  };
  return labels[source] || source;
};

// Helper to safely extract keyword string
const getKeywordTerm = (
  keyword: string | { term: string } | undefined,
): string => {
  if (!keyword) return "";
  if (typeof keyword === "string") return keyword;
  return keyword.term || "";
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<KeywordDiscoveryKeyword, unknown>;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sort = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      className="px-0 hover:bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (sort === "asc") {
          column.toggleSorting(true);
        } else if (sort === "desc") {
          column.clearSorting();
        } else {
          column.toggleSorting(false);
        }
      }}
    >
      {children}
      {sort === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sort === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown
          className={`ml-2 h-4 w-4 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </Button>
  );
};

export const AiVisibilityScore = ({ score }: { score?: number }) => {
  if (score === undefined || score === null) return null; // Don't show anything if no score

  let color = "bg-gray-100 text-gray-500";
  let icon = <Bot className="h-3.5 w-3.5" />;
  let label = "Traditional SEO";

  if (score >= 8) {
    color = "bg-green-100 text-green-700";
    icon = <Sparkles className="h-3.5 w-3.5" />;
    label = "AI Optimized";
  } else if (score >= 5) {
    color = "bg-yellow-100 text-yellow-700";
    icon = <Brain className="h-3.5 w-3.5" />;
    label = "AI Friendly";
  }

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded-full w-fit ${color}`}
    >
      {icon}
      <span className="text-xs font-semibold whitespace-nowrap">
        {label} <span className="opacity-75">({score}/10)</span>
      </span>
    </div>
  );
};

export function KeywordDiscoveryTable({
  data,
  isLoading,
  onSave,
  onGenerateTopic,
  savedKeywords,
}: KeywordDiscoveryTableProps) {
  const columns: ColumnDef<KeywordDiscoveryKeyword>[] = [
    {
      header: "Keyword",
      accessorKey: "keyword",
      cell: ({ row }) => {
        const keywordData = row.original;
        const term = getKeywordTerm(keywordData.keyword);

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 font-inter">{term}</p>
              {keywordData.competitor_using && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium text-xs">
                        Used by: {keywordData.competitor_name || "Competitor"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className="text-xs px-2 py-0.5 font-inter border-none shadow-none"
                style={{
                  backgroundColor: getSourceColor(keywordData.source).bg,
                  color: getSourceColor(keywordData.source).text,
                }}
              >
                {formatSource(keywordData.source)}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column}>Relevance</SortableHeader>
      ),
      accessorKey: "relevance_score",
      cell: ({ row }) => {
        const score = row.original.relevance_score;
        return (
          <span className="font-medium text-gray-900 font-inter">
            {(score * 100).toFixed(0)}%
          </span>
        );
      },
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column}>Authority</SortableHeader>
      ),
      accessorKey: "ai_authority_score",
      cell: ({ row }) => {
        const score = row.original.ai_authority_score || 0;
        let color = { bg: "#fef2f2", text: "#b91c1c" }; // Low (Red)
        if (score >= 70)
          color = { bg: "#ecfdf5", text: "#15803d" }; // High (Green)
        else if (score >= 40) color = { bg: "#fefce8", text: "#a16207" }; // Medium (Yellow)

        return (
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded-md text-xs font-medium font-inter"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {score}
            </div>
            {score >= 70 ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-600" />
            )}
          </div>
        );
      },
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column}>Opportunity</SortableHeader>
      ),
      accessorKey: "opportunity_score",
      cell: ({ row }) => {
        const score = row.original.opportunity_score;
        const color = getOpportunityColor(score);
        return (
          <div className="flex items-center gap-2">
            <div
              className="px-2 py-1 rounded-md text-xs font-medium font-inter"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {score}
            </div>
            <span className="text-xs text-gray-500 font-inter">
              {color.label}
            </span>
          </div>
        );
      },
    },
    {
      header: ({ column }) => (
        <SortableHeader column={column}>CPC</SortableHeader>
      ),
      accessorKey: "cpc",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 font-inter">
          ${row.original.cpc?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      accessorKey: "ai_visibility_score",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <SortableHeader column={column}>
            AI Visibility
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-black" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p>How well this keyword targets AI Search Engines</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        const keywordData = row.original;
        return <AiVisibilityScore score={keywordData?.ai_visibility_score} />;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const keywordData = row.original;
        const term = getKeywordTerm(keywordData.keyword);
        const isSaved = savedKeywords.has(term);
        const [open, setOpen] = useState(false);

        const actions = [
          {
            id: "save",
            name: isSaved ? "Saved" : "Save Keyword",
            icon: (
              <Bookmark
                className={`h-4 w-4 ${
                  isSaved ? "fill-current text-blue-600" : "text-gray-500"
                }`}
              />
            ),
            action: () => onSave(keywordData),
            disabled: isSaved,
          },
          {
            id: "generate_topic",
            name: "Generate Topic",
            icon: <Lightbulb className="h-4 w-4 text-gray-500" />,
            action: () => onGenerateTopic(term),
          },
        ];

        return (
          <CustomDropdown
            open={open}
            onOpenChange={setOpen}
            options={actions}
            trigger={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            onSelect={(option: any) => {
              option.action();
              setOpen(false);
            }}
          />
        );
      },
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      className="bg-white rounded-lg border-none shadow-none max-h-[calc(100vh-160px)]"
    />
  );
}
