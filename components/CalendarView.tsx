import React, { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  status: string;
  created_at: string;
  published_at?: string;
  scheduled_at?: string;
}

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  articles: Article[];
  isLoading?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onDateChange,
  articles,
  isLoading,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startDate,
        end: endDate,
      }),
    [startDate, endDate]
  );

  const weeks: Date[][] = useMemo(() => {
    const out: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      out.push(calendarDays.slice(i, i + 7));
    }
    return out;
  }, [calendarDays]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));

  const getDayArticles = (day: Date) =>
    articles.filter((article) => {
      // Check published_at, scheduled_at, or created_at
      const dateToCompare =
        article.scheduled_at || article.published_at || article.created_at;
      return isSameDay(new Date(dateToCompare), day);
    });

  const [openDay, setOpenDay] = useState<Date | null>(null);
  const closeModal = () => setOpenDay(null);

  const statusStyle = (status: string) => ({
    backgroundColor:
      status === "draft"
        ? "#FFE8A3"
        : status === "review"
        ? "#BEE7EF"
        : status === "scheduled"
        ? "#E5D5FF"
        : status === "published"
        ? "#C9F3D3"
        : "#E5E7EB",
    color:
      status === "draft"
        ? "#C58A00"
        : status === "review"
        ? "#0F6C7A"
        : status === "scheduled"
        ? "#6A32B9"
        : status === "published"
        ? "#1E7A33"
        : "#6B7280",
  });

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col h-[calc(100vh-175px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-0">
          {weeks.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="grid grid-cols-7 border-t border-gray-200"
            >
              {week.map((day) => {
                const dayArticles = getDayArticles(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const displayedArticles = dayArticles.slice(0, 3);
                const remainingCount = Math.max(0, dayArticles.length - 3);

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[120px] p-3 flex flex-col gap-2 border-r border-gray-200 transition-colors",
                      isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                    )}
                    onClick={() => {
                      if (dayArticles.length > 0) setOpenDay(day);
                    }}
                    role="button"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full shrink-0",
                          isSameDay(day, new Date())
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-700"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      {isLoading ? (
                        <div className="space-y-2 mt-1">
                          <Skeleton className="h-5 w-full bg-[#f9f4f0]" />
                          <Skeleton className="h-5 w-[80%] bg-[#f9f4f0]" />
                        </div>
                      ) : (
                        <>
                          {displayedArticles.map((article) => (
                            <div
                              key={article.id}
                              style={statusStyle(article.status)}
                              className="text-xs px-2 py-1 rounded-md border truncate cursor-pointer hover:shadow-sm"
                              title={article.title}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {article.title}
                            </div>
                          ))}

                          {remainingCount > 0 && (
                            <div
                              className="text-xs text-gray-600 font-medium pl-1 hover:text-gray-800 cursor-pointer flex items-center gap-2 w-max"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDay(day);
                              }}
                            >
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[11px] border border-gray-200">
                                +{remainingCount}
                              </span>
                              <span className="underline">more</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* SHADCN DIALOG */}
      <Dialog open={!!openDay} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              {openDay && format(openDay, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {openDay && getDayArticles(openDay).length > 0
                ? `${getDayArticles(openDay).length} article${
                    getDayArticles(openDay).length === 1 ? "" : "s"
                  } scheduled for this day`
                : "No articles scheduled"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto space-y-2 py-2 no-scrollbar">
            {openDay && getDayArticles(openDay).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  No articles scheduled
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Articles for this day will appear here
                </p>
              </div>
            )}

            {openDay &&
              getDayArticles(openDay).map((a) => (
                <div
                  key={a.id}
                  className="group flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-700"
                      title={a.title}
                    >
                      {a.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(a.created_at), "MMM d, yyyy")}
                    </div>
                  </div>

                  <div
                    style={statusStyle(a.status)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium shrink-0 capitalize flex items-center gap-1.5"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          statusStyle(a.status).color || "#6B7280",
                      }}
                    />
                    {a.status}
                  </div>
                </div>
              ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={closeModal}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
