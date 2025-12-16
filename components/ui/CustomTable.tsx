"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onClick: any;
  className: string;
}

export function CustomTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onClick,
  className = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden border bg-white">
        <div
          className={`relative max-h-[calc(100vh-226px)] overflow-y-auto no-scrollbar ${className}`}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-[#EEDED3] z-10 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: header.column.columnDef.meta?.width }}
                        className="font-poppins bg-[#EEDED3] pl-2"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((column, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full bg-[#f9f4f0]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onClick(row?.original)}
                    className={onclick ? "cursor-pointer" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.columnDef.meta?.width }}
                        className={`font-inter
                          ${
                            cell.column.columnDef.meta?.truncate
                              ? "truncate"
                              : ""
                          }
                        `}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    <div className="flex justify-center">
                      <Image
                        src="/not_data.png"
                        alt="No Data"
                        height={300}
                        width={300}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
