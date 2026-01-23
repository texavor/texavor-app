"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LinkDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetLink: (url: string) => void;
  initialUrl?: string;
};

export const LinkDialog = ({
  isOpen,
  onClose,
  onSetLink,
  initialUrl = "",
}: LinkDialogProps) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
    }
  }, [isOpen, initialUrl]);

  const handleSave = () => {
    onSetLink(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-0 gap-0 sm:max-w-md">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>
        <div className="h-[1px] bg-slate-200 w-full" />
        <div className="p-6">
          <div className="grid gap-2 mb-4">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
