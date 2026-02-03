import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AeoVisibilityScore } from "../types/aeo.types";

interface VisibilityTrendChartProps {
  historicalScores: AeoVisibilityScore[];
}

export const VisibilityTrendChart: React.FC<VisibilityTrendChartProps> = ({
  historicalScores,
}) => {
  if (!historicalScores || historicalScores.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Visibility Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No historical data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Reverse if needed, assuming API returns desc or asc. usually charts need asc.
  // API returns historical_scores list. Check logic. Usually [today, yesterday...] or vice-versa.
  // If it's desc, we should reverse for chart (left to right = old to new).
  // Assuming API gives sorted by date descending (newest first). Let's reverse to show timeline left-right.
  const sortedScores = [...historicalScores].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const chartData = sortedScores.map((score) => ({
    date: new Date(score.date).toLocaleDateString("en-US", {
      weekday: "narrow", // S, M, T... like the image
    }),
    fullDate: new Date(score.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: score.overall_score,
  }));

  // Take last 7 days for the "Project Analytics" view style if data is abundant,
  // or just show what we have. User liked the specific card look.
  // displaying 30 days with S/M/T... repeated is confusing.
  // I'll show the last 7-10 days to match the aesthetic, or keep it manageable.
  // Let's stick to last 7 days for the cleanest "dashboard" look, as per the image reference.
  const recentData = chartData.slice(-7);

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Visibility Trend
          </CardTitle>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
            Last 7 Days
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentData} barSize={40}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg py-1 px-2 shadow-xl">
                        <p className="font-semibold mb-0.5">
                          {payload[0].payload.fullDate}
                        </p>
                        <p>Score: {Number(payload[0].value).toFixed(1)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="score"
                fill="#104127"
                radius={[20, 20, 20, 20]} // Fully rounded pill shape
                // background={{ fill: '#f1f5f9', radius: [20, 20, 20, 20] }} // Optional track background
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
