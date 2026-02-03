import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useCreatePrompt } from "../services/aeoService";
import { formatCategoryName } from "../utils/aeoHelpers";

interface CreatePromptDialogProps {
  blogId?: string;
}

export const CreatePromptDialog: React.FC<CreatePromptDialogProps> = ({
  blogId,
}) => {
  const [open, setOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("general");

  const createMutation = useCreatePrompt(blogId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    createMutation.mutate(
      {
        prompt: {
          prompt_text: promptText,
          category,
          active: true,
          priority: 0,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setPromptText("");
          setCategory("general");
        },
      },
    );
  };

  const categories = [
    "general",
    "software_selection",
    "product_discovery",
    "brand_awareness",
    "local_services",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Tracking Prompt</DialogTitle>
            <DialogDescription>
              Create a prompt to track your brand's visibility across AI
              platforms.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Text</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., What are the best tools for SEO automation?"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="h-24 resize-none"
                required
                minLength={10}
              />
              <p className="text-xs text-slate-500">
                Enter a question or prompt that potential customers might ask
                AI.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {formatCategoryName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Prompt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
