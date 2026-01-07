"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomTabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  compact?: boolean;
}

export function CustomTabs({
  items,
  value,
  onValueChange,
  className,
  listClassName,
  triggerClassName,
  compact = false,
}: CustomTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("w-auto", className)}
    >
      <TabsList
        className={cn(
          "bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 gap-1",
          compact ? "h-10 items-center bg-white" : "h-auto",
          listClassName
        )}
      >
        {items.map((item) => {
          const isActive = value === item.value;
          const content = (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "cursor-pointer font-medium transition-all flex items-center justify-center",
                compact
                  ? cn(
                      "rounded-md p-0 h-8 w-8 border border-transparent hover:bg-gray-100",
                      isActive
                        ? "bg-[#104127] text-white shadow-md hover:bg-[#104127]"
                        : "bg-transparent text-gray-500"
                    )
                  : "rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm",
                triggerClassName
              )}
            >
              {item.icon && (
                <span className={cn(compact ? "h-4 w-4" : "mr-2 h-4 w-4")}>
                  {item.icon}
                </span>
              )}
              {!compact && item.label}
            </TabsTrigger>
          );

          if (compact) {
            return (
              <TooltipProvider key={item.value}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return content;
        })}
      </TabsList>
    </Tabs>
  );
}
