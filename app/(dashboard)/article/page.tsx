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
}

interface Pagination {
  page: number;
  per_page: number;
  count: number;
  pages: number;
}

type Platform = "all" | "platform" | "fetched";

const Page = () => {
  const { blogs } = useAppStore();
  const [platform, setPlatform] = useState<Platform>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { data, isLoading } = useQuery<{
    articles: Article[];
    pagination: Pagination;
  }>({
    queryKey: ["articles", blogs?.id, platform, page, perPage],
    queryFn: async () => {
      const params = {
        source: platform === "all" ? undefined : platform,
        page,
        per_page: perPage,
      };
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/articles`,
        { params },
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

        <Link href="/article/create">
          <Button>Create Article</Button>
        </Link>
      </div>

      <div className="space-y-4">
        <CustomTable
          columns={columns}
          data={data?.articles || []}
          isLoading={isLoading}
        />
        {data?.pagination && (
          <CustomPagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
