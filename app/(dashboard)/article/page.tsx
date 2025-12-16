"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Calendar, LayoutList, ChevronDown, Plus } from "lucide-react";

import { useAppStore } from "@/store/appStore";
import { axiosInstance } from "@/lib/axiosInstace";
import { ARTICLE_STATUS_COLORS } from "@/lib/constants";

import { CustomTable } from "@/components/ui/CustomTable";
import { Button } from "@/components/ui/button";
import CustomPagination from "@/components/ui/CustomPagination";
import CalendarView from "@/components/CalendarView";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { columns } from "./columns";

// --- Types ---

interface Article {
  id: string;
  blog_id: string;
  user_id: string;
  title: string;
  url: string;
  content: string;
  key_phrases: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
  status: string;
  published_at?: string;
  source?: string;
}

interface Pagination {
  page: number;
  per_page: number;
  count: number;
  pages: number;
}

type Platform = "all" | "platform" | "fetched";
type ViewType = "table" | "calendar";

interface FetchArticlesParams {
  source?: string;
  status?: string;
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
}

// --- Constants ---

const PLATFORM_OPTIONS = [
  { id: "all", name: "All" },
  { id: "platform", name: "Texavor" },
  { id: "fetched", name: "Fetched" },
];

const STATUS_OPTIONS = [
  {
    id: "all",
    name: "All Status",
    icon: null,
  },
  ...Object.entries(ARTICLE_STATUS_COLORS).map(([key, value]) => ({
    id: key,
    name: value.label,
    icon: (
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: value?.chart }}
      />
    ),
  })),
];

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { blogs } = useAppStore();

  // --- State from URL ---
  const platform = (searchParams.get("platform") as Platform) || "all";
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || 25;
  const view = (searchParams.get("view") as ViewType) || "table";

  // Local state for items not needing URL persistence or needing immediate UI feedback before sync
  const [currentDate, setCurrentDate] = useState(new Date());
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // --- Derived State ---
  const selectedPlatform =
    PLATFORM_OPTIONS.find((opt) => opt.id === platform) || PLATFORM_OPTIONS[0];
  const selectedStatus =
    STATUS_OPTIONS.find((opt) => opt.id === status) || STATUS_OPTIONS[0];

  // --- Data Fetching ---
  const { data, isLoading } = useQuery<{
    articles: Article[];
    pagination: Pagination;
  }>({
    queryKey: [
      "articles",
      blogs?.id,
      platform,
      status,
      page,
      perPage,
      view,
      // For calendar view, we depend on the current month displayed
      view === "calendar" ? format(currentDate, "yyyy-MM") : null,
    ],
    queryFn: async () => {
      if (!blogs?.id)
        return {
          articles: [],
          pagination: { count: 0, page: 1, pages: 1, per_page: 25 },
        };

      const params: FetchArticlesParams = {
        source: platform === "all" ? undefined : platform,
        status: status === "all" ? undefined : status,
      };

      if (view === "table") {
        params.page = page;
        params.per_page = perPage;
      } else {
        // For calendar view, fetch all articles for the month
        params.start_date = format(startOfMonth(currentDate), "yyyy-MM-dd");
        params.end_date = format(endOfMonth(currentDate), "yyyy-MM-dd");
        params.per_page = 1000; // Fetch enough for the month
      }

      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles`,
        { params }
      );
      return res?.data || { articles: [], pagination: {} };
    },
    enabled: !!blogs?.id,
  });

  // --- Handlers ---

  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`);
  };

  const handlePlatformChange = (option: any) => {
    updateParams({ platform: option.id, page: 1 });
    setPlatformDropdownOpen(false);
  };

  const handleStatusChange = (option: any) => {
    updateParams({ status: option.id, page: 1 });
    setStatusDropdownOpen(false);
  };

  const handleViewChange = (newView: ViewType) => {
    updateParams({ view: newView });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  const handlePerPageChange = (newPerPage: number) => {
    updateParams({ per_page: newPerPage, page: 1 });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Filter */}
          <CustomDropdown
            open={platformDropdownOpen}
            onOpenChange={setPlatformDropdownOpen}
            options={PLATFORM_OPTIONS}
            value={platform}
            onSelect={handlePlatformChange}
            trigger={
              <Button
                variant="outline"
                className="h-9 bg-white hover:bg-white rounded-md font-inter text-sm border-none flex items-center gap-2 px-3"
              >
                <span className="font-medium text-gray-700">
                  {selectedPlatform?.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            }
          />

          {/* Status Filter */}
          <CustomDropdown
            open={statusDropdownOpen}
            onOpenChange={setStatusDropdownOpen}
            options={STATUS_OPTIONS}
            value={status}
            onSelect={handleStatusChange}
            trigger={
              <Button
                variant="outline"
                className="h-9 bg-white hover:bg-white font-inter text-sm rounded-md border-none flex items-center gap-2 px-3"
              >
                {selectedStatus?.icon && (
                  <div className="mr-1">{selectedStatus.icon}</div>
                )}
                <span className="font-medium text-gray-700">
                  {selectedStatus?.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            }
          />

          {/* View Toggle */}
          <div className="bg-white p-1 rounded-md border border-none flex items-center gap-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("table")}
              className="h-7 px-3 font-inter text-xs font-medium"
            >
              <LayoutList className="h-3.5 w-3.5 mr-2" />
              List
            </Button>
            <Button
              variant={view === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("calendar")}
              className="h-7 px-3 font-inter text-xs font-medium"
            >
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        <Link href="/article/new">
          <Button className="h-9 font-inter gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === "table" ? (
          <div className="h-full flex flex-col space-y-4 overflow-y-auto pr-2 pb-2">
            <CustomTable
              //@ts-ignore
              columns={columns}
              data={data?.articles || []}
              isLoading={isLoading || !blogs?.id}
              onClick={(row: Article) => {
                if (row?.source !== "fetched")
                  router.push(`/article/${row?.id}`);
              }}
              getRowClassName={(row: Article) =>
                row?.source === "platform" ? "cursor-pointer" : ""
              }
              className="bg-white rounded-lg border-none"
            />
            {data?.pagination && (
              <CustomPagination
                pagination={data.pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            )}
          </div>
        ) : (
          <CalendarView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            articles={data?.articles || []}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
