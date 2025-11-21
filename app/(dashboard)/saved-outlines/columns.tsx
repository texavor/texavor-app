"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OutlineData } from "../outline-generation/hooks/useOutlineApi";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const columns: ColumnDef<OutlineData>[] = [
  {
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-gray-900">
          {row.original.topic || "Untitled Outline"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <span className="text-gray-500">
          {row.original.created_at
            ? format(new Date(row.original.created_at), "MMM dd, yyyy")
            : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "estimated_word_count",
    header: "Est. Words",
    cell: ({ row }) => {
      return (
        <span className="text-gray-500">
          {row.original.estimated_word_count?.toLocaleString() || "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              meta?.onDelete(row.original.id);
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
