"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  X,
  Wand2,
  ExternalLink,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { uploadImage } from "@/lib/imageService";

interface ThumbnailUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
  articleContent: string;
  onSuccess: (thumbnailUrl: string) => void;
}

export function ThumbnailUploadDialog({
  isOpen,
  onClose,
  articleId,
  articleTitle,
  articleContent,
  onSuccess,
}: ThumbnailUploadDialogProps) {
  const { blogs } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Generation fields
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );

  // URL field
  const [customUrl, setCustomUrl] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  // Fetch selected thumbnail style
  const { data: stylesData } = useQuery<{
    styles: any[];
    selected_style_id: string | null;
  }>({
    queryKey: ["thumbnailStyles", blogs?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/thumbnail_styles`,
      );
      return response.data;
    },
    enabled: !!blogs?.id && isOpen,
  });

  const selectedStyle = stylesData?.styles?.find(
    (s) => s.id === stylesData.selected_style_id,
  );

  // Generate mutation - using /generations endpoint like Toolbar.tsx
  const generateMutation = useMutation({
    mutationFn: async () => {
      // Build the prompt
      let prompt = customPrompt.trim();

      // If no custom prompt, build from article title and content
      if (!prompt) {
        const textContent =
          articleContent?.replace(/<[^>]*>/g, " ").trim() || "";
        const summary = textContent
          .split("\n")
          .slice(0, 3)
          .join(" ")
          .trim()
          .substring(0, 200);

        prompt = `Create a professional blog thumbnail for: ${articleTitle}. ${
          summary ? `Context: ${summary}` : ""
        }`;
      }

      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/generations`,
        {
          prompt,
          style: "thumbnail", // Always use "thumbnail" style
          width: Number(blogs?.thumbnail_width || 1024),
          height: Number(blogs?.thumbnail_height || 416),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        setPreviewUrl(data.url);
        setGeneratedImageUrl(data.url);
        // Don't upload immediately - wait for user to click "Save Cover"
      }
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error || "Failed to generate thumbnail");
    },
  });

  // Save cover mutation - handles both file uploads and AI-generated images
  const saveCoverMutation = useMutation({
    mutationFn: async () => {
      let imageUrl: string;

      if (activeTab === "upload" && selectedFile) {
        // Upload file and get URL
        imageUrl = await uploadImage(selectedFile);
      } else if (activeTab === "generate" && generatedImageUrl) {
        // Use the AI-generated image URL
        imageUrl = generatedImageUrl;
      } else if (activeTab === "url" && customUrl) {
        // Use the user provided URL
        imageUrl = customUrl;
      } else {
        throw new Error("No image to save in current tab");
      }

      // Update article with the thumbnail_url
      const response = await axiosInstance.patch(
        `/api/v1/blogs/${blogs?.id}/articles/${articleId}`,
        {
          article: {
            thumbnail_url: imageUrl,
          },
        },
      );

      return response.data;
    },
    onSuccess: (data) => {
      if (data?.thumbnail_url) {
        onSuccess(data.thumbnail_url);
        handleClose();
      }
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error || "Failed to save thumbnail");
    },
  });

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError("Invalid file format. Supported: PNG, JPG, JPEG, WebP");
      return false;
    }

    if (file.size > maxSize) {
      setError("File size exceeds 10MB limit");
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSaveCover = () => {
    if (
      (activeTab === "upload" && selectedFile) ||
      (activeTab === "generate" && generatedImageUrl) ||
      (activeTab === "url" && customUrl)
    ) {
      saveCoverMutation.mutate();
    }
  };

  const handleMagicPrompt = () => {
    // Extract summary from article content (first 3 lines or 200 chars)
    const textContent = articleContent?.replace(/<[^>]*>/g, " ").trim() || "";
    const summary = textContent
      .split("\n")
      .slice(0, 3)
      .join(" ")
      .trim()
      .substring(0, 200);

    const magicPrompt = `A creative thumbnail for an article titled "${articleTitle}". Context: ${summary}`;
    setCustomPrompt(magicPrompt);
  };

  const handleGenerate = () => {
    if (!articleId) {
      setError("Please save the article first before generating a thumbnail");
      return;
    }
    if (!articleTitle?.trim()) {
      setError("Article must have a title to generate thumbnail");
      return;
    }
    generateMutation.mutate();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
    setIsDragging(false);
    setCustomPrompt("");
    setCustomUrl("");
    setActiveTab("upload");
    onClose();
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Add Cover Image
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="generate">Generate AI</TabsTrigger>
            <TabsTrigger value="url">Link</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                min-h-[300px] border-2 border-dashed rounded-lg 
                flex items-center justify-center cursor-pointer
                transition-colors
                ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              {previewUrl ? (
                <div className="relative w-full h-full p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePreview();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 p-8 text-center">
                  <Upload className="h-12 w-12 opacity-50" />
                  <p className="font-medium">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    PNG, JPG, JPEG, WebP (max 10MB)
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            {/* Custom Prompt Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
                <Button
                  size="sm"
                  onClick={handleMagicPrompt}
                  className="bg-[#104127] hover:bg-[#0A2918] text-white text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Magic Prompt
                </Button>
              </div>
              <Textarea
                id="prompt"
                placeholder="Describe the thumbnail you want... (Leave empty to use article title and content)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Selected Style Info */}
            <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg border-gray-200">
              {generateMutation.isPending ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <p>Generating your thumbnail...</p>
                  <p className="text-sm text-gray-400">
                    This may take 5-15 seconds
                  </p>
                </div>
              ) : previewUrl ? (
                <div className="relative w-full h-full p-4">
                  <img
                    src={previewUrl}
                    alt="Generated preview"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500 p-8 text-center">
                  <Sparkles className="h-12 w-12 opacity-50" />
                  <p className="font-medium">Generate a thumbnail using AI</p>
                  <p className="text-sm text-gray-400 max-w-md">
                    We'll create a cover image based on your article title,
                    content, and blog's thumbnail style
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={
                      !articleTitle?.trim() ||
                      !articleId ||
                      generateMutation.isPending
                    }
                    className="mt-2"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Thumbnail
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="coverUrl">Image URL</Label>
              <Input
                id="coverUrl"
                placeholder="https://example.com/image.jpg"
                value={customUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCustomUrl(e.target.value)
                }
                className="text-sm"
              />
            </div>
            {customUrl && (
              <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg border-gray-200">
                <div className="relative w-full h-full p-4">
                  <img
                    src={customUrl}
                    alt="URL preview"
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ""; // Clear broken image
                      setError("Failed to load image from URL");
                    }}
                    onLoad={() => setError(null)}
                  />
                </div>
              </div>
            )}
            {error && activeTab === "url" && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCover}
            disabled={
              (activeTab === "upload" && !selectedFile) ||
              (activeTab === "generate" && !generatedImageUrl) ||
              (activeTab === "url" && !customUrl) ||
              saveCoverMutation.isPending
            }
          >
            {saveCoverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Cover"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
