"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useReactivateSubscription } from "../hooks/useSubscriptionApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReactivateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId?: string;
  currentPeriodEnd?: string;
}

export function ReactivateSubscriptionDialog({
  open,
  onOpenChange,
  blogId,
  currentPeriodEnd,
}: ReactivateSubscriptionDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: reactivateSubscription, isPending } =
    useReactivateSubscription(blogId);

  const handleReactivate = async () => {
    try {
      await reactivateSubscription();
      queryClient.invalidateQueries({ queryKey: ["subscription", blogId] });
      toast.success("Subscription reactivated", {
        description: "Your subscription will continue automatically.",
        className: "text-gray-900",
        descriptionClassName: "text-gray-700",
      });
      onOpenChange(false);
    } catch (error: any) {
      // Error toast is handled by axiosInstance
      console.error("Reactivate subscription error:", error);
    }
  };

  const formattedEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the end of the current period";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-none">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <DialogTitle className="font-poppins text-xl">
              Reactivate Subscription
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-gray-600 pt-2">
            Resume your subscription and continue enjoying all premium features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="p-4 bg-green-50 rounded-lg space-y-2">
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• Immediate access:</span> You'll
              regain full access to all premium features right away
            </p>
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• Billing continues:</span> Your
              subscription will renew automatically on{" "}
              <span className="font-semibold">{formattedEndDate}</span>
            </p>
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• No data loss:</span> All your
              content and settings remain intact
            </p>
          </div>

          <p className="font-inter text-sm text-gray-500 italic">
            By reactivating, you're confirming that you want to continue your
            subscription and will be charged at the next billing cycle.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-none shadow-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReactivate}
            disabled={isPending}
            className="bg-[#0A2918] hover:bg-[#0A2918]/90"
          >
            {isPending ? "Reactivating..." : "Reactivate Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
