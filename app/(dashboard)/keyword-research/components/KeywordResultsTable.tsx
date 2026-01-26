"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { CustomTable } from "@/components/ui/CustomTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  Info,
  Sparkles,
  Brain,
  Bot,
  Search,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type KeywordData = {
  term: string;
  source?: string;
  search_volume?: number;
  cpc?: number;
  competition?: number;
  difficulty?: number;
  ai_visibility_score?: number;
  geo_score?: number;
  type?: "google_question" | "ai_prediction" | "prompt_seed";
};

interface KeywordResultsTableProps {
  data: KeywordData[];
  mode: "basic" | "detailed" | "prompt";
  isLoading: boolean;
  onSave?: (term: string, data: KeywordData) => void;
  onGenerateTopic?: (term: string) => void;
  savedTerms?: Set<string>;
}

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<KeywordData, unknown>;
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
  if (score === undefined || score === null)
    return <span className="text-gray-400">-</span>;

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

export const PromptTypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;

  if (type === "google_question") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none flex items-center gap-1 w-fit">
        <Search className="h-3 w-3" />
        Human Search
      </Badge>
    );
  }

  if (type === "ai_prediction") {
    return (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none shadow-none flex items-center gap-1 w-fit">
        <Sparkles className="h-3 w-3" />
        AI Prompt
      </Badge>
    );
  }

  if (type === "prompt_seed") {
    return (
      <Badge
        variant="outline"
        className="text-gray-500 border-gray-200 shadow-none"
      >
        Seed
      </Badge>
    );
  }

  return <Badge variant="secondary">{type}</Badge>;
};

export const KeywordResultsTable = ({
  data,
  mode,
  isLoading,
  onSave,
  onGenerateTopic,
  savedTerms,
}: KeywordResultsTableProps) => {
  const formatCurrency = (value?: number) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("en-US").format(value);
  };

  const actionsColumn: ColumnDef<KeywordData> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const term = row.getValue("term") as string;
      const rowData = row.original;
      const isSaved = savedTerms?.has(term);

      return (
        <div className="flex items-center gap-2">
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (!isSaved) {
                  onSave(term, rowData);
                }
              }}
              className={`h-8 w-8 transition-colors ${
                isSaved
                  ? "text-[#104127] bg-[#EAF9F2]"
                  : "text-gray-500 hover:text-[#104127] hover:bg-[#EAF9F2]"
              }`}
              title={isSaved ? "Saved" : "Save Keyword"}
              disabled={isSaved}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
              />
            </Button>
          )}
          {onGenerateTopic && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateTopic(term);
              }}
              className="h-8 px-2 text-xs border-[#104127] text-[#104127] hover:bg-[#EAF9F2] shadow-none"
              title="Generate Topic"
            >
              Generate Topic
            </Button>
          )}
        </div>
      );
    },
  };

  const basicColumns: ColumnDef<KeywordData>[] = [
    {
      accessorKey: "term",
      header: "Keyword",
      cell: ({ row }) => (
        <span className="font-medium text-[#09090B] truncate max-w-[150px]">
          {row.getValue("term")}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="bg-[#EAF9F2] text-[#104127] border-none shadow-none"
        >
          {row.getValue("source") || "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "ai_visibility_score",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <SortableHeader column={column}>
            <div className="flex items-center gap-1">
              AI Visibility
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How well this keyword targets AI Search Engines</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <AiVisibilityScore score={row.getValue("ai_visibility_score")} />
        );
      },
    },
    actionsColumn,
  ];

  const detailedColumns: ColumnDef<KeywordData>[] = [
    {
      accessorKey: "term",
      header: "Keyword",
      cell: ({ row }) => (
        <span className="font-medium text-[#09090B]">
          {row.getValue("term")}
        </span>
      ),
    },
    {
      accessorKey: "search_volume",
      header: ({ column }) => (
        <SortableHeader column={column}>Volume</SortableHeader>
      ),
      cell: ({ row }) => formatNumber(row.getValue("search_volume")),
    },
    {
      accessorKey: "cpc",
      header: ({ column }) => (
        <SortableHeader column={column}>CPC</SortableHeader>
      ),
      cell: ({ row }) => formatCurrency(row.getValue("cpc")),
    },
    {
      accessorKey: "competition",
      header: ({ column }) => (
        <SortableHeader column={column}>Competition</SortableHeader>
      ),
      cell: ({ row }) => {
        const val = row.getValue("competition") as number;
        return (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px]">
            <div
              className="bg-[#104127] h-2.5 rounded-full"
              style={{ width: `${val * 100}%` }}
            ></div>
          </div>
        );
      },
    },
    {
      accessorKey: "difficulty",
      header: ({ column }) => (
        <SortableHeader column={column}>Difficulty</SortableHeader>
      ),
      cell: ({ row }) => {
        const val = row.getValue("difficulty") as number;
        let color = "bg-green-500";
        if (val > 40) color = "bg-yellow-500";
        if (val > 70) color = "bg-red-500";

        return (
          <Badge
            className={`${color} text-white hover:${color} border-none shadow-none`}
          >
            {val}
          </Badge>
        );
      },
    },
    {
      accessorKey: "ai_visibility_score",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <SortableHeader column={column}>
            <div className="flex items-center gap-1">
              AI Visibility
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How well this keyword targets AI Search Engines</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <AiVisibilityScore score={row.getValue("ai_visibility_score")} />
        );
      },
    },
    actionsColumn,
  ];

  const promptColumns: ColumnDef<KeywordData>[] = [
    {
      accessorKey: "term",
      header: "Prompt / Question",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 py-1 max-w-[400px]">
          <span
            className="font-normal text-[#09090B] text-base truncate"
            title={row.getValue("term")}
          >
            {row.getValue("term")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <PromptTypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "ai_visibility_score",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <SortableHeader column={column}>
            <div className="flex items-center gap-1">
              AI Visibility
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How well this keyword targets AI Search Engines</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <AiVisibilityScore score={row.getValue("ai_visibility_score")} />
        );
      },
    },
    actionsColumn,
  ];

  return (
    <CustomTable
      columns={
        mode === "detailed"
          ? detailedColumns
          : mode === "prompt"
            ? promptColumns
            : basicColumns
      }
      data={data}
      isLoading={isLoading}
      onClick={() => {}}
      className="max-h-[calc(100vh-360px)] overflow-y-auto no-scrollbar"
    />
  );
};
