"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Wand2, Check, Settings2 } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Blog } from "../types";

interface ThumbnailStyle {
  id: string;
  name: string;
  description: string;
  colors: string[];
  preview_url: string;
}

interface ThumbnailStyleSettingsProps {
  blogId: string;
  blog?: Blog;
}

export function ThumbnailStyleSettings({
  blogId,
  blog,
}: ThumbnailStyleSettingsProps) {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [width, setWidth] = useState(blog?.thumbnail_width || 1000);
  const [height, setHeight] = useState(blog?.thumbnail_height || 420);

  // Fetch current styles and selection
  const { data: stylesData, isLoading } = useQuery({
    queryKey: ["thumbnailStyles", blogId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/thumbnail_styles`
      );
      return res.data;
    },
    enabled: !!blogId,
  });

  // Analyze brand mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/thumbnail_styles/analyze`,
        {
          // Optional params can be added here if we want to allow user input
          // For now we'll let the backend infer from blog settings
        }
      );
      return res.data;
    },
    onMutate: () => setIsAnalyzing(true),
    onSuccess: (data) => {
      queryClient.setQueryData(["thumbnailStyles", blogId], (old: any) => ({
        ...old,
        styles: data.styles,
      }));
      toast.success("Brand analysis complete! New styles suggested.");
    },
    onError: () => {
      toast.error("Failed to analyze brand. Please try again.");
    },
    onSettled: () => setIsAnalyzing(false),
  });

  // Select style mutation
  const selectStyleMutation = useMutation({
    mutationFn: async (styleId: string) => {
      await axiosInstance.post(
        `/api/v1/blogs/${blogId}/thumbnail_styles/select`,
        {
          style_id: styleId,
        }
      );
      return styleId;
    },
    onSuccess: (styleId) => {
      queryClient.setQueryData(["thumbnailStyles", blogId], (old: any) => ({
        ...old,
        selected_style_id: styleId,
      }));
      toast.success("Thumbnail style updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update thumbnail style.");
    },
  });

  // Update resolution settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(
        `/api/v1/blogs/${blogId}/thumbnail_styles/update_settings`,
        {
          width: Number(width),
          height: Number(height),
        }
      );
    },
    onSuccess: () => {
      toast.success("Resolution settings updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
    },
    onError: () => {
      toast.error("Failed to update resolution settings.");
    },
  });

  // Update local state when data loads
  useEffect(() => {
    if (blog?.thumbnail_width) setWidth(blog.thumbnail_width);
    if (blog?.thumbnail_height) setHeight(blog.thumbnail_height);

    // Fallback to stylesData if blog data is missing (legacy support)
    if (!blog?.thumbnail_width && stylesData?.width) setWidth(stylesData.width);
    if (!blog?.thumbnail_height && stylesData?.height)
      setHeight(stylesData.height);
  }, [stylesData, blog]);

  if (isLoading) {
    return (
      <Card className="p-6 border-none pb-4">
        <Skeleton className="h-10 w-full bg-[#f9f4f0] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-[#f9f4f0]" />
          ))}
        </div>
      </Card>
    );
  }

  const styles = stylesData?.styles || [];
  const selectedStyleId = stylesData?.selected_style_id;

  return (
    <Card className="p-6 border-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center">
            <Palette className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
              Thumbnail Style
            </h3>
            <p className="text-sm text-gray-500 font-inter">
              Choose a consistent look for your article thumbnails
            </p>
          </div>
        </div>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={isAnalyzing || analyzeMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          {isAnalyzing ? (
            "Analyzing..."
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Analyze Brand
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center justify-center">
          <Wand2 className="h-4 w-4 mr-2 animate-pulse" />
          Analyzing your brand identity to generate custom styles... This may
          take up to a minute.
        </div>
      )}

      {/* Resolution Settings Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Default Resolution</h4>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Set the default dimensions for generated thumbnails (256-2048px)
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="grid gap-2">
            <Label htmlFor="thumbnail-width">Width (px)</Label>
            <Input
              id="thumbnail-width"
              type="number"
              min={256}
              max={2048}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              placeholder="1000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="thumbnail-height">Height (px)</Label>
            <Input
              id="thumbnail-height"
              type="number"
              min={256}
              max={2048}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              placeholder="420"
            />
          </div>
        </div>
        <Button
          onClick={() => updateSettingsMutation.mutate()}
          disabled={updateSettingsMutation.isPending}
          size="sm"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Resolution"}
        </Button>
      </div>

      <Separator className="my-6" />

      {styles.length === 0 && !isAnalyzing ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Palette className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-900 font-medium mb-1">
            No styles generated yet
          </h4>
          <p className="text-gray-500 text-sm mb-4">
            Click "Analyze Brand" to generate custom thumbnail styles based on
            your website.
          </p>
          <Button onClick={() => analyzeMutation.mutate()}>
            Analyze Brand
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style: ThumbnailStyle) => (
            <div
              key={style.id}
              className={`group relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                selectedStyleId === style.id
                  ? "border-purple-600 ring-2 ring-purple-100"
                  : "border-gray-100 hover:border-purple-200"
              }`}
              onClick={() => selectStyleMutation.mutate(style.id)}
            >
              {selectedStyleId === style.id && (
                <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white p-1 rounded-full shadow-sm">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={style.preview_url}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="p-4 bg-white">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {style.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {style.description}
                </p>
                <div className="flex gap-1">
                  {style.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
