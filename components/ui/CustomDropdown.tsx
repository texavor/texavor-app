"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomDropdown = ({
  open,
  onOpenChange,
  options,
  trigger,
  onSelect,
  value,
}: any) => {
  const isMobile = useIsMobile();

  const handleTriggerClick = () => {
    onOpenChange(true);
  };

  // Prevent scroll events from propagating to parent elements
  const stopWheelEventPropagation = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const stopTouchMoveEventPropagation = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  if (isMobile) {
    // The BottomSheetSelect component is not found in the project.
    // Returning the trigger for now.
    return (
      <div onClick={handleTriggerClick} className="w-full">
        {trigger}
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild className="focus-visible:ring-[0px]">
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border-[1px] p-0 py-1 border-[#E4E4E7] z-[1400] w-[var(--radix-dropdown-menu-trigger-width)] max-h-72 overflow-y-auto"
        onWheel={stopWheelEventPropagation}
        onTouchMove={stopTouchMoveEventPropagation}
      >
        <DropdownMenuGroup className="space-y-[1px]">
          {options?.map((option: any) => {
            const isSelected =
              value?.toLocaleString() === option?.id?.toLocaleString();
            return (
              <DropdownMenuItem
                key={option.name}
                onClick={() => onSelect(option)}
                disabled={option.disabled}
                className="flex min-w-[150px] cursor-pointer justify-between items-center py-2 px-3 focus:bg-[#f9f4f0] rounded-md outline-none transition-colors"
                style={{
                  backgroundColor: isSelected ? "#f9f4f0" : "transparent",
                }}
              >
                <span className="flex items-center gap-2">
                  {option?.icon &&
                    (typeof option.icon === "string" ? (
                      <img
                        src={option.icon}
                        alt={option.name}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      option.icon
                    ))}
                  <span className="font-poppins text-xs font-normal text-[#09090B]">
                    {option?.name}
                  </span>
                </span>
                {isSelected && (
                  <Check className="text-[#09090B] h-4 w-4 stroke-[2]" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomDropdown;
