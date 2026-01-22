"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

interface CustomMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  creatable?: boolean;
  maxSelected?: number;
}

export function CustomMultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select items...",
  className,
  creatable = false,
  maxSelected,
}: CustomMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const stopWheelEventPropagation = (e: any) => {
    e.stopPropagation();
  };

  const stopTouchMoveEventPropagation = (e: any) => {
    e.stopPropagation();
  };

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleSelect = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((item) => item !== optionValue));
    } else {
      if (maxSelected && selected.length >= maxSelected) return;
      onChange([...selected, optionValue]);
    }
    // setOpen(false); // Keep open for multi-selection
  };

  const handleCreate = () => {
    if (!inputValue) return;
    const newValue = inputValue
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (newValue && !selected.includes(newValue)) {
      if (maxSelected && selected.length >= maxSelected) return;
      onChange([...selected, newValue]);
      setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            selected.length > 0 && "h-auto min-h-10",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 mr-2">
            {selected.length > 0 ? (
              selected.map((item) => {
                const option = options.find((o) => o.value === item);
                const label = option ? option.label : item;
                return (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="font-inter text-xs px-2 py-0.5 gap-1 bg-white hover:bg-gray-50 border border-gray-200"
                  >
                    {label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground font-inter">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 z-[1500]"
        align="start"
        onWheel={stopWheelEventPropagation}
        onTouchMove={stopTouchMoveEventPropagation}
      >
        <Command>
          <CommandInput
            placeholder="Search..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={(e) => {
              if (e.key === "Enter" && creatable && inputValue) {
                // If it's not a match in list, or user forces create
                // cmdk usually creates filter.
                // If we want to capture Enter for creation when no match:
                if (
                  !options.find(
                    (o) => o.label.toLowerCase() === inputValue.toLowerCase(),
                  )
                ) {
                  e.preventDefault();
                  handleCreate();
                }
              }
            }}
          />
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty>
              {creatable && inputValue ? (
                <button
                  type="button"
                  className="flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground font-inter text-blue-600"
                  onClick={handleCreate}
                >
                  Create "{inputValue}"
                </button>
              ) : (
                "No results found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Filtering usually searches this
                  onSelect={() => {
                    handleSelect(option.value);
                  }}
                  className="font-inter"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
