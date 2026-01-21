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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/imageService";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, altText?: string) => void;
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onInsert,
}: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleInsert = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(selectedFile, altText || undefined);
      onInsert(url, altText || undefined);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
    setError(null);
    setIsDragging(false);
    setIsUploading(false);
    onClose();
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Insert Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              min-h-[250px] border-2 border-dashed rounded-lg 
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

          {/* Alt Text Input */}
          {previewUrl && (
            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text (Optional)</Label>
              <Input
                id="alt-text"
                placeholder="Describe the image for accessibility..."
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Helps screen readers and improves SEO
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!selectedFile || isUploading}
            className="bg-[#104127] hover:bg-[#0d3320] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Insert Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
