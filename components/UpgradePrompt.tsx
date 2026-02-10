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
  required?: number;
  available?: number;
}

export function UpgradePrompt({
  open,
  onClose,
  message,
  currentUsage,
  limit,
  suggestedTier,
  required,
  available,
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
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <DialogTitle className="font-poppins text-xl">
              Upgrade Required
            </DialogTitle>
          </div>
          <DialogDescription className="font-inter text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {required !== undefined && available !== undefined ? (
            <div className="space-y-3 pt-2">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-red-800">
                    Required
                  </span>
                  <span className="text-sm font-bold text-red-800">
                    {required} Credits
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-600">
                    Available
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {available} Credits
                  </span>
                </div>
              </div>
              <p className="font-inter text-xs text-center text-gray-500">
                Upgrade your plan to get more credits.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-inter text-sm text-gray-600">
                  Usage this month
                </span>
                <span className="font-inter text-sm font-medium text-gray-900">
                  {currentUsage} / {limit}
                </span>
              </div>
              <Progress value={(currentUsage / limit) * 100} className="h-2" />
              <p className="font-inter text-xs text-gray-500">
                You've reached your plan limit
              </p>
            </div>
          )}
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
            className="w-full sm:w-auto bg-[#0A2918] hover:bg-[#0A2918]/90"
          >
            Upgrade to {suggestedTier}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
