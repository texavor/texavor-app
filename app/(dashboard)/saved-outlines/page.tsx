"use client";

import React from "react";
import { CustomTable } from "@/components/ui/CustomTable";
import { columns } from "./columns";
import { useOutlineApi } from "../outline-generation/hooks/useOutlineApi";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const SavedOutlinesPage = () => {
  const router = useRouter();
  const { savedOutlines, deleteOutline } = useOutlineApi();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this outline?")) {
      deleteOutline.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-poppins text-gray-900">
          Saved Outlines
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CustomTable
          columns={columns as any}
          data={savedOutlines.data || []}
          isLoading={savedOutlines.isLoading}
          onClick={(row: any) => {
            router.push(`/outline-generation?id=${row.id}`);
          }}
          className=""
          // meta={{
          //   onDelete: handleDelete,
          // }}
        />
      </div>
    </div>
  );
};

export default SavedOutlinesPage;
