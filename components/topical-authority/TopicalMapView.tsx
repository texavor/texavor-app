import React, { useState } from "react";
import { ChevronRight, Network, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArticleCard,
  ArticleNode,
} from "@/components/topical-authority/ArticleCard";

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
      supporting_articles: ArticleNode[];
    }>;
  }>;
}

export function TopicalMapView({ data }: { data: MapData }) {
  const [activeSubtopic, setActiveSubtopic] = useState<{
    pillarTitle: string;
    subtopicTitle: string;
    articles: ArticleNode[];
  } | null>(null);

  if (!data || !data.pillars) return null;

  const totalPillars = data.pillars.length;
  const totalSubtopics = data.pillars.reduce(
    (acc, p) => acc + (p.subtopics?.length || 0),
    0,
  );
  const totalArticles = data.pillars.reduce(
    (acc, p) =>
      acc +
      p.subtopics.reduce(
        (subAcc, s) => subAcc + (s.supporting_articles?.length || 0),
        0,
      ),
    0,
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] font-inter overflow-hidden">
      {/* Compact top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 font-poppins">
            {data.seed_topic}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">{totalPillars}</span>
            Pillars
          </span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">
              {totalSubtopics}
            </span>
            Subtopics
          </span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">{totalArticles}</span>
            Articles
          </span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">
              {data.total_nodes}
            </span>
            Total
          </span>
        </div>
      </div>

      {/* Two-Pane Explorer — fixed height, only inner panes scroll */}
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl">
        {/* Left Pane */}
        <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col min-h-0 shrink-0">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="p-2">
              <Accordion
                type="single"
                collapsible
                defaultValue="pillar-0"
                className="w-full space-y-1"
              >
                {data.pillars.map((pillar, pIdx) => (
                  <AccordionItem
                    key={pIdx}
                    value={`pillar-${pIdx}`}
                    className="border-none rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-3 py-2.5 text-sm font-semibold hover:no-underline hover:bg-gray-50 data-[state=open]:bg-gray-50 transition-all rounded-lg">
                      <div className="flex items-start gap-2 text-left min-w-0">
                        <span className="shrink-0 w-5 h-5 rounded bg-[#104127]/10 text-[#104127] flex items-center justify-center text-[11px] font-bold mt-0.5">
                          {pIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                            Pillar
                          </span>
                          <span className="text-gray-800 break-words whitespace-normal text-left leading-snug block text-sm">
                            {pillar.title}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 px-1">
                      <div className="space-y-0.5 ml-5 pl-3 border-l border-gray-200">
                        {pillar.subtopics?.map((subtopic, sIdx) => {
                          const isActive =
                            activeSubtopic?.subtopicTitle === subtopic.title &&
                            activeSubtopic?.pillarTitle === pillar.title;
                          const articleCount =
                            subtopic.supporting_articles?.length || 0;
                          return (
                            <button
                              key={sIdx}
                              onClick={() =>
                                setActiveSubtopic({
                                  pillarTitle: pillar.title,
                                  subtopicTitle: subtopic.title,
                                  articles: subtopic.supporting_articles || [],
                                })
                              }
                              className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-all block
                                ${
                                  isActive
                                    ? "bg-[#104127] text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }
                              `}
                            >
                              <span className="break-words whitespace-normal leading-snug block">
                                {subtopic.title}
                              </span>
                              <span
                                className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                                  isActive ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                <FileText className="w-3 h-3" />
                                {articleCount} article
                                {articleCount !== 1 ? "s" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-white flex flex-col min-h-0">
          {!activeSubtopic ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <ChevronRight className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                Select a subtopic to view articles
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Subtopic header */}
              <div className="px-6 py-3 border-b border-gray-100 shrink-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {activeSubtopic.pillarTitle}
                </p>
                <h3 className="text-base font-semibold text-gray-900 font-poppins">
                  {activeSubtopic.subtopicTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeSubtopic.articles.length} article
                  {activeSubtopic.articles.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Articles — only this area scrolls */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <div className="p-5 space-y-3">
                  {activeSubtopic.articles.length > 0 ? (
                    activeSubtopic.articles.map((article, idx) => (
                      <ArticleCard
                        key={idx}
                        article={article}
                        index={idx + 1}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      No articles mapped for this subtopic.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
