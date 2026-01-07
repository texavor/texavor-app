import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Analysis } from "@/lib/api/competitors";
import { format } from "date-fns";

interface AIAuthorityChartProps {
  data: Analysis[];
}

export function AIAuthorityChart({ data }: AIAuthorityChartProps) {
  // Sort data by date ascending for the chart
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const chartData = sortedData.map((analysis) => ({
    date: analysis.created_at,
    score: analysis.llm_share_of_voice || 0,
    seo: analysis.seo_score || 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No historical data available.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full mt-6">
      <h4 className="text-sm font-medium mb-4 text-gray-700">
        Authority Over Time
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), "MMM d")}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 100]}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="AI Authority"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorScore)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
