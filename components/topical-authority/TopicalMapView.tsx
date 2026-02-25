import React from "react";
import { FolderTree, FileText } from "lucide-react";

interface MapData {
  seed_topic: string;
  total_nodes: number;
  pillars: Array<{
    title: string;
    description: string;
    relevance_score: number;
    subtopics: Array<{
      title: string;
      relevance_score: number;
      supporting_articles: Array<{
        title: string;
        relevance_score: number;
      }>;
    }>;
  }>;
}

export function TopicalMapView({ data }: { data: MapData }) {
  if (!data || !data.pillars) return null;

  return (
    <div className="bg-white border-none shadow-none font-poppins h-full">
      <div className="mb-6 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-[#104127]" />
          Authority Map: {data.seed_topic}
        </h2>
        <p className="text-sm text-gray-500 font-inter mt-1">
          {data.total_nodes} Total Nodes Generated
        </p>
      </div>

      <div className="space-y-8">
        {data.pillars.map((pillar, pIdx) => (
          <div
            key={pIdx}
            className="bg-[#f9f4f0]/50 p-6 rounded-xl border-none shadow-none"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-[#104127] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#104127] text-white flex items-center justify-center text-sm">
                    {pIdx + 1}
                  </span>
                  {pillar.title}
                </h3>
                {pillar.description && (
                  <p className="text-gray-600 font-inter mt-2 text-sm max-w-2xl">
                    {pillar.description}
                  </p>
                )}
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border-none shadow-none">
                Score: {pillar.relevance_score}
              </span>
            </div>

            <div className="pl-4 mt-6 space-y-6">
              {pillar.subtopics?.map((subtopic, sIdx) => (
                <div key={sIdx} className="relative">
                  <div className="bg-white p-4 rounded-lg border-none shadow-none">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-gray-400" />
                        {subtopic.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        Score: {subtopic.relevance_score}
                      </span>
                    </div>

                    <div className="pl-4 mt-3 space-y-2">
                      {subtopic.supporting_articles?.map((article, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center gap-2 text-sm font-inter text-gray-600 bg-gray-50 p-2 rounded border-none shadow-none group transition-colors"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="flex-1 truncate">
                            {article.title}
                          </span>
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Relevance: {article.relevance_score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
