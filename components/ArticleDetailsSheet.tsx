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
} from "lucide-react";

interface ArticleDetails {
  id?: string;
  title: string;
  content: string;
  slug: string;
  canonical_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  tags: string[];
  categories: string[];
  key_phrases: string[];
  cross_post_platforms: string[];
  platform_settings?: Record<string, any>; // Per-platform override settings
}

interface ArticleDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleData: ArticleDetails;
  onSave: (data: ArticleDetails) => void;
}

type PublishMode = "publish" | "schedule";

export default function ArticleDetailsSheet({
  open,
  onOpenChange,
  articleData,
  onSave,
}: ArticleDetailsSheetProps) {
  const [formData, setFormData] = useState<ArticleDetails>(articleData);
  const [publishMode, setPublishMode] = useState<PublishMode>("publish");
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
  } = usePublicationsApi(blogs?.id || "", articleData?.id || "");

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [platformSettings, setPlatformSettings] = useState<Record<string, any>>(
    {}
  );
  const [authors, setAuthors] = useState<Author[]>([]);

  // Fetch authors
  useEffect(() => {
    if (blogs?.id) {
      fetchAuthors(blogs.id).then(setAuthors).catch(console.error);
    }
  }, [blogs?.id]);

  // Sync formData when articleData changes
  useEffect(() => {
    let initialCrossPostPlatforms = articleData.cross_post_platforms;

    // Always default to all connected integrations if not explicitly set
    if (!initialCrossPostPlatforms || initialCrossPostPlatforms.length === 0) {
      initialCrossPostPlatforms = connectedIntegrations.map((p) => p.id);
    }

    setFormData({
      ...articleData,
      cross_post_platforms: initialCrossPostPlatforms,
    });

    // Initialize platform settings from articleData
    if (articleData.platform_settings) {
      setPlatformSettings(articleData.platform_settings);
    }

    if (articleData.scheduled_at) {
      setPublishMode("schedule");
    } else {
      setPublishMode("publish");
    }
  }, [articleData, getIntegrations.data]); // Add getIntegrations.data dependency

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
      const currentlySelected = prev.cross_post_platforms || [];
      if (currentlySelected.includes(platformId)) {
        return {
          ...prev,
          cross_post_platforms: currentlySelected.filter(
            (id) => id !== platformId
          ),
        };
      } else {
        return {
          ...prev,
          cross_post_platforms: [...currentlySelected, platformId],
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
        if (!finalData.scheduled_at)
          finalData.scheduled_at = new Date().toISOString();
      }
    }

    onSave(finalData);
  };

  const handleRetryPublication = (publicationId: string) => {
    setRetryingId(publicationId);
    retryPublication(publicationId, {
      onSettled: () => setRetryingId(null),
    });
  };

  const handlePlatformSettingsClick = (integration: any) => {
    setSelectedIntegration(integration);
    setSettingsDialogOpen(true);
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
                <Label
                  htmlFor="canonical_url"
                  className="text-foreground/80 font-inter"
                >
                  Canonical URL
                </Label>
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
                <Label
                  htmlFor="seo_keywords"
                  className="text-foreground/80 font-inter"
                >
                  Keywords
                </Label>
                <Input
                  id="seo_keywords"
                  name="seo_keywords"
                  value={formData.seo_keywords || ""}
                  onChange={handleChange}
                  placeholder="comma, separated, keywords"
                  className="font-inter"
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
                        ? new Date(formData.scheduled_at)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleDateChange("scheduled_at", e.target.value)
                    }
                  />
                </div>
              )}
              {connectedIntegrations.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground/80">Cross-Post To</Label>
                  <div className="space-y-2 rounded-md border p-3">
                    {connectedIntegrations.map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`crosspost-${platform.id}`}
                            checked={formData.cross_post_platforms.includes(
                              platform.id
                            )}
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
                          onClick={() => handlePlatformSettingsClick(platform)}
                          className="h-7 px-2"
                          title="Configure platform settings"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
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
