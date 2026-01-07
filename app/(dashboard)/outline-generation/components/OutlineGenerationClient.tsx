"use client";

import React, { useState, Suspense } from "react";
import { OutlineForm } from "./OutlineForm";
import { OutlineEditor } from "./OutlineEditor";
import { SavedOutlinesList } from "./SavedOutlinesList";
import { RecentSearches } from "@/components/dashboard/RecentSearches";
import { useOutlineApi, OutlineData } from "../hooks/useOutlineApi";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Plus, List, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "generate" | "saved" | "editor";

function OutlineGenerationLoading() {
  return (
    <div className="flex justify-center items-center mt-8 text-center bg-white p-12 rounded-xl w-full h-full">
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      <p className="font-poppins font-medium">Loading...</p>
    </div>
  );
}

function OutlineGenerationContent() {
  const [view, setView] = useState<ViewMode>("generate");
  const [currentOutline, setCurrentOutline] = useState<OutlineData | null>(
    null
  );
  const [editorKey, setEditorKey] = useState(0);
  const [prefilledTopic, setPrefilledTopic] = useState("");
  const searchParams = useSearchParams();
  const outlineId = searchParams.get("id");
  const topicParam = searchParams.get("topic");

  const {
    generateOutline,
    savedOutlines,
    saveOutline,
    updateOutline,
    deleteOutline,
  } = useOutlineApi();

  // Load outline from URL ID or Topic
  useEffect(() => {
    if (outlineId) {
      // Redirect to the new dynamic route
      window.location.href = `/outline-generation/${outlineId}`;
    } else if (topicParam) {
      setPrefilledTopic(decodeURIComponent(topicParam));
    }
  }, [outlineId, topicParam]);

  const handleGenerate = (data: {
    topic: string;
    aeo_optimization: boolean;
  }) => {
    setPrefilledTopic(data.topic);
    generateOutline.mutate(
      { topic: data.topic, aeo_optimization: data.aeo_optimization },
      {
        onSuccess: (data) => {
          setCurrentOutline(data);
          setEditorKey((prev) => prev + 1);
          setView("editor");
        },
      }
    );
  };

  const handleSave = (data: OutlineData) => {
    if (data.id) {
      updateOutline.mutate(
        { id: data.id, outline: data },
        {
          onSuccess: (updated) => {
            setCurrentOutline(updated);
          },
        }
      );
    } else {
      saveOutline.mutate(data, {
        onSuccess: (saved) => {
          setCurrentOutline(saved);
        },
      });
    }
  };

  const handleSelectSaved = (outline: OutlineData) => {
    setCurrentOutline(outline);
    setEditorKey((prev) => prev + 1);
    setView("editor");
  };

  return (
    <div className="space-y-6 w-full h-full">
      {/* Top Section: Form and Recent Searches */}
      <div className="flex flex-col lg:flex-row gap-4 max-h-[170px]">
        <div className="w-full lg:w-8/12">
          <OutlineForm
            key={prefilledTopic} // Force re-render when prefilled topic changes
            onSubmit={handleGenerate}
            isPending={generateOutline.isPending}
            initialValues={
              prefilledTopic ? { topic: prefilledTopic } : undefined
            }
          />
        </div>
        <div className="w-full lg:w-4/12">
          <RecentSearches
            type="outline_generation"
            onSelect={(topic) =>
              handleGenerate({ topic, aeo_optimization: false })
            }
          />
        </div>
      </div>

      {/* Bottom Section: Editor and Metrics */}
      {generateOutline.isPending && (
        <div className="flex justify-center items-center mt-8 text-center bg-white p-12 rounded-xl w-full">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="font-poppins font-medium">Generating outline...</p>
        </div>
      )}
      {!generateOutline.isPending && currentOutline && (
        <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left: Editor */}
          <div className="w-full lg:w-8/12">
            <OutlineEditor
              key={editorKey}
              initialData={currentOutline}
              onSave={handleSave}
              onChange={(updatedOutline) => setCurrentOutline(updatedOutline)}
              isSaving={saveOutline.isPending || updateOutline.isPending}
            />
          </div>

          {/* Right: Metrics & Navigation */}
          <div className="w-full lg:w-4/12">
            <div className="sticky top-4 space-y-4">
              {/* Metrics */}
              <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
                <h3 className="font-poppins text-lg font-semibold text-gray-900">
                  Outline Metrics
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                      Est. Word Count
                    </span>
                    <span className="text-2xl font-bold text-[#104127]">
                      {currentOutline.estimated_word_count?.toLocaleString() ||
                        "0"}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">words</span>
                  </div>

                  {currentOutline.target_keywords &&
                    currentOutline.target_keywords.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-2">
                          Target Keywords
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentOutline.target_keywords.map(
                            (keyword, idx) => (
                              <span
                                key={idx}
                                className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-100"
                              >
                                {keyword}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {currentOutline.tone && (
                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Tone
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {currentOutline.tone}
                      </span>
                    </div>
                  )}

                  {currentOutline.target_audience && (
                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Audience
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {currentOutline.target_audience}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table of Contents Navigation */}
              <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
                <h3 className="font-poppins text-base font-semibold text-gray-900">
                  Outline Structure
                </h3>
                <div className="space-y-1 max-h-[calc(100vh-530px)] overflow-y-auto no-scrollbar pr-2">
                  <button
                    onClick={() => {
                      document
                        .getElementById("outline-intro")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Introduction
                  </button>

                  {currentOutline.sections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        document
                          .getElementById(`outline-section-${idx}`)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 pl-4"
                    >
                      <span className="text-gray-400 text-xs">{idx + 1}.</span>
                      <span className="truncate">{section.heading}</span>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      document
                        .getElementById("outline-conclusion")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Conclusion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!generateOutline.isPending && !currentOutline && (
        <div className="mt-8 text-center rounded-xl bg-white p-12 w-full">
          <p className="text-xl font-semibold font-poppins">
            No outline generated.
          </p>
          <p className="font-inter text-sm text-gray-400">
            Use the form above to get started or try a different topic.
          </p>
        </div>
      )}
    </div>
  );
}

const OutlineGenerationClient = () => {
  return (
    <Suspense fallback={<OutlineGenerationLoading />}>
      <OutlineGenerationContent />
    </Suspense>
  );
};

export default OutlineGenerationClient;
