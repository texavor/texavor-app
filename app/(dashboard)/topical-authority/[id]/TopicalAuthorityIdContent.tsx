"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTopicalAuthorityPolling } from "@/hooks/useTopicalAuthorityPolling";
import { TopicalAuthorityProgress } from "@/components/topical-authority/TopicalAuthorityProgress";
import { TopicalMapView } from "@/components/topical-authority/TopicalMapView";

export default function TopicalAuthorityIdContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: pollData } = useTopicalAuthorityPolling(id);

  const status = pollData?.job_status;
  const mapData = pollData?.data;

  const handleReset = () => {
    router.push("/topical-authority");
  };

  const handleRunSuggested = (topic: string) => {
    router.push(`/topical-authority?suggested=${encodeURIComponent(topic)}`);
  };

  // Still loading / polling
  if (status !== "completed") {
    return (
      <TopicalAuthorityProgress
        status={status || "pending"}
        data={mapData}
        onReset={handleReset}
        onRunSuggested={handleRunSuggested}
      />
    );
  }

  // Completed — render map directly, no wrapper chrome
  if (mapData) {
    return <TopicalMapView data={mapData} />;
  }

  return null;
}
