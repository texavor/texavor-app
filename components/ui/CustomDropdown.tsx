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
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="border-[1px] p-0 py-1 border-[#E4E4E7] min-w-[150px] w-auto z-[1400]">
        <DropdownMenuGroup className="space-y-[1px]">
          {options?.map((option: any) => {
            const isSelected =
              value?.toLocaleString() === option?.id?.toLocaleString();
            return (
              <DropdownMenuItem
                key={option.name}
                onClick={() => onSelect(option)}
                disabled={option.disabled}
                className={`flex min-w-[150px] cursor-pointer justify-between ${
                  isSelected
                    ? "bg-[#EAF9F2] hover:bg-[#9BCCB5]"
                    : "bg-white hover:bg-transparent"
                }`}
              >
                <span className="flex items-center gap-2">
                  {option?.icon &&
                    (typeof option.icon === "string" ? (
                      <img
                        src={option.icon}
                        alt={option.name}
                        className="w-4 h-4"
                      />
                    ) : (
                      option.icon
                    ))}
                  <span
                    className={`font-ttHoves text-sm leading-5 ${
                      isSelected ? "text-[#104127]" : "text-[#09090B]"
                    }`}
                  >
                    {option?.name}
                  </span>
                </span>
                {isSelected && (
                  <Check className="text-[#104127] max-h-4 max-w-4" />
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
