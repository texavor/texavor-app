"use client";

import { CustomTable } from "@/components/ui/CustomTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useGetSupportTickets } from "./hooks/useSupportApi";
import { CreateTicketDialog } from "./CreateTicketDialog";

const Page = () => {
  const { data, isLoading } = useGetSupportTickets();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setOpen(true)}>Create New Ticket</Button>
      </div>
      {/* @ts-ignore */}
      <CustomTable
        className=""
        columns={columns as any}
        data={data || []}
        isLoading={isLoading}
      />
      <CreateTicketDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default Page;
