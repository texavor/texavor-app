"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Author } from "@/lib/api/authors";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, CheckCircle2, Star } from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const getColumns = (
  onEdit: (author: Author) => void,
  onDelete: (author: Author) => void,
  onSetDefault: (author: Author) => void,
): ColumnDef<Author>[] => [
  {
    accessorKey: "name",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original;
      const defaults = author.platform_defaults || [];
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-gray-100">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-gray-50 text-gray-600 font-medium">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 font-poppins text-sm">
              {author.name}
            </span>
            {author.username && (
              <span className="text-[10px] text-muted-foreground">
                @{author.username}
              </span>
            )}
            {defaults.length > 0 && (
              <Badge
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 capitalize font-normal px-2 py-0.5 h-4 text-[9px] w-fit mt-1"
              >
                Default
              </Badge>
            )}
          </div>
        </div>
      );
    },
    meta: {
      width: "30%",
    },
  },
  {
    accessorKey: "external_platform",
    header: "Platform",
    cell: ({ row }) => {
      const author = row.original;

      const getPlatformLogo = (platform: string | undefined) => {
        if (!platform) return "/favicon.ico"; // Manual/EasyWrite

        const p = platform.toLowerCase();
        if (p.includes("medium")) return "/integration/medium.png";
        if (p.includes("devto") || p.includes("dev.to"))
          return "/integration/devto.png";
        if (p.includes("hashnode")) return "/integration/hashnode.png";
        if (p.includes("wordpress")) return "/integration/wordpress.png";
        if (p.includes("shopify")) return "/integration/shopify.png";
        if (p.includes("webflow")) return "/integration/webflow.png";
        if (p.includes("webhook")) return "/integration/webhook.png";

        return "/favicon.ico"; // Fallback to app logo
      };

      const logo = getPlatformLogo(author.external_platform);

      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border">
            <img
              src={logo}
              alt={author.external_platform || "Manual"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      );
    },
    meta: {
      width: "15%",
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
        </div>
      );
    },
    meta: {
      width: "10%",
    },
  },
  {
    accessorKey: "bio",
    header: "Bio",
    cell: ({ row }) => {
      const bio = row.original.bio;
      if (!bio) return <span className="text-gray-400">-</span>;

      // Simple regex to strip HTML tags for the preview
      const plainBio = bio.replace(/<[^>]*>?/gm, "");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-500 truncate font-inter max-w-[250px] cursor-help">
                {plainBio}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] break-words p-3 bg-white border shadow-md transition-all duration-300">
              <p className="text-xs text-gray-700 leading-relaxed font-inter">
                {plainBio}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: {
      width: "25%",
    },
  },
  {
    accessorKey: "is_default",
    header: "Default",
    cell: ({ row }) => {
      const author = row.original;
      const isImported = author.role === "imported";
      const isOwner = author.role === "owner";
      const defaults = author.platform_defaults || [];
      const hasDefault = defaults.length > 0;

      if (!isImported && !isOwner) return null;

      const formatPlatformName = (p: string) => {
        return p
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      return (
        <div className="flex items-center justify-center w-full">
          {hasDefault ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 hover:scale-110 transition-transform cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="bg-white border text-gray-700 p-2 shadow-lg">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Default for Platforms:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {defaults.map((p) => {
                        const key =
                          typeof p === "string" ? p : p.integration_id;
                        const label =
                          typeof p === "string"
                            ? formatPlatformName(p)
                            : p.name || formatPlatformName(p.platform);
                        return (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-[9px] px-1.5 h-4 bg-amber-50 text-amber-700 border-amber-100"
                          >
                            {label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            isImported && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-all duration-200"
                onClick={() => onSetDefault(author)}
                title="Set as platform default"
              >
                <Star className="w-4 h-4" />
              </Button>
            )
          )}
        </div>
      );
    },
    meta: {
      width: "10%",
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const author = row.original;
      const isOwner = author.role === "owner";
      const [open, setOpen] = useState(false);

      const defaults = author.platform_defaults || [];
      const isDefault = defaults.length > 0;

      const actions = [
        author.external_platform && !isDefault && !isOwner
          ? {
              id: "default",
              name: "Set as Default",
              icon: <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />,
              action: () => onSetDefault(author),
            }
          : null,
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
