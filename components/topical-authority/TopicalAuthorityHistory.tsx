"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/appStore";
import { axiosInstance } from "@/lib/axiosInstace";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/ui/CustomTable";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Button } from "@/components/ui/button";
import {
  CustomCheckCircleIcon,
  CustomAlertIcon,
  CustomClockIcon,
  CustomNetworkIcon,
  CustomChevronDownIcon,
  CustomPlusIcon,
} from "@/components/icons/CustomIcons";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PastMap {
  id: string;
  topic: string;
  job_status: string;
  created_at: string;
  total_nodes?: number;
}

const STATUS_OPTIONS = [
  {
    id: "all",
    name: "All Status",
    icon: null,
  },
  {
    id: "completed",
    name: "Completed",
    icon: (
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: "#15803d" }}
      />
    ),
  },
  {
    id: "pending",
    name: "In Progress",
    icon: (
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: "#2563eb" }}
      />
    ),
  },
  {
    id: "failed",
    name: "Failed",
    icon: (
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: "#b91c1c" }}
      />
    ),
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 border-none shadow-none hover:bg-green-100 gap-1 font-medium">
          <CustomCheckCircleIcon className="w-3.5 h-3.5" /> Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 border-none shadow-none hover:bg-red-100 gap-1 font-medium">
          <CustomAlertIcon className="w-3.5 h-3.5" /> Failed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-none shadow-none hover:bg-blue-100 gap-1 font-medium">
          <CustomClockIcon className="w-3.5 h-3.5 animate-pulse" /> Processing
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-none shadow-none hover:bg-yellow-100 gap-1 font-medium">
          <CustomClockIcon className="w-3.5 h-3.5 animate-pulse" /> Pending
        </Badge>
      );
  }
};

const columns: ColumnDef<PastMap>[] = [
  {
    accessorKey: "topic",
    header: "Seed Topic",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium text-gray-800">
        <CustomNetworkIcon className="w-4 h-4 text-[#104127] shrink-0" />
        <span className="truncate max-w-[300px]">{row.original?.topic}</span>
      </div>
    ),
    meta: { width: "40%" },
  },
  {
    accessorKey: "job_status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original?.job_status),
    meta: { width: "20%" },
  },
  {
    accessorKey: "total_nodes",
    header: "Total Nodes",
    cell: ({ row }) => (
      <span className="text-gray-600">
        {row.original?.total_nodes ? `${row.original.total_nodes} nodes` : "—"}
      </span>
    ),
    meta: { width: "15%" },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">
        {row.original?.created_at
          ? format(new Date(row.original.created_at), "MMM d, yyyy")
          : "—"}
      </span>
    ),
    meta: { width: "25%" },
  },
];

export function TopicalAuthorityHistory() {
  const { blogs } = useAppStore();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const selectedStatus =
    STATUS_OPTIONS.find((opt) => opt.id === statusFilter) || STATUS_OPTIONS[0];

  const { data, isLoading } = useQuery({
    queryKey: ["topical_authorities_history", blogs?.id],
    queryFn: async () => {
      if (!blogs?.id) return null;
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/topical_authorities`,
      );
      return res.data;
    },
    enabled: !!blogs?.id,
  });

  const pastMaps: PastMap[] = data?.data || [];

  const filteredMaps = useMemo(() => {
    if (statusFilter === "all") return pastMaps;
    if (statusFilter === "pending") {
      return pastMaps.filter(
        (m) => m.job_status === "pending" || m.job_status === "processing",
      );
    }
    return pastMaps.filter((m) => m.job_status === statusFilter);
  }, [pastMaps, statusFilter]);

  const handleStatusChange = (option: any) => {
    setStatusFilter(option.id);
    setStatusDropdownOpen(false);
  };

  return (
    <div className="flex flex-col">
      {/* Header — mirrors article page pattern */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <CustomDropdown
            open={statusDropdownOpen}
            onOpenChange={setStatusDropdownOpen}
            options={STATUS_OPTIONS}
            value={statusFilter}
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
                <CustomChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Button>
            }
          />
        </div>

        {/* Create New Map */}
        <Button
          className="h-9 font-inter gap-2 shadow-sm"
          onClick={() => router.push("/topical-authority?new=true")}
        >
          <CustomPlusIcon className="h-4 w-4" />
          Create New Map
        </Button>
      </div>

      {/* Table */}
      {/* @ts-ignore */}
      <CustomTable
        columns={columns as any}
        data={filteredMaps}
        isLoading={isLoading}
        onClick={(row: PastMap) => router.push(`/topical-authority/${row.id}`)}
      />
    </div>
  );
}
