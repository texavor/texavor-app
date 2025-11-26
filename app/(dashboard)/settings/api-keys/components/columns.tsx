"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ApiKey } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ColumnsProps {
  onRevoke: (id: number) => void;
}

export const getColumns = ({ onRevoke }: ColumnsProps): ColumnDef<ApiKey>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "key_digest",
    header: "Key Digest",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gray-600">
        {row.getValue("key_digest")}
      </span>
    ),
  },
  {
    accessorKey: "last_used_at",
    header: "Last Used",
    cell: ({ row }) => {
      const lastUsed = row.getValue("last_used_at") as string | null;
      return (
        <span className="text-sm text-gray-600">
          {lastUsed
            ? formatDistanceToNow(new Date(lastUsed), { addSuffix: true })
            : "Never"}
        </span>
      );
    },
  },
  {
    accessorKey: "expires_at",
    header: "Expires",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expires_at") as string | null;
      return (
        <span className="text-sm text-gray-600">
          {expiresAt ? new Date(expiresAt).toLocaleDateString() : "Never"}
        </span>
      );
    },
  },
  {
    accessorKey: "expired",
    header: "Status",
    cell: ({ row }) => {
      const expired = row.getValue("expired") as boolean;
      return expired ? (
        <Badge variant="destructive">Expired</Badge>
      ) : (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Active
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const apiKey = row.original;
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Revoke
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke the API key "{apiKey.name}"?
                This action cannot be undone and any applications using this key
                will stop working.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRevoke(apiKey.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Revoke Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
