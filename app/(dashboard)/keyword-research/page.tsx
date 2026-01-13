import React from "react";
import { Metadata } from "next";
import KeywordResearchClient from "./components/KeywordResearchClient";

export const metadata: Metadata = {
  title: "Keyword Research",
};

export default function KeywordResearchPage() {
  return (
    <div className="w-full">
      <KeywordResearchClient />
    </div>
  );
}
