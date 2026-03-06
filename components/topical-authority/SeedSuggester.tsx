"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/appStore";
import { axiosInstance } from "@/lib/axiosInstace";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeedTopic {
  topic: string;
  relevance_score: number;
  reasoning: string;
}

interface SeedSuggesterProps {
  onSelect: (topic: string) => void;
}

export function SeedSuggester({ onSelect }: SeedSuggesterProps) {
  const { blogs } = useAppStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["suggest_seeds", blogs?.id],
    queryFn: async () => {
      if (!blogs?.id) return null;
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/topical_authorities/suggest_seeds`,
      );
      return res.data;
    },
    enabled: false,
  });

  return (
    <div className="bg-white rounded-xl p-5 border-none shadow-none font-inter h-full flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-800 shrink-0">
        Need Inspiration?
      </h3>
      <p className="text-xs text-gray-400 mt-1 shrink-0">
        AI can analyze your blog and suggest relevant seed topics.
      </p>

      {!data && !isLoading && !error && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-3 h-8 text-xs text-gray-600 hover:text-[#104127] hover:border-[#104127]/30 gap-1.5 shrink-0 w-fit"
          disabled={!blogs?.id}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Suggest Topics (25 Credits)
        </Button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-3 shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#104127]" />
          Analyzing your blog profile...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border-none shadow-none mt-3 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to fetch suggestions</p>
            <p className="text-red-500 text-[11px]">
              {(error as any)?.response?.data?.error ||
                "An unexpected error occurred."}
            </p>
          </div>
        </div>
      )}

      {data?.data?.seeds && (
        <div className="mt-3 flex-1 min-h-0 flex flex-col">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 shrink-0">
            Click to use a topic
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="grid gap-2">
              {data.data.seeds.map((seed: SeedTopic, idx: number) => (
                <button
                  key={idx}
                  className="w-full text-left bg-gray-50 hover:bg-[#104127]/5 p-3 rounded-lg border-none transition-all cursor-pointer group"
                  onClick={() => onSelect(seed.topic)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-[#104127] transition-colors break-words">
                      {seed.topic}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: "#F4F4F4", color: "#555555" }}
                    >
                      {seed.relevance_score}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1 break-words">
                    {seed.reasoning}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
