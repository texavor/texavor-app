"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARTICLE_STATUS_COLORS } from "@/lib/constants";

interface ActivityData {
  date: string;
  published: number;
  drafts: number;
  scheduled: number;
}

interface ActivityChartProps {
  data?: ActivityData[];
}

export const ActivityChart = ({ data = [] }: ActivityChartProps) => {
  return (
    <Card className="border-none shadow-none h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold font-poppins text-gray-900">
          Activity
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ARTICLE_STATUS_COLORS.published.chart }}
            />
            <span className="text-xs text-gray-500 font-medium">Published</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ARTICLE_STATUS_COLORS.draft.chart }}
            />
            <span className="text-xs text-gray-500 font-medium">Drafts</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ARTICLE_STATUS_COLORS.scheduled.chart }}
            />
            <span className="text-xs text-gray-500 font-medium">Scheduled</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* ... existing grid and axes ... */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Line
                type="monotone"
                dataKey="published"
                name="Published"
                stroke={ARTICLE_STATUS_COLORS.published.chart}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="drafts"
                name="Drafts"
                stroke={ARTICLE_STATUS_COLORS.draft.chart}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="scheduled"
                name="Scheduled"
                stroke={ARTICLE_STATUS_COLORS.scheduled.chart}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
