"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomTabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
}

export function CustomTabs({
  items,
  value,
  onValueChange,
  className,
  listClassName,
  triggerClassName,
}: CustomTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("w-auto", className)}
    >
      <TabsList
        className={cn(
          "bg-gray-100/80 p-1 rounded-lg h-auto border border-gray-200/50 gap-1",
          listClassName
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              "cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all",
              "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm",
              "text-gray-500 hover:text-gray-900",
              triggerClassName
            )}
          >
            {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
