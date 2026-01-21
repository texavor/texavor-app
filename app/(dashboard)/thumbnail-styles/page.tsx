"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Sparkles, Settings2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { ThumbnailStyleCard } from "@/components/ThumbnailStyleCard";
import { toast } from "sonner";

interface ThumbnailStyle {
  id: string;
  name: string;
  description: string;
  template_prompt: string;
  colors: string[];
  variation_type: "minimal" | "full";
  text_placement: string;
  icon_style?: string;
  visual_elements?: string[];
  preview_url: string;
}

export default function ThumbnailStylesPage() {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(416);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch existing styles
  const { data, isLoading } = useQuery<{
    styles: ThumbnailStyle[];
    selected_style_id: string | null;
  }>({
    queryKey: ["thumbnailStyles", blogs?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles`,
      );
      return response.data;
    },
    enabled: !!blogs?.id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Poll for status
  const { data: statusData, error: statusError } = useQuery({
    queryKey: ["thumbnailStatus", blogs?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles/status`,
      );
      return response.data;
    },
    enabled: isPolling && !!blogs?.id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    refetchIntervalInBackground: true,
  });

  // Handle polling updates
  useEffect(() => {
    if (!statusData) return;

    const { status, styles, message } = statusData;
    console.log("Poll response:", { status, message });

    if (status === "completed") {
      setIsPolling(false);
      queryClient.invalidateQueries({
        queryKey: ["thumbnailStyles", blogs?.id],
      });
    } else if (status === "failed") {
      setIsPolling(false);
      toast.error(message || "Failed to generate styles");
    }
  }, [statusData, queryClient, blogs?.id]);

  // Handle polling errors
  useEffect(() => {
    if (statusError) {
      console.error("Poll error:", statusError);
      setIsPolling(false);
      toast.error("Failed to check generation status");
    }
  }, [statusError]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles/analyze`,
        {},
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.status === "pending") {
        setIsPolling(true);
        toast.info("Analysis started... This may take a few moments.");
      } else if (data?.styles) {
        // Immediate success (unlikely but possible)
        queryClient.invalidateQueries({
          queryKey: ["thumbnailStyles", blogs?.id],
        });
        toast.success("Thumbnail styles generated successfully!");
      }
    },
    onError: (error: any) => {
      console.error("Analyze error:", error);
      // Global error handler might catch this, but just in case
    },
  });

  // Select style mutation
  const selectStyleMutation = useMutation({
    mutationFn: async (styleId: string) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles/select`,
        { style_id: styleId },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["thumbnailStyles", blogs?.id],
      });
    },
  });

  // Update dimensions mutation
  const updateDimensionsMutation = useMutation({
    mutationFn: async (dimensions: { width: number; height: number }) => {
      const response = await axiosInstance.patch(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles/update_settings`,
        dimensions,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Dimensions updated successfully");
    },
  });

  const handleSelectStyle = (styleId: string) => {
    selectStyleMutation.mutate(styleId);
  };

  const handleUpdateDimensions = () => {
    if (width < 256 || width > 2048 || height < 256 || height > 2048) {
      toast.error("Dimensions must be between 256 and 2048 pixels");
      return;
    }
    if (width % 32 !== 0 || height % 32 !== 0) {
      toast.error("Dimensions must be multiples of 32");
      return;
    }
    updateDimensionsMutation.mutate({ width, height });
  };

  const setPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  const styles = data?.styles || [];
  const selectedStyleId = data?.selected_style_id;
  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  const isAnalyzing = analyzeMutation.isPending || isPolling;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thumbnail Templates</h1>
          <p className="text-gray-600 mt-1">
            Generate and manage custom thumbnail styles for your blog
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Brand
            </>
          )}
        </Button>
      </div>

      {/* Current Selection */}
      {selectedStyle && (
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Current Selection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <img
                src={selectedStyle.preview_url}
                alt={selectedStyle.name}
                className="w-full rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {selectedStyle.name}
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      selectedStyle.variation_type === "minimal"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {selectedStyle.variation_type === "minimal"
                      ? "🔒 Minimal"
                      : "🎨 Full"}
                  </span>
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedStyle.description}
                </p>
              </div>
              <div className="flex gap-2">
                {selectedStyle.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>📍 Text Placement: {selectedStyle.text_placement}</div>
                <div>
                  🎨 Icon Style:{" "}
                  {selectedStyle.icon_style ||
                    selectedStyle.visual_elements?.join(", ") ||
                    "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dimension Settings */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Thumbnail Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={256}
                  max={2048}
                  step={32}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min={256}
                  max={2048}
                  step={32}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateDimensions}
              disabled={updateDimensionsMutation.isPending}
              className="w-full"
            >
              {updateDimensionsMutation.isPending
                ? "Updating..."
                : "Update Dimensions"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset(1280, 736)}
              >
                YouTube (1280x736)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset(1024, 416)}
              >
                Blog (1024x416)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset(1216, 640)}
              >
                Social (1216x640)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset(1024, 1024)}
              >
                Square (1024x1024)
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dimensions must be between 256-2048px and multiples of 32
            </p>
          </div>
        </div>
      </div>

      {/* All Styles */}
      <div className="space-y-4 pb-4">
        <h2 className="text-xl font-semibold">All Thumbnail Styles</h2>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading styles...
          </div>
        ) : styles.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="/empty-state.png"
              alt="No Styles Generated"
              className="w-48 h-auto mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Styles Generated Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Analyze your brand to generate 6 custom thumbnail templates
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Started
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Styles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((style) => (
                <ThumbnailStyleCard
                  key={style.id}
                  style={style}
                  isSelected={style.id === selectedStyleId}
                  onSelect={handleSelectStyle}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
