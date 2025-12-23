"use client";

import { CustomTable } from "@/components/ui/CustomTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useGetSupportTickets } from "./hooks/useSupportApi";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketDetailSheet } from "./TicketDetailSheet";

const Page = () => {
  const { data, isLoading } = useGetSupportTickets();
  const [open, setOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleRowClick = (row: any) => {
    setSelectedTicketId(row.id);
    setIsDetailSheetOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create tickets for any issues you are facing and track their status
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Create New Ticket</Button>
      </div>
      {/* @ts-ignore */}
      <CustomTable
        className=""
        columns={columns as any}
        data={data || []}
        isLoading={isLoading}
        onClick={handleRowClick}
      />
      <CreateTicketDialog open={open} onOpenChange={setOpen} />
      <TicketDetailSheet
        ticketId={selectedTicketId}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
      />
    </div>
  );
};

export default Page;
