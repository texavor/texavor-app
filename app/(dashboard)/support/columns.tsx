"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ViewTicketDialog } from "./ViewTicketDialog";

export type Ticket = {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  status: "open" | "in_progress" | "closed";
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatStatus = (status: string) => {
  return status.split("_").map(capitalize).join(" ");
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const variant = {
        low: "default",
        medium: "secondary",
        high: "destructive",
        critical: "destructive",
      }[priority];

      return <Badge variant={variant as any}>{capitalize(priority)}</Badge>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        open: "default",
        in_progress: "secondary",
        closed: "outline",
      }[status];

      return <Badge variant={variant as any}>{formatStatus(status)}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      const [viewOpen, setViewOpen] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ticket.id)}
              >
                Copy ticket ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                View ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ViewTicketDialog
            open={viewOpen}
            onOpenChange={setViewOpen}
            ticket={ticket}
          />
        </>
      );
    },
  },
];
