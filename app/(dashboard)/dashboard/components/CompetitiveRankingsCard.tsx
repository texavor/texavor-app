import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompetitiveRanking } from "../types/aeo.types";
import {
  Trophy,
  Target,
  BarChart2,
  ArrowUpRight,
  Monitor,
  LayoutGrid,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CompetitiveRankingsCardProps {
  rankings: CompetitiveRanking[];
}

export const CompetitiveRankingsCard: React.FC<
  CompetitiveRankingsCardProps
> = ({ rankings }) => {
  if (!rankings || rankings.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-none shadow-none h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Competitive Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No active competitors
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for SOV Chart
  const chartData = rankings.slice(0, 5).map((r) => ({
    name: r.competitor_name,
    sov: r.share_of_voice,
    pos: r.average_position || 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
            {payload[0].payload.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-green-600 font-bold flex justify-between gap-4 font-inter">
              <span>SOV:</span>
              <span>{payload[0].value.toFixed(1)}%</span>
            </p>
            <p className="text-xs text-slate-500 flex justify-between gap-4">
              <span>Avg Pos:</span>
              <span>
                #
                {payload[0].payload.pos > 0
                  ? payload[0].payload.pos.toFixed(1)
                  : "-"}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white font-poppins tracking-tight">
            <span>Competitive Landscape</span>
            {rankings.length > 0 && (
              <span className="flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground rounded-lg border border-primary/10">
                {rankings.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Analyze your brand's market share and ranking position
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-slate-200 dark:border-zinc-800 text-slate-500 gap-1.5 py-1 px-4 h-9 rounded-xl bg-white dark:bg-zinc-900"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">
            Market Overview
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Chart Column */}
        <Card className="lg:col-span-3 bg-white dark:bg-zinc-900 border-none shadow-none overflow-hidden h-[420px]">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Market Share of Voice
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[360px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                  interval={0}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  unit="%"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="sov" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#104127"
                          : index === 1
                            ? "#166534"
                            : "#CBD5E1"
                      }
                      fillOpacity={index === 0 ? 1 : index === 1 ? 0.8 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Ranking List - MetricCard Style */}
        <div className="lg:col-span-1 space-y-4">
          <div className="px-1 text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4" />
            Top Performers
          </div>
          <div className="space-y-4">
            {rankings.slice(0, 3).map((ranking, index) => (
              <MetricCard
                key={ranking.competitor_id}
                type={index === 0 ? "primary" : "secondary"}
                label={ranking.competitor_name}
                value={`${ranking.share_of_voice.toFixed(0)}%`}
                gaugeValue={ranking.share_of_voice}
                className="min-h-0 p-5"
                labelClassName="text-sm"
                icon={
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]",
                      index === 0
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400",
                    )}
                  >
                    #{index + 1}
                  </div>
                }
                subtext={
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          index === 0 ? "text-white/60" : "text-slate-400",
                        )}
                      >
                        Market SOV
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-4.5 px-1.5 border-none font-bold uppercase tracking-tighter",
                          index === 0
                            ? "bg-white/10 text-white"
                            : "bg-slate-50 text-slate-500",
                        )}
                      >
                        Pos: #{ranking.average_position?.toFixed(1) || "-"}
                      </Badge>
                      <ArrowUpRight
                        className={cn(
                          "w-3 h-3",
                          index === 0 ? "text-white/60" : "text-green-500",
                        )}
                      />
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import MetricCard from "../MetriCard";
import { cn } from "@/lib/utils";
