"use client";

import { CustomTable } from "@/components/ui/CustomTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import React, { useState } from "react";
import CustomPagination from "@/components/ui/CustomPagination";
import { useRouter } from "next/navigation";
import { Calendar, LayoutList } from "lucide-react";
import CalendarView from "@/components/CalendarView";
import { startOfMonth, endOfMonth, format } from "date-fns";

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
}

interface Pagination {
  page: number;
  per_page: number;
  count: number;
  pages: number;
}

type Platform = "all" | "platform" | "fetched";
type ViewType = "table" | "calendar";

const Page = () => {
  const { blogs } = useAppStore();
  const [platform, setPlatform] = useState<Platform>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [view, setView] = useState<ViewType>("table");
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();

  const { data, isLoading } = useQuery<{
    articles: Article[];
    pagination: Pagination;
  }>({
    queryKey: [
      "articles",
      blogs?.id,
      platform,
      page,
      perPage,
      view,
      currentDate,
    ],
    queryFn: async () => {
      const params: any = {
        source: platform === "all" ? undefined : platform,
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when per page changes
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex space-x-2 p-4 rounded-xl bg-white h-14 flex items-center w-fit">
            <Button
              variant={platform === "all" ? "default" : "outline"}
              onClick={() => setPlatform("all")}
              className="border-none"
            >
              All
            </Button>

            <Button
              variant={platform === "platform" ? "default" : "outline"}
              onClick={() => setPlatform("platform")}
              className="border-none"
            >
              EasyWrite
            </Button>

            <Button
              variant={platform === "fetched" ? "default" : "outline"}
              onClick={() => setPlatform("fetched")}
              className="border-none"
            >
              Blog Document
            </Button>
          </div>

          <div className="bg-white p-1 rounded-lg border flex items-center gap-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
              className="h-8 px-2"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={view === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="h-8 px-2"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>
        </div>

        <Link href="/article/new">
          <Button>Create Article</Button>
        </Link>
      </div>

      {view === "table" ? (
        <div className="space-y-4">
          <CustomTable
            columns={columns}
            data={data?.articles || []}
            isLoading={isLoading}
            onClick={(row: any) => {
              if (row?.source !== "fetched") router.push(`/article/${row?.id}`);
            }}
            className=""
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
  );
};

export default Page;
