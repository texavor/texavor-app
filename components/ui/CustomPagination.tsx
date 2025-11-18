"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomDropdown from "./CustomDropdown";

const CustomPagination = ({
  pagination,
  onPageChange,
  onPerPageChange,
}: any) => {
  const { page, per_page, count, pages } = pagination;
  const [perPageDropdownOpen, setPerPageDropdownOpen] = useState(false);

  const perPageOptions = [
    { id: 25, name: "25" },
    { id: 50, name: "50" },
    { id: 75, name: "75" },
    { id: 100, name: "100" },
  ];

  const handlePerPageChange = (option: any) => {
    onPerPageChange(option.id);
    setPerPageDropdownOpen(false);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    if (pages <= maxPagesToShow) {
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= halfMaxPages) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(pages);
      } else if (page >= pages - halfMaxPages) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = pages - maxPagesToShow + 2; i <= pages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(pages);
      }
    }

    return pageNumbers.map((p, index) =>
      p === "..." ? (
        <span key={index} className="px-3 py-1">
          <MoreHorizontal className="h-5 w-5" />
        </span>
      ) : (
        <Button
          key={index}
          variant={p === page ? "default" : "ghost"}
          onClick={() => onPageChange(p)}
          className="px-3 py-1"
        >
          {p}
        </Button>
      )
    );
  };

  const from = (page - 1) * per_page + 1;
  const to = Math.min(page * per_page, count);

  return (
    <div className="flex justify-between items-center p-2 rounded-xl bg-white">
      <div className="flex items-center space-x-2 font-inter text-sm">
        <span>Result per page</span>
        <CustomDropdown
          open={perPageDropdownOpen}
          onOpenChange={setPerPageDropdownOpen}
          options={perPageOptions}
          trigger={
            <Button variant="outline" className="px-2 has">
              {per_page}
              <ChevronDown className="size-4 px-0" />
            </Button>
          }
          onSelect={handlePerPageChange}
          value={per_page}
        />
        <span className="font-inter text-sm">
          {from}-{to} of {count}
        </span>
      </div>
      <div className="flex items-center space-x-2">{renderPageNumbers()}</div>
    </div>
  );
};

export default CustomPagination;
