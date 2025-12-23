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
import { AlertTriangle } from "lucide-react";
import { useCancelSubscription } from "../hooks/useSubscriptionApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId?: string;
  currentPeriodEnd?: string;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  blogId,
  currentPeriodEnd,
}: CancelSubscriptionDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: cancelSubscription, isPending } =
    useCancelSubscription(blogId);

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      queryClient.invalidateQueries({ queryKey: ["subscription", blogId] });

      const formattedDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "the end of the current period";

      toast.success("Subscription canceled", {
        description: `Your subscription will end on ${formattedDate}.`,
        className: "text-gray-900",
        descriptionClassName: "text-gray-700",
      });
      onOpenChange(false);
    } catch (error: any) {
      // Error toast is handled by axiosInstance
      console.error("Cancel subscription error:", error);
    }
  };

  const formattedEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the end of your billing period";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-none">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <DialogTitle className="font-poppins text-xl">
              Cancel Subscription
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-gray-600 pt-2">
            Are you sure you want to cancel your subscription? Here's what will
            happen:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• Access until:</span> You'll
              continue to have full access to all features until{" "}
              <span className="font-semibold">{formattedEndDate}</span>
            </p>
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• After cancellation:</span>{" "}
              You'll be downgraded to the free trial plan with limited features
            </p>
            <p className="font-inter text-sm text-gray-700">
              <span className="font-semibold">• Your data:</span> All your
              articles, outlines, and settings will be preserved
            </p>
          </div>

          <p className="font-inter text-sm text-gray-500 italic">
            You can reactivate your subscription anytime before{" "}
            {formattedEndDate} to continue without interruption.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-none shadow-none"
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Canceling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
