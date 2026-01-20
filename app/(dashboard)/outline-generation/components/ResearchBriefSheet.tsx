import React from "react";
import { ResearchBrief } from "../hooks/useOutlineApi";
import {
  AlertCircle,
  Link as LinkIcon,
  BarChart3,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ResearchBriefSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ResearchBrief;
}

export const ResearchBriefSheet: React.FC<ResearchBriefSheetProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[560px] p-0 flex flex-col bg-white">
        <SheetHeader className="px-6 py-6 border-b bg-white border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-black text-white shadow-sm shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-0.5 text-left">
              <SheetTitle className="font-poppins font-semibold text-lg text-gray-900 leading-tight">
                Deep Research Brief
              </SheetTitle>
              <SheetDescription className="text-xs font-inter text-gray-500">
                AI-curated insights, market gaps, and sources for this topic.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8">
            {/* Market Gaps */}
            {data.market_gaps && data.market_gaps.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-inter">
                  Market Gaps & Opportunities
                </h4>
                <div className="space-y-3">
                  {data.market_gaps.map((gap, i) => (
                    <div
                      key={i}
                      className="bg-amber-50/60 border border-amber-100/80 p-3.5 rounded-lg flex gap-3 items-start"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-900 font-inter leading-relaxed">
                        {gap}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Statistics */}
            {data.key_statistics && data.key_statistics.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-inter">
                  Key Statistics
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {data.key_statistics.map((stat, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-lg items-center group hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 font-inter leading-snug">
                        {stat}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Questions */}
            {data.common_questions && data.common_questions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-inter">
                  Common Questions
                </h4>
                <ul className="space-y-2">
                  {data.common_questions.map((q, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-gray-600 p-2.5 rounded-md hover:bg-gray-50 transition-colors items-start border border-transparent hover:border-gray-100"
                    >
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span className="leading-snug">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="bg-gray-100" />

            {/* Sources */}
            {data.sources && data.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest font-inter flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Analyzed Sources
                </h4>
                <div className="space-y-2">
                  {data.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all bg-white group"
                    >
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#104127] truncate font-inter">
                        {source.title}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate font-mono flex items-center gap-1">
                        {new URL(source.url).hostname}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 border-t border-gray-100 bg-gray-50/30 mt-auto">
          <SheetClose asChild>
            <Button className="w-full bg-[#104127] hover:bg-[#0d3320] text-white shadow-none font-inter h-11 text-sm font-medium rounded-lg">
              Close Brief
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
