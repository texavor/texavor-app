"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import CustomDropdown from "@/components/ui/CustomDropdown";
import {
  useLatestDiscovery,
  useDiscoveryUsage,
  useTriggerDiscovery,
  useDiscoveryStatus,
  KeywordDiscoveryKeyword,
  DiscoveryFilters,
} from "./hooks/useKeywordDiscoveryApi";
import { KeywordDiscoveryTable } from "./components/KeywordDiscoveryTable";
import { ProcessingState } from "./components/ProcessingState";
import { useSavedResultsApi } from "../saved/hooks/useSavedResultsApi";
import { useQueryClient } from "@tanstack/react-query";
import { FeatureLockOverlay } from "@/components/FeatureLockOverlay";

// Filter options
const SOURCE_OPTIONS = [
  { id: "all", name: "All Sources" },
  { id: "semantic_similarity", name: "Semantic Similarity" },
  { id: "competitor", name: "Competitor" },
  { id: "ai_prediction", name: "AI Prediction" },
  { id: "google_autocomplete", name: "Google Autocomplete" },
  { id: "blog_content", name: "Blog Content" },
];

const OPPORTUNITY_OPTIONS = [
  { id: "all", name: "All Opportunities" },
  { id: "high", name: "High (>70)", min: 70 },
  { id: "medium", name: "Medium (40-70)", min: 40, max: 70 },
  { id: "low", name: "Low (<40)", max: 40 },
];

const COMPETITOR_OPTIONS = [
  { id: "all", name: "All Keywords" },
  { id: "used", name: "Used by Competitors", value: true },
  { id: "not_used", name: "Not Used by Competitors", value: false },
];

