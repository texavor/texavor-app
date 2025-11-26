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
import { Input } from "@/components/ui/input";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface NewApiKeyDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  name: string;
}

export const NewApiKeyDisplayDialog = ({
  open,
  onOpenChange,
  apiKey,
  name,
}: NewApiKeyDisplayDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Your API key has been created. Make sure to copy it now as you won't
            be able to see it again!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 text-sm">
                Important: Save this key now
              </p>
              <p className="text-yellow-800 text-sm mt-1">
                This is the only time you'll be able to see the full API key.
                Store it securely.
              </p>
            </div>
          </div>

          {/* API Key Name */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Key Name</p>
            <p className="text-gray-900 font-semibold">{name}</p>
          </div>

          {/* API Key */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">API Key</p>
            <div className="flex gap-2">
              <Input
                value={apiKey}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#104127] hover:bg-[#104127]/90"
          >
            I've Saved My Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
