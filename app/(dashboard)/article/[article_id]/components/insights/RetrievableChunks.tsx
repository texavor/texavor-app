import React, { useState } from "react";
import { RetrievableChunk } from "./types";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RetrievableChunksProps {
  chunks: RetrievableChunk[];
}

export const RetrievableChunks = ({ chunks }: RetrievableChunksProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!chunks || chunks.length === 0) return null;

  const displayChunks = isExpanded ? chunks : chunks.slice(0, 3);

  return (
    <div className="bg-primary/5 rounded-xl overflow-hidden">
      <div
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#104127]" />
          <h4 className="font-bold text-gray-900 text-sm">
            Retrievable Chunks
          </h4>
          <span className="bg-primary/10 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
            {chunks.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      <div className="p-4 space-y-3">
        {displayChunks.map((chunk, idx) => (
          <div key={idx} className="bg-white/40 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#104127] bg-[#104127]/10 px-1.5 py-0.5 rounded-md">
                {chunk.type}
              </span>
              <span className="text-[10px] font-bold text-green-600 bg-green-50/50 px-1.5 py-0.5 rounded-full">
                Score: {chunk.score}
              </span>
            </div>
            <p className="text-xs text-gray-700 italic border-l-2 border-[#104127]/30 pl-2">
              "{chunk.text}"
            </p>
            <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
              <span className="font-semibold text-gray-500">Why:</span>{" "}
              {chunk.reason}
            </div>
          </div>
        ))}

        {!isExpanded && chunks.length > 3 && (
          <Button
            variant="ghost"
            className="w-full text-xs text-gray-500 hover:text-gray-900"
            onClick={() => setIsExpanded(true)}
          >
            View all {chunks.length} chunks
          </Button>
        )}
      </div>
    </div>
  );
};
