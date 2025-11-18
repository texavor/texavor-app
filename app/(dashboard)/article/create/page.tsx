"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";
import { ScoreMeter, Gauge } from "@/components/ScoreMeter";

const CreateArticlePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [tags, setTags] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true); // Default to true

  const handleAnalyzeClick = () => {
    setIsAnalyzing(true);
    // Simulate a backend call
    setTimeout(() => {
      console.log("Backend call for analysis complete!");
      // In a real scenario, you would make an actual API call here
      // and update the state with the results.
      setIsAnalyzing(false);
    }, 2000);
  };

  const toggleMetricsVisibility = () => {
    setShowMetrics((prev) => !prev);
  };

  useEffect(() => {
    // Load preference from localStorage
    const storedPreference = localStorage.getItem("showMetrics");
    if (storedPreference !== null) {
      setShowMetrics(JSON.parse(storedPreference));
    }
  }, []);

  useEffect(() => {
    // Save preference to localStorage whenever it changes
    localStorage.setItem("showMetrics", JSON.stringify(showMetrics));
  }, [showMetrics]);

  useEffect(() => {
    // Calculate word count and reading time
    const words = content.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);

    // Average reading time is 225 words per minute
    const time = Math.ceil(count / 225);
    setReadingTime(time);
  }, [content]);

  return (
    <div>
      <div className="flex justify-between gap-2">
        <div className={`space-y-6 ${showMetrics ? "w-8/12" : "w-full"}`}> {/* Dynamic width for left side */}
          <div className="bg-white rounded-xl">
            <div className="p-4">
              <Textarea
                id="title"
                placeholder="Article Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none h-40 font-poppins text-4xl font-semibold tracking-tight h-auto p-0 focus-visible:ring-0 resize-none shadow-none no-scrollbar"
                rows={2}
              />
            </div>
          </div>
          <Editor value={content} onChange={setContent} />
        </div>

        {/* Right Sidebar: Settings */}
        <div className={`bg-white max-h-[calc(100vh-100px)] p-4 rounded-xl no-scrollbar overflow-y-auto ${showMetrics ? "w-full lg:w-4/12" : "w-12"}`}> {/* Dynamic width for right sidebar */}
          {showMetrics ? (
            <div className="space-y-6">
              <div className="flex justify-end mb-4"> {/* Toggle button inside when metrics are shown */}
                <Button
                  onClick={toggleMetricsVisibility}
                  variant="outline"
                  className="text-sm"
                >
                  Hide Metrics
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black capitalize font-poppins">
                    Content Insights
                  </h3>
                  <Button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzing}
                    className="text-sm"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Article"}
                  </Button>
                </div>
                <p className="text-sm font-inter text-gray-700 bg-gray-100 p-2 rounded-md">
                  Keyword Count
                </p>
                <div className="space-y-4">
                  <Gauge label="Difficulty" value={wordCount} />
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-black font-poppins">
                        Minute Read
                      </p>
                      <p className="text-sm font-inter">{readingTime}/10</p>
                    </div>
                    <ScoreMeter value={readingTime / 1000} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-black font-poppins">
                        Authority Score
                      </p>
                      <p className="text-sm font-inter">{8}</p>
                    </div>
                    <ScoreMeter value={7} />
                  </div>
                </div>
              </div>
              {/* Proofreading Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-black capitalize font-poppins mb-2">
                    Proofreading Suggestions
                  </h3>
                  <ul className="list-disc list-inside text-sm font-inter text-gray-700 bg-gray-100 p-2 rounded-md space-y-1">
                    <li>Suggestion 1: Check for passive voice.</li>
                    <li>Suggestion 2: Improve sentence clarity.</li>
                    <li>Suggestion 3: Correct grammar errors.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black capitalize font-poppins mb-2">
                    Proofreading Indicators
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Grammar Score
                        </p>
                        <p className="text-sm font-inter">{95}</p>
                      </div>
                      <ScoreMeter value={0.95} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Readability Score
                        </p>
                        <p className="text-sm font-inter">{80}</p>
                      </div>
                      <ScoreMeter value={0.80} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Plagiarism Score
                        </p>
                        <p className="text-sm font-inter">{5}</p>
                      </div>
                      <ScoreMeter value={0.05} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          Sentiment Score
                        </p>
                        <p className="text-sm font-inter">{75}</p>
                      </div>
                      <ScoreMeter value={0.75} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-black font-poppins">
                          SEO Score
                        </p>
                        <p className="text-sm font-inter">{60}</p>
                      </div>
                      <ScoreMeter value={0.60} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Button
                onClick={toggleMetricsVisibility}
                variant="outline"
                className="text-sm rotate-90" // Rotate button to make it look like a tab
              >
                Show Metrics
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateArticlePage;