export default function KeywordDiscoveryContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { blogs } = useAppStore();
  const { saveResult } = useSavedResultsApi();

  // State
  const [sourceFilter, setSourceFilter] = useState("all");
  const [opportunityFilter, setOpportunityFilter] = useState("all");
  const [competitorFilter, setCompetitorFilter] = useState("all");
  const [savedKeywords, setSavedKeywords] = useState<Set<string>>(new Set());
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [opportunityDropdownOpen, setOpportunityDropdownOpen] = useState(false);
  const [competitorDropdownOpen, setCompetitorDropdownOpen] = useState(false);

  // Build filters for API
  const filters: DiscoveryFilters = {
    source: sourceFilter,
    sort_by: "opportunity",
    sort_order: "desc",
  };

  // Add opportunity filters
  const selectedOpp = OPPORTUNITY_OPTIONS.find(
    (opt) => opt.id === opportunityFilter,
  );
  if (selectedOpp && selectedOpp.id !== "all") {
    if ("min" in selectedOpp) filters.min_opportunity = selectedOpp.min;
    if ("max" in selectedOpp) filters.max_opportunity = selectedOpp.max;
  }

  // Add competitor filter
  const selectedComp = COMPETITOR_OPTIONS.find(
    (opt) => opt.id === competitorFilter,
  );
  if (selectedComp && selectedComp.id !== "all" && "value" in selectedComp) {
    filters.competitor_only = selectedComp.value;
  }

  // API hooks
  const { data: usage, isLoading: usageLoading } = useDiscoveryUsage(blogs?.id);
  const {
    data: discovery,
    isLoading: discoveryLoading,
    error,
  } = useLatestDiscovery(blogs?.id, filters);
  const triggerDiscovery = useTriggerDiscovery();

  // Poll for progress when discovery is processing
  // This will automatically start polling if user visits page with ongoing discovery
  const { data: discoveryStatus } = useDiscoveryStatus(
    blogs?.id,
    discovery?.id,
    discovery?.status === "processing",
  );

  // Effect to refetch latest data when polling completes
  React.useEffect(() => {
    if (discoveryStatus?.status === "completed") {
      queryClient.invalidateQueries({
        queryKey: ["keywordDiscovery", "latest", blogs?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["keywordDiscovery", "usage", blogs?.id],
      });
    }
  }, [discoveryStatus?.status, blogs?.id, queryClient]);

  // Derived state
  const selectedSource =
    SOURCE_OPTIONS.find((opt) => opt.id === sourceFilter) || SOURCE_OPTIONS[0];
  const selectedOpportunity =
    OPPORTUNITY_OPTIONS.find((opt) => opt.id === opportunityFilter) ||
    OPPORTUNITY_OPTIONS[0];
  const selectedCompetitor =
    COMPETITOR_OPTIONS.find((opt) => opt.id === competitorFilter) ||
    COMPETITOR_OPTIONS[0];

  const canDiscover = usage && usage.remaining > 0;
  // Use discovery status if available for more immediate updates
  const isProcessing =
    discoveryStatus?.status === "processing" ||
    discovery?.status === "processing";

  // Show table if we have keywords or if completed
  const hasDiscovery =
    (discoveryStatus?.status === "completed" ||
      discovery?.status === "completed") &&
    (discovery?.keywords?.length || 0) > 0;

  // Show usage when 50% or more of limit is used
  const showUsage = usage && usage.used / usage.limit >= 0.5;

  // Handlers
  const handleTriggerDiscovery = async () => {
    if (!blogs?.id) return;
    if (!canDiscover) {
      toast.error(
        "You've reached your monthly limit. Upgrade to discover more keywords.",
      );
      return;
    }

    try {
      await triggerDiscovery.mutateAsync(blogs.id);
      toast.success(
        "Keyword discovery started! This may take up to 2 minutes.",
      );
      // Invalidate queries to start polling
      queryClient.invalidateQueries({
        queryKey: ["keywordDiscovery", "latest", blogs.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["keywordDiscovery", "usage", blogs.id],
      });
    } catch (error: any) {
      console.error("Discovery error:", error);
    }
  };

  const handleSaveKeyword = (keyword: KeywordDiscoveryKeyword) => {
    // Safely extract the keyword term string
    const term =
      typeof keyword.keyword === "string"
        ? keyword.keyword
        : keyword.keyword?.term || "";

    if (!term) return;

    saveResult.mutate(
      {
        result_type: "keyword_research", // Using keyword_research as it's the valid type
        title: term,
        search_params: { source: keyword.source },
        result_data: keyword,
        tags: ["keyword", "discovery"],
      },
      {
        onSuccess: () => {
          setSavedKeywords((prev) => new Set(prev).add(term));
          toast.success("Keyword saved successfully!");
        },
      },
    );
  };

  const handleGenerateTopic = (keyword: string) => {
    router.push(`/topic-generation?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleSourceChange = (option: any) => {
    setSourceFilter(option.id);
    setSourceDropdownOpen(false);
  };

  const handleOpportunityChange = (option: any) => {
    setOpportunityFilter(option.id);
    setOpportunityDropdownOpen(false);
  };

  const handleCompetitorChange = (option: any) => {
    setCompetitorFilter(option.id);
    setCompetitorDropdownOpen(false);
  };

  return (
    <FeatureLockOverlay
      feature="keyword_discoveries"
      title="Keyword Discovery Locked"
      description="Unlock deep keyword insights and market analysis with the Professional plan."
    >
      <div className="flex flex-col space-y-6">
        {/* Header with filters and discover button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Source Filter */}
            <CustomDropdown
              open={sourceDropdownOpen}
              onOpenChange={setSourceDropdownOpen}
              options={SOURCE_OPTIONS}
              value={sourceFilter}
              onSelect={handleSourceChange}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 bg-white hover:bg-white rounded-md font-inter text-sm border-none flex items-center gap-2 px-3"
                >
                  <span className="font-medium text-gray-700">
                    {selectedSource?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              }
            />

            {/* Opportunity Filter */}
            <CustomDropdown
              open={opportunityDropdownOpen}
              onOpenChange={setOpportunityDropdownOpen}
              options={OPPORTUNITY_OPTIONS}
              value={opportunityFilter}
              onSelect={handleOpportunityChange}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 bg-white hover:bg-white rounded-md font-inter text-sm border-none flex items-center gap-2 px-3"
                >
                  <span className="font-medium text-gray-700">
                    {selectedOpportunity?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              }
            />

            {/* Competitor Filter */}
            <CustomDropdown
              open={competitorDropdownOpen}
              onOpenChange={setCompetitorDropdownOpen}
              options={COMPETITOR_OPTIONS}
              value={competitorFilter}
              onSelect={handleCompetitorChange}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 bg-white hover:bg-white rounded-md font-inter text-sm border-none flex items-center gap-2 px-3"
                >
                  <span className="font-medium text-gray-700">
                    {selectedCompetitor?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              }
            />
          </div>

          {/* Right side: Usage stats (when >= 50%) and Discover Button */}
          <div className="flex items-center gap-4">
            {/* Usage Stats - Show only when 50% or more used */}
            {showUsage && (
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-500 font-inter">
                  Keyword Discoveries
                </p>
                <p className="text-sm font-semibold font-poppins text-[#0A2918]">
                  {usage.used} / {usage.limit}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    this month
                  </span>
                </p>
              </div>
            )}

            {/* Discover Button */}
            <Button
              onClick={handleTriggerDiscovery}
              disabled={
                !canDiscover || triggerDiscovery.isPending || isProcessing
              }
              className="h-9 bg-[#104127] hover:bg-[#104127]/90 font-inter gap-2 relative overflow-hidden group"
            >
              {/* Shimmer effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {triggerDiscovery.isPending || isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin relative z-10" />
              ) : (
                <Sparkles className="h-4 w-4 relative z-10" />
              )}
              <span className="relative z-10">
                {isProcessing
                  ? "Processing..."
                  : "Discover Keywords (350 Credits)"}
              </span>
            </Button>
          </div>
        </div>

        {/* Content - Always show table */}
        {isProcessing ? (
          <ProcessingState
            totalKeywords={discovery?.total_keywords}
            progress={discoveryStatus?.progress}
          />
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border-none shadow-none">
            <KeywordDiscoveryTable
              data={hasDiscovery ? discovery?.keywords || [] : []}
              isLoading={discoveryLoading || (!discovery && !error)}
              onSave={handleSaveKeyword}
              onGenerateTopic={handleGenerateTopic}
              savedKeywords={savedKeywords}
            />
          </div>
        )}
      </div>
    </FeatureLockOverlay>
  );
}
