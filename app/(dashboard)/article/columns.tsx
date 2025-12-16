"use client";
import { axiosInstance } from "@/lib/axiosInstace";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStatusColor } from "@/lib/constants";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
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
  source?: string;
  blog_id: string;
}

import { Column, ColumnDef } from "@tanstack/react-table";

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

// Fix type definition to be compatible with CustomTable
export const columns: ColumnDef<Article, any>[] = [
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
      <div className="flex w-full justify-center">
        <SortableHeader column={column}>Status</SortableHeader>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColor = getStatusColor(status);

      return (
        <div className="flex w-full justify-center">
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
      const queryClient = useQueryClient();
      const isFetched = article.source === "fetched";

      const handleDelete = async () => {
        try {
          await axiosInstance.delete(
            `/api/v1/blogs/${article.blog_id}/articles/${article.id}`
          );
          toast.success("Article deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["articles"] });
        } catch (error) {
          // Error handled by axiosInstance interceptor usually, but safe to log
          console.error("Delete failed", error);
        }
      };

      const actions = [];

      // View Live Article - Only if published + has URL
      if (article.status === "published" && article.url) {
        actions.push({
          id: "view_live",
          name: "View Live Article",
          icon: <ExternalLink className="h-4 w-4 text-gray-500" />,
          action: () => window.open(article.url, "_blank"),
        });
      }

      // Edit - Only for internal articles
      if (!isFetched) {
        actions.push({
          id: "edit",
          name: "Edit Article",
          icon: <Pencil className="h-4 w-4 text-gray-500" />,
          action: () => (window.location.href = `/article/${article.id}`),
        });
      }

      // Delete (Always available)
      actions.push({
        id: "delete",
        name: "Delete",
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
        action: handleDelete,
      });

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
