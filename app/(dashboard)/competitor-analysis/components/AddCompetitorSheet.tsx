"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { competitorApi, CompetitorCreateData } from "@/lib/api/competitors";
import { toast } from "sonner";
import { Loader2, Plus, Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AddCompetitorSheetProps {
  blogId: string;
  onSuccess: () => void;
}

export default function AddCompetitorSheet({
  blogId,
  onSuccess,
}: AddCompetitorSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompetitorCreateData>({
    name: "",
    website_url: "",
    sitemap_url: "",
    rss_feed_url: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await competitorApi.create(blogId, formData);
      toast.success("Competitor added successfully");
      setOpen(false);
      setFormData({
        name: "",
        website_url: "",
        sitemap_url: "",
        rss_feed_url: "",
        description: "",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Failed to add competitor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Competitor
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border rounded-xl shadow-md flex items-center justify-center bg-gray-50">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                Add Competitor
              </SheetTitle>
              <SheetDescription className="text-xs font-inter text-gray-500">
                Track a competitor to analyze their content strategy.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="add-competitor-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-foreground/80 font-inter">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. TechCrunch"
                  required
                  className="font-inter"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="website_url"
                  className="text-foreground/80 font-inter"
                >
                  Website URL
                </Label>
                <Input
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://techcrunch.com"
                  required
                  type="url"
                  className="font-inter"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="rss_feed_url"
                  className="text-foreground/80 font-inter"
                >
                  RSS Feed URL <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="rss_feed_url"
                  name="rss_feed_url"
                  value={formData.rss_feed_url}
                  onChange={handleChange}
                  placeholder="https://techcrunch.com/feed"
                  type="url"
                  className="font-inter"
                />
                <p className="text-[11px] text-muted-foreground">
                  If known, providing the RSS feed URL can improve analysis
                  accuracy.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="sitemap_url"
                  className="text-foreground/80 font-inter"
                >
                  Sitemap URL <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="sitemap_url"
                  name="sitemap_url"
                  value={formData.sitemap_url}
                  onChange={handleChange}
                  placeholder="https://techcrunch.com/sitemap.xml"
                  type="url"
                  className="font-inter"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave blank to auto-detect. Useful if the sitemap is at a
                  non-standard location.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="text-foreground/80 font-inter"
                >
                  Description <span className="text-gray-400">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Main competitor in tech news..."
                  className="font-inter min-h-[100px]"
                />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-gray-50/50">
          <div className="flex gap-3 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-competitor-form"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Competitor
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
