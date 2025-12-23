"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { ChevronDown } from "lucide-react";

import { useCreateSupportTicket } from "./hooks/useSupportApi";
import { toast } from "sonner";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITY_OPTIONS = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
  { id: "critical", name: "Critical" },
];

const CATEGORY_OPTIONS = [
  { id: "Technical", name: "Technical" },
  { id: "Billing", name: "Billing" },
  { id: "General", name: "General" },
];

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [priorityOpen, setPriorityOpen] = React.useState(false);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [attachments, setAttachments] = React.useState<FileList | null>(null);

  const { mutate: createTicket, isPending } = useCreateSupportTicket();

  const handleSubmit = () => {
    if (!subject || !message || !priority || !category) {
      toast.error("Please fill all the fields");
      return;
    }
    createTicket(
      { subject, message, priority, category, attachments },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Reset form
          setSubject("");
          setMessage("");
          setPriority("");
          setCategory("");
          setAttachments(null);
        },
      }
    );
  };

  const selectedPriority = PRIORITY_OPTIONS.find((opt) => opt.id === priority);
  const selectedCategory = CATEGORY_OPTIONS.find((opt) => opt.id === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader className="border-b pb-4 -mx-6 px-6">
          <DialogTitle className="text-xl">
            Create New Support Ticket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Provide detailed information about your issue"
              className="min-h-[120px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <CustomDropdown
                open={priorityOpen}
                onOpenChange={setPriorityOpen}
                options={PRIORITY_OPTIONS}
                value={priority}
                onSelect={(option: any) => {
                  setPriority(option.id);
                  setPriorityOpen(false);
                }}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    <span className={!priority ? "text-muted-foreground" : ""}>
                      {selectedPriority?.name || "Select priority"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <CustomDropdown
                open={categoryOpen}
                onOpenChange={setCategoryOpen}
                options={CATEGORY_OPTIONS}
                value={category}
                onSelect={(option: any) => {
                  setCategory(option.id);
                  setCategoryOpen(false);
                }}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    <span className={!category ? "text-muted-foreground" : ""}>
                      {selectedCategory?.name || "Select category"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments" className="text-sm font-medium">
              Attachments
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              className="cursor-pointer"
              onChange={(e) => setAttachments(e.target.files)}
            />
            <p className="text-xs text-muted-foreground">
              Upload screenshots or error logs (optional)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creating..." : "Create Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
