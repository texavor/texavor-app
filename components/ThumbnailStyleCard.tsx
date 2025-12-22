"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

interface ThumbnailStyleCardProps {
  style: ThumbnailStyle;
  isSelected?: boolean;
  onSelect: (styleId: string) => void;
}

export function ThumbnailStyleCard({
  style,
  isSelected = false,
  onSelect,
}: ThumbnailStyleCardProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden transition-all ${
        isSelected ? "bg-primary/5" : "bg-white"
      }`}
    >
      {/* Preview Image */}
      <div className="relative">
        <img
          src={style.preview_url}
          alt={style.name}
          className="w-full h-48 object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Style Info */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base">{style.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              style.variation_type === "minimal"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {style.variation_type === "minimal" ? "🔒 Minimal" : "🎨 Full"}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {style.description}
        </p>

        {/* Color Palette */}
        <div className="flex gap-2 mb-3">
          {style.colors.map((color, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded border border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>Text: {style.text_placement}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎨</span>
            <span>
              Icon:{" "}
              {style.icon_style || style.visual_elements?.join(", ") || "N/A"}
            </span>
          </div>
        </div>

        {/* Select Button */}
        <Button
          onClick={() => onSelect(style.id)}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          disabled={isSelected}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            "Select Style"
          )}
        </Button>
      </div>
    </div>
  );
}
