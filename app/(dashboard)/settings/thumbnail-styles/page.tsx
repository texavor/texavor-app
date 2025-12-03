"use client";

import { useState, useEffect } from "react";
import { SettingHeader } from "../components/SettingHeader";
import { ThumbnailStyleSettings } from "../components/ThumbnailStyleSettings";
import { useGetBlogs } from "../hooks/useBlogSettingsApi";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette } from "lucide-react";

export default function ThumbnailStylesPage() {
  const { data: blogs, isLoading: blogsLoading } = useGetBlogs();
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // Set first blog as selected when blogs load
  useEffect(() => {
    if (blogs && blogs.length > 0 && !selectedBlogId) {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  if (blogsLoading) {
    return (
      <div>
        <SettingHeader
          title="Thumbnail Styles"
          description="Manage your blog's visual identity"
        />
        <Card className="p-6 border-none">
          <Skeleton className="h-10 w-full bg-[#f9f4f0] mb-6" />
          <Skeleton className="h-40 w-full bg-[#f9f4f0]" />
        </Card>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div>
        <SettingHeader
          title="Thumbnail Styles"
          description="Manage your blog's visual identity"
        />
        <Card className="p-6 border-none text-center">
          <p className="text-gray-600 font-inter">
            No blogs found. Create a blog to get started.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <SettingHeader
        title="Thumbnail Styles"
        description="Manage your blog's visual identity"
      />

      {selectedBlogId && (
        <ThumbnailStyleSettings
          blogId={selectedBlogId}
          blog={blogs?.find((b) => b.id === selectedBlogId)}
        />
      )}
    </div>
  );
}
