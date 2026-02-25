"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { TopicalAuthorityForm } from "@/components/topical-authority/TopicalAuthorityForm";
import { useTopicalAuthorityPolling } from "@/hooks/useTopicalAuthorityPolling";
import { TopicalAuthorityProgress } from "@/components/topical-authority/TopicalAuthorityProgress";
import { TopicalMapView } from "@/components/topical-authority/TopicalMapView";

export default function TopicalAuthorityContent() {
  const { blogs } = useAppStore();
  const [jobId, setJobId] = useState<number | null>(null);

  // This state allows passing the suggested topic back to the form if run suggested is clicked
  const [suggestedTopic, setSuggestedTopic] = useState<string>("");

  const { data: pollData } = useTopicalAuthorityPolling(jobId);

  const handleReset = () => {
    setJobId(null);
  };

  const handleRunSuggested = (topic: string) => {
    setSuggestedTopic(topic);
    handleReset();
  };

  const status = pollData?.job_status;
  const mapData = pollData?.data;

  return (
    <div className="flex flex-col space-y-6">
      {!jobId && (
        <div>
          <h1 className="text-2xl font-semibold font-poppins">
            Topical Authority Map
          </h1>
          <p className="text-sm text-gray-500 font-inter mt-1">
            Generate large-scale topical maps to build absolute authority in
            your niche.
          </p>
        </div>
      )}

      {/* State 1: No Job ID -> Show Form + Empty State */}
      {!jobId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TopicalAuthorityForm onSuccess={(id) => setJobId(id)} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl flex flex-col items-center justify-center min-h-[400px] border-none shadow-none font-poppins h-full">
              <p className="text-sm text-gray-500 font-inter text-center max-w-sm">
                Enter a broad topic on the left to generate a 3-tier topical
                authority map.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Polling / Processing / Failed */}
      {jobId && status !== "completed" && (
        <TopicalAuthorityProgress
          status={status || "pending"}
          data={mapData}
          onReset={handleReset}
          onRunSuggested={handleRunSuggested}
        />
      )}

      {/* State 3: Completed */}
      {jobId && status === "completed" && mapData && (
        <div className="space-y-4">
          <div className="flex justify-start mb-4">
            <button
              onClick={handleReset}
              className="text-[#104127] hover:underline text-sm font-poppins border-none bg-transparent cursor-pointer"
            >
              &larr; Generate New Map
            </button>
          </div>
          <TopicalMapView data={mapData} />
        </div>
      )}
    </div>
  );
}
