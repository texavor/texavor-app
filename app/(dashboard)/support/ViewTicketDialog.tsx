"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Ticket } from "./columns";

interface ViewTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatStatus = (status: string) => {
  return status.split("_").map(capitalize).join(" ");
};

const getStatusColor = (status: string) => {
  const colors = {
    open: "text-blue-600",
    in_progress: "text-amber-600",
    closed: "text-gray-600",
  };
  return colors[status as keyof typeof colors] || "text-gray-600";
};

export const ViewTicketDialog: React.FC<ViewTicketDialogProps> = ({
  open,
  onOpenChange,
  ticket,
}) => {
  if (!ticket) return null;

  const priorityVariant = {
    low: "default",
    medium: "secondary",
    high: "destructive",
    critical: "destructive",
  }[ticket.priority];

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticket.id);
    toast.success("Ticket ID copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="border-b pb-4 -mx-6 px-6">
          <DialogTitle className="text-xl text-black">
            Ticket Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Ticket ID
            </Label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono">{ticket.id}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleCopyTicketId}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Subject
            </Label>
            <p className="text-sm font-medium">{ticket.subject}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Priority
              </Label>
              <div>
                <Badge variant={priorityVariant as any}>
                  {capitalize(ticket.priority)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <p
                className={`text-sm font-semibold ${getStatusColor(
                  ticket.status
                )}`}
              >
                {formatStatus(ticket.status)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Category
            </Label>
            <p className="text-sm">{ticket.category}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
