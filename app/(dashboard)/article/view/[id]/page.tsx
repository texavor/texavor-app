"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";

// Dynamic import for Editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[80vh] w-full rounded-md" />,
});

export default function ViewArticlePage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { blogs } = useAppStore();

  const articleId = params?.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: fetchedArticle, isLoading } = useQuery({
    queryKey: ["article-view", articleId, blogs?.id],
    queryFn: async () => {
      if (!articleId) return null;
      try {
        const res = await axiosInstance.get(
          `/api/v1/blogs/${blogs?.id}/articles/${articleId}`
        );
        return res.data;
      } catch (error) {
        console.error("Error fetching article:", error);
        return null; // Handle 404/Permissions gracefully-ish
      }
    },
    enabled: !!articleId && !!blogs?.id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchedArticle) {
      setTitle(fetchedArticle.title || "");
      setContent(fetchedArticle.content || "");
      setThumbnailUrl(fetchedArticle.thumbnail_url || null);
    }
  }, [fetchedArticle]);

  // Show loading skeleton if unmounted, loading, or dependencies not yet ready
  if (!mounted || isLoading || !blogs?.id || !articleId) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Skeleton className="w-3/4 h-12 rounded-md" />
        <div className="space-y-4">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-2/3 h-4 rounded" />
        </div>
      </div>
    );
  }

  if (!fetchedArticle) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The article you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="max-w-5xl mx-auto w-full">
        {/* Pass dummy handlers for required props, they won't be called in readOnly mode mostly, 
            but Editor expects them. */}
        <Editor
          value={content}
          onChange={() => {}} // Read-only, no change
          title={title}
          onTitleChange={() => {}} // Read-only
          thumbnailUrl={thumbnailUrl}
          // No handlers for cover/save/settings needed as they are hidden in readOnly
          readOnly={true}
          // Hide metrics initially, maybe allow toggle?
          // The Editor component shows metrics toggle button even in readOnly?
          // Let's check Editor.tsx again. Yes: "Metrics Toggle" is NOT wrapped in !readOnly.
          // So user can see metrics (word count) if they want.
          showMetrics={false}
          onToggleMetrics={() => {}}
          isLoading={false}
        />
      </div>
    </div>
  );
}
