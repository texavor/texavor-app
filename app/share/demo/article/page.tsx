"use client";

import ArticlePageContent from "@/app/(dashboard)/article/ArticlePageContent";
import MockQueryProvider from "../components/MockQueryProvider";

export default function DemoArticlePage() {
  return (
    <MockQueryProvider>
      <ArticlePageContent />
    </MockQueryProvider>
  );
}
