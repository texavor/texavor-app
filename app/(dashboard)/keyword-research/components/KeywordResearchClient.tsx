"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Zap, Database } from "lucide-react";
import { KeywordResultsTable, KeywordData } from "./KeywordResultsTable";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { RecentSearches } from "./RecentSearches";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";
import { CustomTabs } from "@/components/ui/custom-tabs";

export default function KeywordResearchClient() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"basic" | "detailed">("basic");
  const [results, setResults] = useState<KeywordData[]>([]);
  const [seedData, setSeedData] = useState<KeywordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { blogs } = useAppStore();

  const handleSearch = async (searchQuery?: string) => {
    const term = searchQuery || query;
    if (!term.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    if (searchQuery) {
      setQuery(searchQuery);
    }

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);
    setSeedData(null);

    try {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${
          blogs?.id
        }/keyword_research/search?query=${encodeURIComponent(
          term
        )}&mode=${mode}`
      );

      setSeedData(response?.data.seed);
      setResults(response?.data.related || []);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      toast.error("Failed to fetch keyword data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Section: Search and Recent Searches */}
      <div className="flex flex-col flex-row gap-4 w-full">
        {/* Left: Search Input */}
        <div className="w-full w-8/12 bg-white p-4 rounded-xl space-y-2">
          <div className="flex flex-col space-y-1 mb-2">
            <p className="font-poppins text-black font-medium">
              Keyword Research
            </p>
            <p className="font-inter text-[#7A7A7A] text-sm font-normal">
              Discover new keywords and analyze their potential.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Enter a seed keyword (e.g., 'marketing')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-white"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto items-center">
              <CustomTabs
                value={mode}
                onValueChange={(val) => setMode(val as "basic" | "detailed")}
                items={[
                  {
                    value: "basic",
                    label: "Basic",
                    icon: <Zap className="h-3.5 w-3.5" />,
                  },
                  {
                    value: "detailed",
                    label: "Detailed",
                    icon: <Database className="h-3.5 w-3.5" />,
                  },
                ]}
              />
            </div>
          </div>

          <Button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="w-full sm:w-[50%] bg-[#104127] text-white hover:bg-[#104127]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Right: Recent Searches */}
        <div className="w-full max-w-4/12">
          <RecentSearches onSelect={(term) => handleSearch(term)} />
        </div>
      </div>

      {/* Bottom Section: Results and Metrics */}
      {hasSearched && (isLoading || results.length > 0) ? (
        <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left: Results Table */}
          <div className="w-full lg:w-8/12 bg-white rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold font-poppins text-lg">
                Related Keywords
              </h3>
              <span className="text-sm text-muted-foreground">
                {results.length} results found
              </span>
            </div>
            <KeywordResultsTable
              data={results}
              mode={mode}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Metrics */}
          <div className="w-full lg:w-4/12 space-y-4">
            {seedData && mode === "detailed" ? (
              <div className="bg-white p-6 rounded-xl space-y-6">
                <h3 className="font-semibold font-poppins text-lg">
                  Analysis for{" "}
                  <span className="text-[#104127]">"{seedData.term}"</span>
                </h3>

                {/* Difficulty Gauge */}
                <div className="flex justify-center">
                  <Gauge
                    label="Difficulty"
                    value={seedData.difficulty || 0}
                    inverse={true}
                  />
                </div>

                {/* Competition ScoreMeter */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-black font-poppins">
                      Competition
                    </p>
                    <p className="text-sm font-inter">
                      {((seedData.competition || 0) * 10).toFixed(1)}/10
                    </p>
                  </div>
                  <ScoreMeter
                    value={(seedData.competition || 0) * 10}
                    inverse={true}
                  />
                </div>

                {/* Volume and CPC */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-muted-foreground font-medium block uppercase tracking-wider">
                      Volume
                    </span>
                    <span className="text-lg font-bold text-[#104127]">
                      {seedData.search_volume?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-muted-foreground font-medium block uppercase tracking-wider">
                      CPC
                    </span>
                    <span className="text-lg font-bold text-[#104127]">
                      ${seedData.cpc || 0.0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl text-center text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select "Detailed" mode to see full metrics.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center rounded-xl bg-white p-12 w-full">
          <p className="text-xl font-semibold font-poppins">
            No keywords generated.
          </p>
          <p className="font-inter text-sm text-gray-400">
            Use the form above to get started or try different keywords.
          </p>
        </div>
      )}
    </div>
  );
}
