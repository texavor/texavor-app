"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

interface ImageGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
  initialPrompt?: string;
  initialStyle?: string;
}

export function ImageGenerationDialog({
  isOpen,
  onClose,
  onInsert,
  initialPrompt = "",
  initialStyle = "natural",
}: ImageGenerationDialogProps) {
  const { blogs } = useAppStore();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState(initialStyle);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state with props when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setStyle(initialStyle);
    }
  }, [isOpen, initialPrompt, initialStyle]);

  // Update resolution defaults when style changes
  useEffect(() => {
    if (style === "thumbnail") {
      setWidth(blogs?.thumbnail_width || 1000);
      setHeight(blogs?.thumbnail_height || 420);
    } else {
      setWidth(1024);
      setHeight(1024);
    }
  }, [style, blogs]);

  // Validation helper
  const validateResolution = () => {
    const w = Number(width);
    const h = Number(height);

    if (w < 256 || w > 2048 || h < 256 || h > 2048) {
      setError("Dimensions must be between 256 and 2048 pixels");
      return false;
    }

    if (w * h > 4194304) {
      setError("Total pixels cannot exceed 4,194,304 (e.g., 2048x2048)");
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!validateResolution()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/generations`,
        {
          prompt,
          style,
          width: Number(width),
          height: Number(height),
        }
      );

      if (res.data?.url) {
        setGeneratedUrl(res.data.url);
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("Image generation error:", err);
      setError("An error occurred while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    if (generatedUrl) {
      onInsert(generatedUrl);
      onClose();
      // Reset state after closing
      setTimeout(() => {
        setPrompt("");
        setStyle("natural");
        setWidth(1024);
        setHeight(1024);
        setGeneratedUrl(null);
        setError(null);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Image with AI
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., A bar chart showing 300% growth in Q1)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural (Default)</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="graphic">Graphic</SelectItem>
                <SelectItem value="thumbnail">Thumbnail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                min={256}
                max={2048}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                placeholder="1024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                min={256}
                max={2048}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                placeholder="1024"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Resolution: 256-2048px. Max total pixels: 4,194,304
          </p>

          {/* Preview Area */}
          <div className="mt-4 min-h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p>Generating your image...</p>
              </div>
            ) : generatedUrl ? (
              <img
                src={generatedUrl}
                alt="Generated preview"
                className="w-full h-full object-contain"
              />
            ) : error ? (
              <div className="text-red-500 text-center px-4">
                <p>{error}</p>
                <Button
                  variant="link"
                  onClick={() => setError(null)}
                  className="mt-2"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="h-12 w-12 opacity-20" />
                <p>Preview will appear here</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {!generatedUrl ? (
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedUrl(null)} // Reset to generate again
                >
                  Regenerate
                </Button>
                <Button onClick={handleInsert}>Insert Image</Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
