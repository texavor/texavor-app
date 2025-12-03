"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useState } from "react";
import { format } from "date-fns";
import { Competitor } from "@/lib/api/competitors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    width?: string;
    truncate?: boolean;
  }
}

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<Competitor, unknown>;
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

export const createColumns = (
  onAnalyze: (competitorId: string) => void,
  onDelete: (competitorId: string) => void,
  analyzingIds: Set<string>
): ColumnDef<Competitor>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    cell: ({ row }) => {
      const competitor = row.original;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${competitor.website_url}&sz=128`;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg border bg-white">
            <AvatarImage
              src={faviconUrl}
              alt={competitor.name}
              className="object-contain p-1"
            />
            <AvatarFallback className="rounded-lg uppercase">
              {competitor.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{competitor.name}</div>
        </div>
      );
    },
    meta: {
      width: "25%",
      truncate: true,
    },
  },
  {
    accessorKey: "domain",
    header: "Website",
    cell: ({ row }) => {
      const competitor = row.original;
      return (
        <a
          href={competitor.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          {competitor.domain}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
    meta: {
      width: "25%",
    },
  },
  {
    accessorKey: "last_analyzed_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Last Analyzed</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = row.getValue("last_analyzed_at") as string | undefined;
      if (!date) return <div className="text-muted-foreground">Never</div>;
      return <div>{format(new Date(date), "dd MMM yyyy")}</div>;
    },
    meta: {
      width: "20%",
    },
  },
  {
    accessorKey: "articles_tracked",
    header: ({ column }) => (
      <SortableHeader column={column}>Articles</SortableHeader>
    ),
    cell: ({ row }) => {
      const count = row.getValue("articles_tracked") as number;
      return (
        <Badge variant="secondary" className="font-mono">
          {count}
        </Badge>
      );
    },
    meta: {
      width: "15%",
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const competitor = row.original;
      const [open, setOpen] = useState(false);
      const isAnalyzing = analyzingIds.has(competitor.id);

      const actions = [
        {
          id: "view_details",
          name: "View Details",
          action: () => {
            window.location.href = `/competitor-analysis/${competitor.id}`;
          },
        },
        {
          id: "analyze",
          name: isAnalyzing ? "Analyzing..." : "Run Analysis",
          action: () => {
            if (!isAnalyzing) {
              onAnalyze(competitor.id);
            }
          },
          disabled: isAnalyzing,
        },
        {
          id: "delete",
          name: "Delete",
          action: () => onDelete(competitor.id),
          className: "text-red-600 focus:text-red-600",
        },
      ];

      return (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(competitor.id);
            }}
            disabled={isAnalyzing}
            title="Trigger Analysis"
            className="h-8 w-8"
          >
            <RefreshCw
              className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
            />
          </Button>
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
              if (!option.disabled) {
                option.action();
              }
              setOpen(false);
            }}
          />
        </div>
      );
    },
    meta: {
      width: "15%",
    },
  },
];
