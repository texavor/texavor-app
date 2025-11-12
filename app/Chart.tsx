"use client";

import React, { useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  ReferenceLine,
  ReferenceDot,
  Label,
} from "recharts";

const Chart = () => {
  const [chartData, setChartDate] = useState<any>([
    { month: "January", easywrite: 10, alone: 10 },
    { month: "February", easywrite: 15, alone: 12 },
    { month: "March", easywrite: 20, alone: 14 },
    { month: "April", easywrite: 25, alone: 16 },
    { month: "May", easywrite: 40, alone: 20 },
    { month: "June", easywrite: 50, alone: 25 },
  ]);
  const chartConfig = {
    easywrite: {
      lable: "EasyWrite",
      color: "#104127",
    },
    alone: {
      lable: "Alone",
      color: "#00000014",
    },
  };

  const CustomTooltip = ({ viewBox, value }: any) => {
    const { x, y } = viewBox;
    return (
      <foreignObject x={x - 60} y={y - 35} width="120" height="30">
        <div
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "10px",
          }}
        >
          {value}
        </div>
      </foreignObject>
    );
  };

  return (
    <div className="w-full text-center space-y-0 mt-40">
      <p className="text-[#0A2918] font-bold text-[48px]">
        Achieve Authority in Weeks, Not Quarters
      </p>
      <div className="flex justify-center">
        <p className="w-[60%] text-[#7A7A7A] font-normal">
          Stop the SEO guesswork. Our AI analyzes top-ranking content,
          identifies strategic gaps, and generates a data-driven plan so you can
          focus on what you do best: writing expert content that ranks.
        </p>
      </div>
      <div className="bg-white py-2 rounded-[12px] mt-5 relative">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <div className="absolute left-4 top-4">
            <div className="flex items-center gap-4">
              <div className="h-1 bg-[#104127] rounded-full w-10" />
              <p className="text-black font-base font-normal text-base">
                With EasyWrite
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-1 bg-[#EBEBEB] rounded-full w-10" />
              <p className="text-black font-base font-normal text-base">
                You Build it Alone
              </p>
            </div>
          </div>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 0,
            }}
          >
            <XAxis dataKey="month" hide />
            <ReferenceLine x="April" stroke="grey" strokeDasharray="8 8">
              <Label
                // value="1 Week"
                position="top"
                fill="black"
                fontSize={12}
                dy={-10}
              />
            </ReferenceLine>
            <ReferenceDot
              x="April"
              y={15}
              r={5}
              fill="#104127"
              stroke="white"
              strokeWidth={2}
            >
              <Label
                content={<CustomTooltip value="First Article Hits Page 1" />}
              />
            </ReferenceDot>
            <Line
              dataKey="easywrite"
              type="natural"
              stroke="var(--color-easywrite)"
              strokeWidth={4}
              dot={false}
            />
            <Line
              dataKey="alone"
              type="natural"
              stroke="var(--color-alone)"
              strokeWidth={4}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      {false && (
        <>
          <p className="text-[#0A2918] font-medium text-[32px] mt-5 leading-8">
            "We went from publishing articles into the void to hitting the first
            page of Google for a competitive keyword in under a month. This tool
            completely changed our content strategy from guesswork to a
            science."
          </p>
          <div className="flex justify-center">
            <p className="w-[60%] text-[#7A7A7A] font-normal">
              Stop the SEO guesswork. Our AI analyzes top-ranking content,
              identifies strategic gaps, and generates a data-driven plan so you
              can focus on what you do best: writing expert content that ranks.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Chart;
