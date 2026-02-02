import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { AeoVisibilityScore } from "../types/aeo.types";

interface VisibilityTrendChartProps {
  historicalScores: AeoVisibilityScore[];
}

export const VisibilityTrendChart: React.FC<VisibilityTrendChartProps> = ({
  historicalScores,
}) => {
  if (!historicalScores || historicalScores.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            30-Day Visibility Trend
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

  const chartData = historicalScores.map((score) => ({
    date: new Date(score.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: score.overall_score,
    presenceRate: score.presence_rate,
  }));

  return (
    <Card className="bg-white dark:bg-zinc-900 border-border/50 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          30-Day Visibility Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#104127"
              strokeWidth={2}
              name="Visibility Score"
              dot={{ fill: "#104127", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="presenceRate"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Presence Rate"
              dot={{ fill: "#3b82f6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
