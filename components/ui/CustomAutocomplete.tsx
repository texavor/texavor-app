"use client";

import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  id: string | number;
  name: string;
  icon?: string | React.ReactNode;
  disabled?: boolean;
}

interface CustomAutocompleteProps {
  options: Option[];
  value?: string | number | null;
  onSelect: (option: Option) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function CustomAutocomplete({
  options = [],
  value,
  onSelect,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  className,
  emptyMessage = "No results found.",
}: CustomAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(lowerSearch)
    );
  }, [options, search]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.id?.toString() === value?.toString());
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate font-inter">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 z-[1500]"
        align="start"
      >
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-7 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-inter"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="max-h-[300px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground font-inter">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-[1px]">
              {filteredOptions.map((option) => {
                const isSelected = option.id?.toString() === value?.toString();
                return (
                  <button
                    key={option.id}
                    disabled={option.disabled}
                    onClick={() => {
                      onSelect(option);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-[#f9f4f0] disabled:pointer-events-none disabled:opacity-50 font-inter",
                      isSelected && "bg-[#f9f4f0]"
                    )}
                  >
                    <span className="flex items-center gap-2 flex-1 truncate">
                      {option.icon && (
                        <div className="shrink-0">
                          {typeof option.icon === "string" ? (
                            <img
                              src={option.icon}
                              alt=""
                              className="w-4 h-4 object-contain rounded-full"
                            />
                          ) : (
                            option.icon
                          )}
                        </div>
                      )}
                      <span className="truncate">{option.name}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 opacity-100" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
