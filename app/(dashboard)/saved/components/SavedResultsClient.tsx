"use client";

import React, { useState } from "react";
import { useSavedResultsApi, SavedResult } from "../hooks/useSavedResultsApi";
import { CustomTable } from "@/components/ui/CustomTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Trash2,
  Eye,
  Star,
  MoreHorizontal,
  FileText,
  Binoculars,
  Microscope,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

const TYPE_OPTIONS = [
  { id: "all", name: "All Items" },
  { id: "keyword_research", name: "Keywords" },
  { id: "outline_generation", name: "Outlines" },
  { id: "topic_generation", name: "Topics" },
];

export default function SavedResultsClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const { useSavedResults, deleteResult, toggleFavorite } =
    useSavedResultsApi();

  const { data: resultsResponse, isLoading } = useSavedResults({
    type: activeTab === "all" ? undefined : activeTab,
    q: searchQuery,
    per_page: 50, // Load more items initially
  });

  const handleView = (result: SavedResult) => {
    switch (result.result_type) {
      case "keyword_research":
        router.push(
          `/keyword-research?q=${encodeURIComponent(
            result.search_params.query
          )}&mode=${result.search_params.mode}`
        );
        break;
      case "outline_generation":
        router.push(`/outline-generation?id=${result.id}`);
        break;
      case "topic_generation":
        router.push(`/topic-generation?id=${result.id}`);
        break;
      default:
        break;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "keyword_research":
        return <Binoculars className="h-4 w-4 text-blue-500" />;
      case "outline_generation":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "topic_generation":
        return <Microscope className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case "keyword_research":
        return "Keyword Research";
      case "outline_generation":
        return "Outline";
      case "topic_generation":
        return "Topic";
      default:
        return type;
    }
  };

  const selectedType =
    TYPE_OPTIONS.find((opt) => opt.id === activeTab) || TYPE_OPTIONS[0];

  const columns: ColumnDef<SavedResult>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getIconForType(result.result_type)}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{result.title}</span>
              <span className="text-xs text-gray-500">
                {getLabelForType(result.result_type)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tags.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "saved_at",
      header: "Date Saved",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-gray-500">
            {format(new Date(row.original.saved_at), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite.mutate(result.id);
              }}
            >
              <Star
                className={`h-4 w-4 ${
                  result.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                }`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(result)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this item?")) {
                      deleteResult.mutate(result.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CustomDropdown
            open={typeDropdownOpen}
            onOpenChange={setTypeDropdownOpen}
            options={TYPE_OPTIONS}
            value={activeTab}
            onSelect={(opt: any) => {
              setActiveTab(opt.id);
              setTypeDropdownOpen(false);
            }}
            trigger={
              <Button
                variant="outline"
                className="h-9 bg-white hover:bg-white rounded-md font-inter text-sm border-gray-200 flex items-center gap-2 px-3 min-w-[140px] justify-between border-none shadow-none"
              >
                <span className="font-medium text-gray-700">
                  {selectedType?.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            }
          />
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search saved items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CustomTable
          columns={columns}
          data={resultsResponse?.data || []}
          isLoading={isLoading}
          onClick={(row: any) => handleView(row)}
          className="cursor-pointer hover:bg-gray-50/50"
        />
      </div>
    </div>
  );
}
