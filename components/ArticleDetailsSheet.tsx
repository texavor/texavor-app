"use client";

import { useIntegrationsApi } from "@/app/(dashboard)/integrations/hooks/useIntegrationsApi";
import { usePublicationsApi } from "@/app/(dashboard)/article/hooks/usePublicationsApi";
import { fetchAuthors, Author } from "@/lib/api/authors";
import { Checkbox } from "./ui/checkbox";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PublicationStatusList from "@/components/PublicationStatusList";
import IntegrationSettingsDialog from "@/components/IntegrationSettingsDialog";
import { useAppStore } from "@/store/appStore";
import {
  Globe,
  Calendar,
  FileText,
  User,
  Tag,
  Search,
  Clock,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Settings2,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useArticleSettingsStore,
  ArticleDetails,
} from "@/store/articleSettingsStore";
interface ArticleDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // articleData prop is no longer the primary source of state, but kept for interface compatibility if needed, though likely unused for state init now.
  articleData?: ArticleDetails;
  onSave: (data: ArticleDetails) => void;
}

type PublishMode = "publish" | "schedule";

export default function ArticleDetailsSheet({
  open,
  onOpenChange,
  articleData, // Unused for state now, state comes from store
  onSave,
}: ArticleDetailsSheetProps) {
  const {
    formData,
    setFormData,
    platformSettings,
    setPlatformSettings,
    publishMode,
    setPublishMode,
  } = useArticleSettingsStore();

  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const { blogs } = useAppStore();
  const { getIntegrations } = useIntegrationsApi();
  const connectedIntegrations =
    getIntegrations.data?.filter((p) => p.is_connected) || [];

  // Publication tracking
  const {
    publications,
    isLoading: isLoadingPublications,
    retryPublication,
    refetch: refetchPublications,
  } = usePublicationsApi(blogs?.id || "", formData?.id || "", open);

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [authors, setAuthors] = useState<Author[]>([]);

  // Platform-specific settings state
  const [platformSettingsDialogOpen, setPlatformSettingsDialogOpen] =
    useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<any>(null);

  // Fetch authors
  useEffect(() => {
    if (blogs?.id) {
      fetchAuthors(blogs.id).then(setAuthors).catch(console.error);
    }
  }, [blogs?.id]);

  // NO useEffect to sync articleData -> formData here.
  // Initialization happens in page.tsx or persistent store logic.

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    field: "scheduled_at" | "published_at",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleCrossPostChange = (platformId: string) => {
    setFormData((prev) => {
      const currentlySelected = prev.article_publications || [];
      if (currentlySelected.includes(platformId)) {
        return {
          ...prev,
          article_publications: currentlySelected.filter(
            (id) => id !== platformId
          ),
        };
      } else {
        return {
          ...prev,
          article_publications: [...currentlySelected, platformId],
        };
      }
    });
  };

  const handleSave = (action: "save_draft" | "publish_or_schedule") => {
    const finalData = { ...formData, platform_settings: platformSettings };

    if (action === "publish_or_schedule") {
      if (publishMode === "publish") {
        finalData.scheduled_at = null;
        if (!finalData.published_at)
          finalData.published_at = new Date().toISOString();
      } else {
        finalData.published_at = null;
        if (!finalData.scheduled_at) {
          finalData.scheduled_at = new Date().toISOString();
        }
        // formData.scheduled_at is already in UTC ISO format from onChange handler
      }
    }
    // formData.scheduled_at is already in UTC ISO format, no conversion needed

    onSave(finalData);
  };

  const handleRetryPublication = (publicationId: string) => {
    setRetryingId(publicationId);
    retryPublication(publicationId, {
      onSettled: () => setRetryingId(null),
    });
  };

  const handlePlatformSettingsClick = (integration: any) => {
    // Check if it's dev.to platform
    if (integration.platform === "devto") {
      setCurrentPlatform(integration);
      setPlatformSettingsDialogOpen(true);
    } else {
      // For other platforms, use the generic settings dialog
      setSelectedIntegration(integration);
      setSettingsDialogOpen(true);
    }
  };

  const handleSavePlatformSettings = (settings: Record<string, any>) => {
    if (selectedIntegration) {
      setPlatformSettings((prev) => ({
        ...prev,
        [selectedIntegration.id]: {
          ...(prev[selectedIntegration.id] || {}),
          ...settings,
        },
      }));
    }
    setSettingsDialogOpen(false);
  };

  const handleSaveDevtoSettings = (settings: any) => {
    if (currentPlatform) {
      setPlatformSettings((prev) => ({
        ...prev,
        devto: settings,
      }));
    }
  };

  // Mock options for dropdowns
  const authorOptions = [
    { id: 1, name: "Author One" },
    { id: 2, name: "Author Two" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
            Article Settings
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
          {/* General Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
              General
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-foreground/80 font-inter">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleChange}
                  placeholder="my-awesome-article"
                  className="font-inter text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="canonical_url"
                    className="text-foreground/80 font-inter"
                  >
                    Canonical URL
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Set this only if you need a single fixed canonical URL
                          for all the platform; otherwise, the primary
                          platform's URL will automatically be used as the
                          canonical URL for other platforms.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="canonical_url"
                  name="canonical_url"
                  value={formData.canonical_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/original-article"
                  className="font-inter"
                />
              </div>

              {true && (
                <div className="space-y-1.5">
                  <Label htmlFor="author_id" className="text-foreground/80">
                    Author
                  </Label>
                  <CustomDropdown
                    open={authorDropdownOpen}
                    onOpenChange={setAuthorDropdownOpen}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal text-left"
                      >
                        {authors.find((a) => a.id === formData.author_id)
                          ?.name || "Select Author"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    }
                    options={authors}
                    value={formData.author_id}
                    onSelect={(option: any) => {
                      setFormData((prev) => ({
                        ...prev,
                        author_id: option.id,
                      }));
                      setAuthorDropdownOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* SEO Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
              SEO & Social
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="seo_title"
                  className="text-foreground/80 font-inter"
                >
                  Meta Title
                </Label>
                <Input
                  id="seo_title"
                  name="seo_title"
                  value={formData.seo_title || ""}
                  onChange={handleChange}
                  placeholder="Title for search engines"
                  className="font-inter"
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {formData.seo_title?.length || 0}/60
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="seo_description"
                  className="text-foreground/80 font-inter"
                >
                  Meta Description
                </Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  value={formData.seo_description || ""}
                  onChange={handleChange}
                  placeholder="Brief summary for search results"
                  rows={4}
                  className="resize-none focus-visible:ring-[0px] font-inter"
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {formData.seo_description?.length || 0}/160
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-foreground/80 font-inter">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const tagsArray = value.split(",").map((tag) => tag.trim());
                    // .filter((tag) => tag.length > 0); // Don't filter empty while typing or it deletes spaces
                    // Actually, we should just store the array.
                    // But if we split/join on every render, trailing comma might be an issue.
                    // Better to split only on save? No, form data needs to be accurate for other things maybe.
                    // Let's keep it simple: just split.
                    // Wait, if I type "tag1, " -> split gives ["tag1", ""].
                    // value is "tag1, ".
                    // If I render from join, it becomes "tag1, ". Correct.
                    // If I type "tag1, t" -> ["tag1", "t"]. join -> "tag1, t".
                    setFormData((prev) => ({
                      ...prev,
                      tags: value.split(",").map((t) => t.trimStart()), // Keep internal spaces, but trim start/end of tag?
                      // Actually, standard behavior for tag inputs is usually specialized component.
                      // But user asked for text input behavior.
                      // Let's just use the raw value for local state if possible?
                      // But formData.tags is string[].
                      // I'll handle the split carefully.
                    }));
                  }}
                  // Re-thinking: Direct split/map on change makes it hard to type ", " (comma space).
                  // Because "tag1," -> split -> ["tag1", ""]. join -> "tag1, ".
                  // It works.
                  // But "tag1,  " (two spaces) -> ["tag1", ""]. join -> "tag1, ". (one space).
                  // So you can't type multiple spaces easily?
                  // Maybe I should add a local state for the input string and sync to formData on blur or effect?
                  // Or just use a different approach.
                  // User instruction: "keywords is not proper change to tags and send to bakcned as tags"
                  // Simple approach:
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Publishing Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
              Publishing
            </h3>

            <div className="space-y-4">
              <Tabs
                value={publishMode}
                onValueChange={(v) => setPublishMode(v as PublishMode)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="publish"
                    className="cursor-pointer data-[state=active]:bg-[#104127] data-[state=active]:text-white"
                  >
                    Publish Now
                  </TabsTrigger>

                  <TabsTrigger
                    value="schedule"
                    className="cursor-pointer data-[state=active]:bg-[#104127] data-[state=active]:text-white"
                  >
                    Schedule
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {publishMode === "schedule" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="scheduled_at" className="text-foreground/80">
                    Schedule Date & Time
                  </Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={
                      formData.scheduled_at
                        ? (() => {
                            // If it's already in local format (no 'Z' or timezone), use as-is
                            // Otherwise convert UTC to local for display
                            const dateStr = formData.scheduled_at;
                            if (
                              dateStr.includes("Z") ||
                              dateStr.includes("+") ||
                              (dateStr.includes("T") && dateStr.length > 19)
                            ) {
                              // Backend sends UTC like "2025-12-24T15:49:00.000Z"
                              // new Date() parses this as UTC and stores internally
                              // getFullYear(), getMonth(), etc. return values in LOCAL timezone
                              const date = new Date(dateStr);

                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              const hours = String(date.getHours()).padStart(
                                2,
                                "0"
                              );
                              const minutes = String(
                                date.getMinutes()
                              ).padStart(2, "0");

                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                            // Already in local format, just return it
                            return dateStr.slice(0, 16);
                          })()
                        : ""
                    }
                    onChange={(e) => {
                      const localValue = e.target.value;
                      if (!localValue) {
                        handleDateChange("scheduled_at", "");
                        return;
                      }
                      // Convert local datetime to UTC immediately before storing
                      // This ensures formData always contains UTC ISO strings
                      const localDate = new Date(localValue);
                      const utcIsoString = localDate.toISOString();
                      handleDateChange("scheduled_at", utcIsoString);
                    }}
                  />
                </div>
              )}
              {connectedIntegrations.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground/80">Cross-Post To</Label>
                  <div className="space-y-2 rounded-md border p-3">
                    {connectedIntegrations.map((platform) => {
                      // Check if platform is selected OR has existing publications
                      const isSelected = formData.article_publications.includes(
                        platform.id
                      );
                      const hasPublication = publications?.some(
                        (pub) => pub.integration_id === platform.id
                      );
                      const isChecked = isSelected || hasPublication;

                      return (
                        <div
                          key={platform.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`crosspost-${platform.id}`}
                              checked={isChecked}
                              onCheckedChange={() =>
                                handleCrossPostChange(platform.id)
                              }
                            />
                            <Label
                              htmlFor={`crosspost-${platform.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {platform.name}
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handlePlatformSettingsClick(platform)
                            }
                            className="h-7 px-2"
                            title="Configure platform settings"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Click <Settings2 className="h-3 w-3 inline" /> to customize
                    settings per platform
                  </p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Publication Status Section */}
          {articleData?.id && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
                  Publication Status
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchPublications()}
                  className="h-7 px-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>

              <PublicationStatusList
                publications={publications}
                isLoading={isLoadingPublications}
                onRetry={handleRetryPublication}
                onRefresh={refetchPublications}
                retryingId={retryingId || undefined}
              />
            </section>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-6 border-t sm:justify-between bg-white gap-2">
          <Button
            onClick={() => handleSave("publish_or_schedule")}
            className="min-w-[120px]"
          >
            {publishMode === "schedule" ? "Schedule" : "Publish Now"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Platform Settings Dialog */}
      {selectedIntegration && (
        <IntegrationSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          integration={selectedIntegration}
          onSave={handleSavePlatformSettings}
          mode="article"
        />
      )}
    </Sheet>
  );
}
