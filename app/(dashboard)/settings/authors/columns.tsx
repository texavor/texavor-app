"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Author } from "@/lib/api/authors";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useState } from "react";

export const getColumns = (
  onEdit: (author: Author) => void,
  onDelete: (author: Author) => void
): ColumnDef<Author>[] => [
  {
    accessorKey: "name",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-gray-100">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-gray-50 text-gray-600 font-medium">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-900 font-poppins">
            {author.name}
          </span>
        </div>
      );
    },
    meta: {
      width: "30%",
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const author = row.original;
      const isOwner = author.role === "owner";
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={isOwner ? "default" : "secondary"}
            className="capitalize font-normal px-2 py-0.5 h-5 text-xs"
          >
            {author.role}
          </Badge>
          {author.external_platform && (
            <Badge
              variant="outline"
              className="capitalize font-normal px-2 py-0.5 h-5 text-xs text-muted-foreground bg-gray-50"
            >
              {author.external_platform}
            </Badge>
          )}
        </div>
      );
    },
    meta: {
      width: "20%",
    },
  },
  {
    accessorKey: "bio",
    header: "Bio",
    cell: ({ row }) => {
      return (
        <p className="text-sm text-gray-500 truncate font-inter">
          {row.original.bio || "-"}
        </p>
      );
    },
    meta: {
      width: "40%",
      truncate: true,
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const author = row.original;
      const isOwner = author.role === "owner";
      const [open, setOpen] = useState(false);

      const actions = [
        {
          id: "edit",
          name: "Edit Author",
          icon: <Edit className="w-4 h-4 mr-2" />,
          action: () => onEdit(author),
        },
        !isOwner
          ? {
              id: "delete",
              name: "Delete Author",
              icon: <Trash2 className="w-4 h-4 mr-2 text-red-500" />,
              className: "text-red-500 hover:text-red-600 hover:bg-red-50",
              action: () => onDelete(author),
            }
          : null,
      ].filter(Boolean);

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
