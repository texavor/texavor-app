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

const data = [
  { time: "18:00", consultations: 30, checkups: 45, followups: 20 },
  { time: "18:30", consultations: 45, checkups: 35, followups: 25 },
  { time: "19:00", consultations: 25, checkups: 55, followups: 15 },
  { time: "19:30", consultations: 50, checkups: 40, followups: 30 },
  { time: "20:00", consultations: 35, checkups: 60, followups: 20 },
];

export const ActivityChart = () => {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold font-poppins text-gray-900">
          Activity
        </CardTitle>
        <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs font-medium bg-white shadow-sm text-gray-900"
          >
            1D
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            1W
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            1M
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            1Y
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="time"
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
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: "20px" }}
              />
              <Line
                type="monotone"
                dataKey="consultations"
                name="Published"
                stroke="#6366F1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="checkups"
                name="Drafts"
                stroke="#60A5FA"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="followups"
                name="Scheduled"
                stroke="#F472B6"
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
