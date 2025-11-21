"use client";

import { getStatusColor } from "@/lib/constants";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useState } from "react";
import { format } from "date-fns";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    width?: string;
    truncate?: boolean;
  }
}

export interface Article {
  id: string;
  title: string;
  categories: string[];
  created_at: string;
  url: string;
  status: string;
}

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<Article, unknown>;
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

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <SortableHeader column={column}>Title</SortableHeader>
    ),
    meta: {
      width: "30%",
      truncate: true,
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as string[];
      return (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 2).map((category) => (
            <Badge
              key={category}
              variant="secondary"
              style={{
                backgroundColor: "#F4F4F4",
                color: "#555555",
              }}
              className="capitalize"
            >
              {category}
            </Badge>
          ))}
        </div>
      );
    },
    meta: {
      width: "20%",
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColor = getStatusColor(status);

      return (
        <div
          className="capitalize px-3 py-1 rounded-full text-xs font-medium w-fit flex items-center gap-2"
          style={{
            backgroundColor: statusColor.bg,
            color: statusColor.text,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColor.text }}
          />
          {status}
        </div>
      );
    },
    meta: {
      width: "20%",
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <SortableHeader column={column}>Published At</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{format(date, "dd MMM yyyy")}</div>;
    },
    meta: {
      width: "20%",
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const article = row.original;
      const [open, setOpen] = useState(false);

      const actions = [
        {
          id: "view_article",
          name: "View Article",
          action: () => window.open(article?.url, "_blank"),
        },
        {
          id: "view",
          name: "View article",
          action: () => console.log("View article"),
        },
        {
          id: "details",
          name: "View article details",
          action: () => console.log("View article details"),
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
    meta: {
      width: "10%",
    },
  },
];
