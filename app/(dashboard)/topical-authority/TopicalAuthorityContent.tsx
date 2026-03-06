"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { TopicalAuthorityForm } from "@/components/topical-authority/TopicalAuthorityForm";
import { SeedSuggester } from "@/components/topical-authority/SeedSuggester";
import { TopicalAuthorityHistory } from "@/components/topical-authority/TopicalAuthorityHistory";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TopicalAuthorityContent() {
  const { blogs } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isNewView = searchParams.get("new") === "true";
  const suggestedParam = searchParams.get("suggested");
  const showNewForm = isNewView || !!suggestedParam;

  const [suggestedTopic, setSuggestedTopic] = useState<string>(
    suggestedParam || "",
  );

  React.useEffect(() => {
    if (suggestedParam) {
      setSuggestedTopic(suggestedParam);
    }
  }, [suggestedParam]);

  // Default: show history table
  if (!showNewForm) {
    return <TopicalAuthorityHistory />;
  }

  // "Create New" form — two-panel layout
  return (
    <div className="flex flex-col font-inter h-[calc(100vh-100px)] overflow-hidden">
      {/* Header — above the grid */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
          onClick={() => router.push("/topical-authority")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 font-poppins">
            Create Topical Authority Map
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate a 3-tier authority map for your niche
          </p>
        </div>
      </div>

      {/* Two-panel grid: 2/3 form + 1/3 suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: Form (2/3) */}
        <div className="lg:col-span-2 overflow-y-auto no-scrollbar min-h-0">
          <TopicalAuthorityForm
            onSuccess={(id) => router.push(`/topical-authority/${id}`)}
            defaultTopic={suggestedTopic}
          />
        </div>

        {/* Right: Seed Suggester (1/3) */}
        <div className="lg:col-span-1 overflow-hidden min-h-0">
          <SeedSuggester onSelect={(topic) => setSuggestedTopic(topic)} />
        </div>
      </div>
    </div>
  );
}
