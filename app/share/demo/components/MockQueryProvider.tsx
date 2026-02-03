"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ARTICLE,
  MOCK_KEYWORDS,
  MOCK_AEO_METRICS,
  MOCK_AEO_PROMPTS,
  MOCK_COMPETITIVE_RANKINGS,
  DEMO_BLOG,
} from "../MockData";

export default function MockQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity, // Data never becomes stale
          gcTime: Infinity, // Data is never garbage collected
          refetchOnWindowFocus: false,
          refetchOnMount: false, // Critical: prevent refetch on mount
          retry: false,
        },
      },
    });

    // --- SEED CACHE ---
    // Keys must match exact QueryKeys used in the actual components.

    // Dashboard Stats
    client.setQueryData(["dashboard-stats"], MOCK_DASHBOARD_STATS);

    // AEO Metrics (Matches useAeoMetrics hooks)
    client.setQueryData(["aeo-metrics", DEMO_BLOG.id], MOCK_AEO_METRICS);
    client.setQueryData(["aeo-prompts", DEMO_BLOG.id], MOCK_AEO_PROMPTS);
    client.setQueryData(
      ["competitive-rankings", DEMO_BLOG.id],
      MOCK_COMPETITIVE_RANKINGS,
    );

    // Article
    client.setQueryData(["article", "demo-id"], MOCK_ARTICLE);

    // Keyword Research
    client.setQueryData(["keywords"], MOCK_KEYWORDS);

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
