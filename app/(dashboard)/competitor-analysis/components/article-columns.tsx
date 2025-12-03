"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Article } from "@/lib/api/competitors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const articleColumns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: "Article Title",
    cell: ({ row }) => {
      const article = row.original;
      return (
        <div className="flex flex-col gap-1 max-w-[300px]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline text-primary flex items-center gap-1 truncate"
            title={article.title}
          >
            {article.title}
            <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[400px] text-sm text-muted-foreground truncate"
          title={row.getValue("summary")}
        >
          {row.getValue("summary")}
        </div>
      );
    },
  },
  {
    accessorKey: "published_at",
    header: "Published Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("published_at"));
      return (
        <div className="text-sm whitespace-nowrap">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as string[];
      const displayCategories = categories.slice(0, 3);
      const remaining = categories.length - 3;

      return (
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {displayCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-[10px]">
              {cat}
            </Badge>
          ))}
          {remaining > 0 && (
            <Badge variant="outline" className="text-[10px]">
              +{remaining}
            </Badge>
          )}
        </div>
      );
    },
  },
];
