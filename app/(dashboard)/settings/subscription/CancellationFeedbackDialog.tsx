"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CANCELLATION_REASONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features I need" },
  { value: "not_using_enough", label: "Not using it enough" },
  { value: "found_alternative", label: "Found a better alternative" },
  { value: "technical_issues", label: "Experiencing technical issues" },
  { value: "poor_content_quality", label: "Content quality issues" },
  { value: "other", label: "Other reason" },
];

interface CancellationFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (feedback?: {
    reason_category: string;
    reason_details?: string;
  }) => void;
  isPending: boolean;
}

export function CancellationFeedbackDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CancellationFeedbackDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedbackDetails, setFeedbackDetails] = useState("");

  const handleConfirm = () => {
    // Validate "other" reason requires details
    if (selectedReason === "other" && !feedbackDetails.trim()) {
      toast.error("Please provide details for 'Other reason'");
      return;
    }

    const feedback = selectedReason
      ? {
          reason_category: selectedReason,
          reason_details: feedbackDetails || undefined,
        }
      : undefined;

    onConfirm(feedback);
  };

  const handleSkip = () => {
    onConfirm(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px] border-none shadow-none">
        <DialogHeader>
          <DialogTitle className="font-poppins text-xl">
            We're sorry to see you go
          </DialogTitle>
          <DialogDescription className="font-inter text-gray-600 pt-2">
            Help us improve by letting us know why you're canceling (optional):
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label
                  htmlFor={reason.value}
                  className="font-inter text-sm cursor-pointer"
                >
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="feedback-details" className="font-inter text-sm">
                {selectedReason === "other"
                  ? "Please tell us more (required)"
                  : "Additional details (optional)"}
              </Label>
              <Textarea
                id="feedback-details"
                value={feedbackDetails}
                onChange={(e) => setFeedbackDetails(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={3}
                className="font-inter text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isPending}
            className="border-none shadow-none"
          >
            Skip
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Canceling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
