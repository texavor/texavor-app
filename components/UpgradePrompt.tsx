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
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  message: string;
  currentUsage: number;
  limit: number;
  suggestedTier: string;
}

export function UpgradePrompt({
  open,
  onClose,
  message,
  currentUsage,
  limit,
  suggestedTier,
}: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 ${message?.toLowerCase().includes("credit") ? "bg-indigo-100" : "bg-orange-100"} rounded-full`}
            >
              <AlertCircle
                className={`w-6 h-6 ${message?.toLowerCase().includes("credit") ? "text-indigo-600" : "text-orange-600"}`}
              />
            </div>
            <DialogTitle className="font-poppins text-xl">
              {message?.toLowerCase().includes("credit")
                ? "Credit Exhausted"
                : "Upgrade Required"}
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-inter text-sm text-gray-600">
                {message?.toLowerCase().includes("credit")
                  ? "Credits Available"
                  : "Usage this month"}
              </span>
              <span className="font-inter text-sm font-medium text-gray-900">
                {currentUsage} / {limit}
              </span>
            </div>
            <Progress
              value={
                message?.toLowerCase().includes("credit")
                  ? (currentUsage / limit) * 100
                  : 100
              }
              className="h-2"
            />
            <p className="font-inter text-xs text-gray-500">
              {message?.toLowerCase().includes("credit")
                ? "Top up to continue using AI features"
                : "You've reached your plan limit"}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-[#104127] hover:bg-[#104127]/90 text-white"
          >
            {message?.toLowerCase().includes("credit")
              ? "Go to Pricing"
              : `Upgrade to ${suggestedTier}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
