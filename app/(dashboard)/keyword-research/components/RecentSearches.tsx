"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentSearchesProps {
  onSelect: (term: string) => void;
}

export const RecentSearches = ({ onSelect }: RecentSearchesProps) => {
  const { blogs } = useAppStore();
  const [searches, setSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      if (!blogs?.id) return;

      try {
        const response = await axiosInstance.get(
          `/api/v1/blogs/${blogs.id}/recent_searches?type=keyword_research`
        );

        setSearches(response?.data?.data || []); // Limit to 10
      } catch (error) {
        console.error("Failed to fetch recent searches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, [blogs?.id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 space-y-4 h-full">
        <Skeleton className="h-6 w-full rounded-full" />
        <Skeleton className="h-6 w-8/12 rounded-full" />
        <Skeleton className="h-6 w-7/12 rounded-full" />
        <Skeleton className="h-6 w-full rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 space-y-2 h-full">
      <h3 className="font-poppins text-black font-medium flex items-center gap-2">
        <History size={18} /> Recent Searches
      </h3>
      {searches.length > 0 ? (
        <ul className="space-y-1 pt-1 overflow-y-auto max-h-[110px] no-scrollbar">
          {searches.map((search: any, index) => (
            <li key={index}>
              <button
                onClick={() => onSelect(search?.keywords?.[0])}
                className="text-sm font-inter text-gray-600 hover:text-black text-left w-full cursor-pointer truncate max-w-fit"
              >
                {search?.keywords?.[0]}
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
