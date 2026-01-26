import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

export const ImageNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, editor } = props;
  const [caption, setCaption] = useState(node.attrs.alt || "");
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state with node attributes if they change externally
  useEffect(() => {
    setCaption(node.attrs.alt || "");
  }, [node.attrs.alt]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 150); // Hard limit 150 chars
    setCaption(value);
    updateAttributes({ alt: value });
  };

  const generateCaption = () => {
    try {
      if (!editor || caption) return; // Don't overwrite if exists

      const pos = props.getPos();
      if (typeof pos !== "number") return;

      // Resolve position to find preceding content
      // We look at the node immediately before the image
      const resolvedPos = editor.state.doc.resolve(pos);
      const nodeBefore = resolvedPos.nodeBefore;

      if (nodeBefore && nodeBefore.text && nodeBefore.text.trim()) {
        const text = nodeBefore.text.trim();
        // Heuristic: Take the last sentence or the last 100 chars
        // Simple split by period, take last non-empty chunk
        const sentences = text
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0);
        const lastSentence = sentences[sentences.length - 1]?.trim();

        if (lastSentence) {
          const generatedCaption = lastSentence.slice(0, 150); // Limit length
          setCaption(generatedCaption);
          updateAttributes({ alt: generatedCaption });
        }
      }
    } catch (error) {
      // Silent failure for auto-gen
    }
  };

  // Auto-generate on mount if empty
  useEffect(() => {
    if (!caption) {
      generateCaption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <NodeViewWrapper className="image-node-view relative group flex flex-col items-center my-0">
      <div
        className={cn(
          "relative rounded-lg overflow-hidden transition-all duration-200",
          // Removed selection ring as requested
        )}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          className="max-w-full h-auto rounded-lg shadow-sm m-0 block"
        />
      </div>

      <div className="mt-2 w-full max-w-lg flex flex-col items-center relative">
        <div className="relative w-full flex items-center justify-center group/input">
          <input
            type="text"
            value={caption}
            onChange={handleCaptionChange}
            placeholder="Write a caption..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "text-center text-sm text-gray-500 placeholder:text-gray-300 border-none focus:ring-0 focus:outline-none bg-transparent w-full transition-opacity duration-200",
              // Show input if: has caption, is focused, or image is selected/hovered
              caption || isFocused || selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
          />
        </div>
        {isFocused && (
          <span className="text-[10px] text-gray-300 mt-1 transition-opacity">
            {caption.length}/150
          </span>
        )}
      </div>
    </NodeViewWrapper>
  );
};
