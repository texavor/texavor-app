"use client";

import React from "react";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { History, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SearchType =
  | "keyword_research"
  | "topic_generation"
  | "outline_generation";

interface RecentSearchesProps {
  type: SearchType;
  onSelect: (term: string) => void;
  className?: string;
}

export const RecentSearches = ({
  type,
  onSelect,
  className,
}: RecentSearchesProps) => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["recentSearches", blogs?.id, type],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/recent_searches?search_type=${type}`
      );
      return response?.data?.data || [];
    },
    enabled: !!blogs?.id,
  });

  const deleteSearch = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(
        `/api/v1/blogs/${blogs?.id}/recent_searches/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recentSearches", blogs?.id, type],
      });
      toast.success("Recent search deleted");
    },
    onError: (error: any) => {
      console.error("Failed to delete recent search:", error);
      toast.error("Failed to delete recent search");
    },
  });

  const handleDelete = (id: string) => {
    deleteSearch.mutate(id);
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-xl p-4 space-y-4 h-full border-none shadow-none ${className}`}
      >
        <Skeleton className="h-6 w-full rounded-full" />
        <Skeleton className="h-6 w-8/12 rounded-full" />
        <Skeleton className="h-6 w-7/12 rounded-full" />
        <Skeleton className="h-6 w-full rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl p-4 space-y-2 h-full border-none shadow-none ${className}`}
    >
      <h3 className="font-poppins text-black font-medium flex items-center gap-2">
        <History size={18} /> Recent Searches
      </h3>
      {searches.length > 0 ? (
        <ul className="space-y-1 pt-1 overflow-y-auto max-h-[110px] no-scrollbar border-none shadow-none">
          {searches.map((search: any, index: number) => (
            <li key={search.id || index} className="flex items-center group">
              <button
                onClick={() => onSelect(search?.keywords?.[0])}
                className="flex-1 text-sm font-inter text-gray-600 hover:text-black text-left cursor-pointer truncate max-w-fit"
              >
                {search?.keywords?.[0]}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(search.id);
                }}
                disabled={deleteSearch.isPending}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity cursor-pointer disabled:opacity-50"
                title="Delete search"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 pt-2">No recent searches.</p>
      )}
    </div>
  );
};
