"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlignLeft, Clock, FileText } from "lucide-react";

interface ContentInsightsData {
  total_words: number;
  avg_words_per_article: number;
  avg_reading_time_minutes: number;
}

interface ContentInsightsCardProps {
  data?: ContentInsightsData;
}

export const ContentInsightsCard = ({ data }: ContentInsightsCardProps) => {
  return (
    <Card className="border-none shadow-none bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold font-poppins text-gray-900">
          Content Insights
        </CardTitle>
        <p className="text-sm text-gray-500 font-inter">
          Metrics across all your articles
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          <div className="grid gap-2">
            {/* Total Words */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600 font-inter">
                  Total Words
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 font-inter">
                {data?.total_words?.toLocaleString() || 0}
              </span>
            </div>

            {/* Avg Words/Article */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-md">
                  <AlignLeft className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600 font-inter">
                  Avg Words / Article
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 font-inter">
                {data?.avg_words_per_article?.toLocaleString() || 0}
              </span>
            </div>

            {/* Avg Reading Time */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-md">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600 font-inter">
                  Avg Reading Time
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 font-inter">
                {data?.avg_reading_time_minutes || 0} min
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
