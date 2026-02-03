"use client";

import KeywordResearchClient from "@/app/(dashboard)/keyword-research/components/KeywordResearchClient";
import MockQueryProvider from "../components/MockQueryProvider";

export default function DemoKeywordResearchPage() {
  return (
    <MockQueryProvider>
      <KeywordResearchClient />
    </MockQueryProvider>
  );
}
