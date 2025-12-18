"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { CustomTable } from "@/components/ui/CustomTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, Bookmark } from "lucide-react";
import { useState } from "react";

export type KeywordData = {
  term: string;
  source?: string;
  search_volume?: number;
  cpc?: number;
  competition?: number;
  difficulty?: number;
};

interface KeywordResultsTableProps {
  data: KeywordData[];
  mode: "basic" | "detailed";
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
              className="h-8 px-2 text-xs border-[#104127] text-[#104127] hover:bg-[#EAF9F2]"
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
        <Badge variant="secondary" className="bg-[#EAF9F2] text-[#104127]">
          {row.getValue("source") || "Unknown"}
        </Badge>
      ),
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
          <Badge className={`${color} text-white hover:${color}`}>{val}</Badge>
        );
      },
    },
    actionsColumn,
  ];

  return (
    <CustomTable
      columns={mode === "basic" ? basicColumns : detailedColumns}
      data={data}
      isLoading={isLoading}
      onClick={() => {}}
      className="max-h-[calc(100vh-360px)] overflow-y-auto no-scrollbar"
    />
  );
};
