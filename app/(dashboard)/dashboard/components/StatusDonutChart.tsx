"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";

const data = [
  { name: "Published", value: 124, color: "#6366F1" },
  { name: "Drafts", value: 86, color: "#60A5FA" },
  { name: "Scheduled", value: 47, color: "#F59E0B" },
];

export const StatusDonutChart = () => {
  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold font-poppins text-gray-900">
          Article Status
        </CardTitle>
        <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <ArrowUp className="w-3 h-3 mr-1" />
          +6.2%
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-[280px] w-full relative my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={115}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-500 font-medium font-inter">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{item.value}</span>
                <span className="text-gray-400 text-xs font-normal w-8 text-right">
                  {Math.round(
                    (item.value /
                      data.reduce((acc, curr) => acc + curr.value, 0)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
