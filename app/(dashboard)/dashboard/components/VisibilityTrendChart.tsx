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
import { BarChart2, TrendingUp, Calendar, Target, Brain } from "lucide-react";
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

  const sortedScores = [...historicalScores].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const chartData = sortedScores.map((score) => ({
    date: new Date(score.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    }),
    fullDate: new Date(score.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    metric: score, // Pass full object for tooltip
    score: score.overall_score,
  }));

  const recentData = chartData.slice(-7);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metric = data.metric as AeoVisibilityScore;

      // Map API colors to Tailwind classes/hex
      const getColor = (color: string) => {
        switch (color) {
          case "green":
            return "#104127"; // Primary Green
          case "blue":
            return "#2563eb";
          case "yellow":
            return "#ca8a04";
          case "orange":
            return "#c2410c";
          case "red":
            return "#dc2626";
          default:
            return "#475569";
        }
      };

      const colorHex = getColor(metric.color);

      return (
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-zinc-800 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {data.fullDate}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: colorHex }}
            >
              {metric.interpretation}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Visibility Score
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {metric.overall_score.toFixed(1)}
              </span>
            </div>

            <div className="h-px bg-slate-100 dark:bg-zinc-800 my-2" />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Mentions
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {metric.total_mentions}{" "}
                  <span className="text-slate-400 font-normal">
                    / {metric.total_prompts_tested} prompts
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Platforms
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {metric.platforms_count} detected
                </span>
              </div>
            </div>

            {metric.trend && (
              <div className="mt-2 text-xs flex items-center justify-end gap-1">
                <span className="text-slate-400">Daily Change:</span>
                <span
                  className={`${metric.trend.change >= 0 ? "text-green-600" : "text-red-500"} font-bold`}
                >
                  {metric.trend.change > 0 ? "+" : ""}
                  {metric.trend.change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visibility Trend
          </CardTitle>
          {/* Badge removed as requested */}
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
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                dy={10}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "black", opacity: 0.05 }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="score" fill="#104127" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
