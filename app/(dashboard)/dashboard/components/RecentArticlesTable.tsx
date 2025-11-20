"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  status: string;
  created_at: string;
  author?: {
    name: string;
    image?: string;
  };
}

interface RecentArticlesTableProps {
  articles: Article[];
  isLoading: boolean;
}

export const RecentArticlesTable = ({
  articles,
  isLoading,
}: RecentArticlesTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-50";
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold font-poppins text-gray-900">
          Recent Articles
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-500 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh data
          </Button>
          <Link href="/article/new">
            <Button size="sm" className="bg-[#1e293b] hover:bg-[#0f172a]">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-medium text-gray-500 pl-6">
                Article Name
              </TableHead>
              <TableHead className="font-medium text-gray-500">
                Created Date
              </TableHead>
              <TableHead className="font-medium text-gray-500">
                Status
              </TableHead>
              <TableHead className="font-medium text-gray-500">
                Author
              </TableHead>
              <TableHead className="font-medium text-gray-500 text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  No articles found.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow
                  key={article.id}
                  className="hover:bg-gray-50/50 border-gray-50"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg border border-gray-100">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            article.title
                          )}&background=random`}
                        />
                        <AvatarFallback className="rounded-lg">
                          AR
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 font-poppins truncate max-w-[200px] sm:max-w-[300px]">
                        {article.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 font-inter">
                    {format(new Date(article.created_at), "dd MMMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium rounded-md px-2.5 py-1",
                        getStatusColor(article.status)
                      )}
                    >
                      {article.status === "scheduled" && (
                        <span className="mr-1.5 relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 font-inter">
                    {article.author?.name || "You"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/article/${article.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
