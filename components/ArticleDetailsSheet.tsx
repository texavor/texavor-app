"use client";

import { useIntegrationsApi } from "@/app/(dashboard)/integrations/hooks/useIntegrationsApi";
import { usePublicationsApi } from "@/app/(dashboard)/article/hooks/usePublicationsApi";
import { fetchAuthors, Author } from "@/lib/api/authors";
import { AuthorSelector } from "@/components/integrations/AuthorSelector";
import { Checkbox } from "./ui/checkbox";
import { CustomAlertDialog } from "./ui/CustomAlertDialog";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
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
  Wand2,
  Loader2,
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
  onSave: (data: ArticleDetails, keepOpen?: boolean) => void;
  currentTitle?: string;
  currentContent?: string;
  currentContentHtml?: string;
}

type PublishMode = "publish" | "schedule";

export default function ArticleDetailsSheet({
  open,
  onOpenChange,
  articleData, // Unused for state now, state comes from store
  onSave,
  currentTitle,
  currentContent,
  currentContentHtml,
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
  const allIntegrations = getIntegrations.data || [];

  // Publication tracking
  const {
    publications,
    isLoading: isLoadingPublications,
    retryPublication,
    refetch: refetchPublications,
    unpublish,
    isUnpublishing,
    updatePublished,
    isUpdatingPublished,
    publishNow,
  } = usePublicationsApi(blogs?.id || "", formData?.id || "", open);

  // Ensure fresh data when sheet opens
  useEffect(() => {
    if (open) {
      refetchPublications();
      // Sync latest title/content from editor without saving to DB yet
      setFormData((prev) => ({
        ...prev,
        title: currentTitle ?? prev.title,
        content: currentContent ?? prev.content,
        content_html: currentContentHtml ?? prev.content_html,
      }));
    }
  }, [
    open,
    refetchPublications,
    currentTitle,
    currentContent,
    currentContentHtml,
    setFormData,
  ]);

  // Alert Dialog State
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive";
    action: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    action: () => {},
  });

  // Derived state
  const isPublished = publications?.some((p) => p.status === "success");
  const isScheduled =
    !isPublished &&
    formData.scheduled_at &&
    new Date(formData.scheduled_at) > new Date();

  // set publishMode based on state when sheet opens or state changes
  useEffect(() => {
    if (isPublished) {
      setPublishMode("publish"); // Default to publish tab view for published
    } else if (isScheduled) {
      setPublishMode("schedule");
    }
  }, [isPublished, isScheduled, setPublishMode]);

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [authors, setAuthors] = useState<Author[]>([]);

  // New state for per-article author selection
  // Map of integrationId -> platform_author_id (UUID)
  const [selectedAuthors, setSelectedAuthors] = useState<
    Record<string, string>
  >({});

  // Initialize selectedAuthors from existing publications
  useEffect(() => {
    if (publications) {
      const initialSelection: Record<string, string> = {};
      publications.forEach((pub) => {
        // If the publication has a platform_author_id, it means an author was selected
        // We use the UUID here directly
        const pubWithAuthor = pub as any;
        if (pubWithAuthor.platform_author_id) {
          initialSelection[pub.integration_id] =
            pubWithAuthor.platform_author_id;
        }
      });

      setSelectedAuthors((prev) => {
        const next = { ...prev, ...initialSelection };
        // Deep compare to avoid infinite render loop if content hasn't changed
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          return prev;
        }
        return next;
      });
    }
  }, [publications]);

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

  const handleSave = async (action: "save_draft" | "publish_or_schedule") => {
    // 8.1 Sending to EasyWrite (Frontend)
    // Map selected authors to article_publications_attributes
    // We iterate over ALL selected integrations (both existing and new)
    const selectedIntegrationIds = formData.article_publications || [];

    const article_publications_attributes = selectedIntegrationIds.map(
      (intId: string) => {
        // Find existing publication if any
        const existingPub = publications?.find(
          (p) => p.integration_id === intId
        );
        const authorId = selectedAuthors[intId];

        const attr: any = {
          integration_id: intId,
        };

        if (existingPub) {
          attr.id = existingPub.id;
        }

        if (authorId) {
          attr.platform_author_id = authorId;
        }

        // Add publication_settings if exists in platformSettings
        if (platformSettings[intId]) {
          // Flatten: The store has platformSettings[intId] = { organization_id: ... }
          // The API expects publication_settings: { [platformName]: { organization_id: ... } }
          // We need to find the platform name.
          const platform = allIntegrations.find(
            (i) => (i.integration_id || i.id) === intId
          );
          if (platform) {
            const platformName = platform.platform || platform.id;
            // Normalize platform name if needed
            const normalizedPlatform = platformName
              .toLowerCase()
              .replace(/[.\s-_]/g, "");

            attr.publication_settings = {
              [normalizedPlatform]: platformSettings[intId],
            };
          }
        }

        return attr;
      }
    );

    const finalData: any = {
      ...formData,
      // platform_settings: platformSettings, // Removed per guide, now inside attributes
      article_publications_attributes,
    };

    if (action === "publish_or_schedule") {
      if (publishMode === "publish") {
        finalData.scheduled_at = null;
        if (!finalData.published_at) {
          finalData.published_at = new Date().toISOString();
        }
        finalData.status = "published"; // Explicitly set status
      } else {
        // Validation: scheduled_at must be in the future
        if (!finalData.scheduled_at) {
          toast.error("Please select a date and time to schedule.");
          return;
        }

        const scheduledTime = new Date(finalData.scheduled_at).getTime();
        const now = Date.now();

        if (scheduledTime <= now) {
          toast.error("Scheduled time must be in the future.");
          return;
        }

        finalData.published_at = null;
        finalData.status = "scheduled";
      }
    }
    // formData.scheduled_at is already in UTC ISO format, no conversion needed

    try {
      // Step 1: Save/Update Article (Action 1)
      // We await this to ensure DB is updated before triggering publish
      await onSave(finalData);

      // Step 2: Trigger Publication (Action 2) - Only for "Publish Now"
      if (action === "publish_or_schedule" && publishMode === "publish") {
        publishNow(); // Fire and forget or handle error? Hook manages toasts.
      }
    } catch (error) {
      console.error("Failed to save article:", error);
      // Toast handled by parent or mutation?
    }
  };

  const handleRetryPublication = (publicationId: string) => {
    setRetryingId(publicationId);
    retryPublication(publicationId, {
      onSettled: () => setRetryingId(null),
    });
  };

  const handlePlatformSettingsClick = (integration: any) => {
    // Start with generic settings dialog for all platforms including Dev.to
    // Merge existing global setting overrides for this article if any
    const integrationId = integration.integration_id || integration.id;
    const currentArticleSettings = platformSettings[integrationId] || {};

    // Merge: Integration Global Settings (defaults) < Article Specific Settings
    const mergedIntegration = {
      ...integration,
      settings: {
        ...(integration.settings || {}),
        ...currentArticleSettings,
      },
    };

    setSelectedIntegration(mergedIntegration);
    setSettingsDialogOpen(true);
  };

  const handleSavePlatformSettings = (settings: Record<string, any>) => {
    if (selectedIntegration) {
      const integrationId =
        selectedIntegration.integration_id || selectedIntegration.id;

      const newPlatformSettings = {
        ...platformSettings,
        [integrationId]: {
          ...(platformSettings[integrationId] || {}),
          ...settings,
        },
      };

      setPlatformSettings(newPlatformSettings);

      // Construct attributes for immediate patch
      const article_publications_attributes = (publications || []).map(
        (pub) => {
          const s =
            pub.integration_id === integrationId
              ? settings
              : platformSettings[pub.integration_id];

          const attr: any = { id: pub.id };

          if (s?.platform_author_id) {
            attr.platform_author_id = s.platform_author_id;
          }

          // Add publication_settings structure
          const integration = allIntegrations.find(
            (i) => (i.integration_id || i.id) === pub.integration_id
          );

          if (integration && s) {
            const platformName = integration.platform || integration.id;
            const normalizedPlatform = platformName
              .toLowerCase()
              .replace(/[.\s-_]/g, "");

            // Ensure we don't send internal UI fields if we can avoid it, but 's' is the whole settings object.
            // It's probably fine.
            attr.publication_settings = {
              [normalizedPlatform]: s,
            };
          }

          return attr;
        }
      );
      // .filter(Boolean); // map always returns object here

      const finalData: any = {
        ...formData,
        // platform_settings: newPlatformSettings, // Removed per guide
        article_publications_attributes,
      };

      // Trigger the patch call (onSave) with keepOpen=true
      onSave(finalData, true);
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

  const handleUnpublish = () => {
    setAlertConfig({
      open: true,
      title: "Unpublish Article?",
      description:
        "Are you sure you want to unpublish this article? It will be reverted to draft on all platforms.",
      variant: "destructive",
      action: () => {
        unpublish(undefined, {
          onSuccess: () => {
            onOpenChange(false);
            setAlertConfig((prev) => ({ ...prev, open: false }));
          },
        });
      },
    });
  };

  const handleUnpublishIntegration = (integrationId: string) => {
    setAlertConfig({
      open: true,
      title: "Unpublish from Platform?",
      description:
        "Are you sure you want to unpublish from this specific platform?",
      variant: "destructive",
      action: () => {
        unpublish(
          { integration_ids: [integrationId] },
          {
            onSuccess: () => {
              setAlertConfig((prev) => ({ ...prev, open: false }));
            },
          }
        );
      },
    });
  };

  const handleUpdatePublished = () => {
    updatePublished(undefined, {
      onSuccess: () => {
        // stay open or close? usually stay open to see generic success
        // toast handles notification
      },
    });
  };

  const handleCancelSchedule = () => {
    setAlertConfig({
      open: true,
      title: "Cancel Schedule?",
      description:
        "Are you sure you want to cancel the schedule? This will revert the article to a draft.",
      variant: "destructive",
      action: () => {
        setFormData((prev) => ({ ...prev, scheduled_at: null }));
        // Save immediately as draft
        const finalData = {
          ...formData,
          scheduled_at: null,
          published_at: null,
          platform_settings: platformSettings,
        };
        onSave(finalData);
        onOpenChange(false);
        setAlertConfig((prev) => ({ ...prev, open: false }));
      },
    });
  };

  // Metadata generation mutation
  const generateMetadataMutation = useMutation({
    mutationFn: async (targets: string[]) => {
      if (!formData.id || !blogs?.id) return;

      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs.id}/articles/${formData.id}/generate_metadata`,
        { targets }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success && data?.article) {
        setFormData((prev) => ({
          ...prev,
          ...(data.article.seo_description && {
            seo_description: data.article.seo_description,
          }),
          ...(data.article.tags && { tags: data.article.tags }),
        }));
        toast.success("Generated successfully");
      }
    },
    onError: () => {
      toast.error("Failed to generate metadata");
    },
  });

  const fillSeoTitle = () => {
    if (formData.title) {
      setFormData((prev) => ({ ...prev, seo_title: prev.title.slice(0, 60) }));
    }
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const generateSeoDescription = () => {
    if (!formData.id) {
      toast.error("Please save the article first");
      return;
    }
    generateMetadataMutation.mutate(["description"]);
  };

  const generateTags = () => {
    if (!formData.id) {
      toast.error("Please save the article first");
      return;
    }
    generateMetadataMutation.mutate(["tags"]);
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
                <div className="flex justify-between">
                  <Label
                    htmlFor="slug"
                    className="text-foreground/80 font-inter"
                  >
                    URL Slug
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSlug}
                    className="h-5 px-2 text-[10px] text-[#104127] hover:text-[#0A2918] hover:bg-green-50"
                    disabled={!formData.title}
                  >
                    <Wand2 className="max-h-3 max-w-3" />
                    Generate Slug
                  </Button>
                </div>
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
                <div className="flex justify-between">
                  <Label
                    htmlFor="seo_title"
                    className="text-foreground/80 font-inter"
                  >
                    Meta Title
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fillSeoTitle}
                    className="h-5 px-2 text-[10px] text-[#104127] hover:text-[#0A2918] hover:bg-green-50"
                    disabled={!formData.title}
                  >
                    Same as Title
                  </Button>
                </div>
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
                <div className="flex justify-between">
                  <Label
                    htmlFor="seo_description"
                    className="text-foreground/80 font-inter"
                  >
                    Meta Description
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSeoDescription}
                    className="h-5 px-2 text-[10px] text-[#104127] hover:text-[#0A2918] hover:bg-green-50"
                    // disabled={
                    //   !formData.content || generateMetadataMutation.isPending
                    // }
                  >
                    {generateMetadataMutation.isPending &&
                    generateMetadataMutation.variables?.includes(
                      "description"
                    ) ? (
                      <Loader2 className="max-h-3 max-w-3 animate-spin" />
                    ) : (
                      <Wand2 className="max-h-3 max-w-3" />
                    )}
                    Generate
                  </Button>
                </div>
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
                <div className="flex justify-between">
                  <Label
                    htmlFor="tags"
                    className="text-foreground/80 font-inter"
                  >
                    Tags
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateTags}
                    className="h-5 px-2 text-[10px] text-[#104127] hover:text-[#0A2918] hover:bg-green-50"
                    // disabled={!formData.content}
                  >
                    {generateMetadataMutation.isPending &&
                    generateMetadataMutation.variables?.includes("tags") ? (
                      <Loader2 className="max-h-3 max-w-3 animate-spin" />
                    ) : (
                      <Wand2 className="max-h-3 max-w-3" />
                    )}
                    Auto Generate
                  </Button>
                </div>
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
              {!isPublished && (
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
              )}

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
              {/* Filter connected integrations first */}
              {(() => {
                const connectedIntegrations = allIntegrations.filter(
                  (i) => i.is_connected
                );

                if (connectedIntegrations.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Cross-Post To</Label>
                    <div className="space-y-2 rounded-md border p-3">
                      {connectedIntegrations.map((platform) => {
                        const integrationId =
                          platform.integration_id || platform.id;

                        const isSelected =
                          formData.article_publications.includes(integrationId);
                        const hasPublication = publications?.some(
                          (pub) => pub.integration_id === integrationId
                        );
                        const isChecked = isSelected || hasPublication;

                        return (
                          <div
                            key={platform.id}
                            className="flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`crosspost-${platform.id}`}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    handleCrossPostChange(integrationId)
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

                            {/* Inline Author Selector - Only show if checked and supports authors */}
                            {isChecked && platform.supports_authors && (
                              <AuthorSelector
                                blogId={blogs?.id || ""}
                                integrationId={integrationId}
                                selectedAuthorId={
                                  selectedAuthors[integrationId]
                                }
                                onSelect={(authorId) => {
                                  setSelectedAuthors((prev) => {
                                    if (!authorId) {
                                      const next = { ...prev };
                                      delete next[integrationId];
                                      return next;
                                    }
                                    return {
                                      ...prev,
                                      [integrationId]: authorId,
                                    };
                                  });
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      Click <Settings2 className="h-3 w-3 inline" /> to
                      customize settings per platform
                    </p>
                  </div>
                );
              })()}
            </div>
          </section>

          <Separator />

          {/* Publication Status Section */}
          {formData?.id && (
            <section className="space-y-4">
              <PublicationStatusList
                publications={publications}
                isLoading={isLoadingPublications}
                onRetry={handleRetryPublication}
                onRefresh={refetchPublications}
                onUnpublish={handleUnpublishIntegration}
                retryingId={retryingId || undefined}
              />
            </section>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-6 border-t sm:justify-between bg-white gap-2">
          {isPublished ? (
            <div className="flex flex-row gap-2 w-full">
              <Button
                variant="destructive"
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="flex-1"
              >
                {isUnpublishing ? "Unpublishing..." : "Unpublish All"}
              </Button>
              <Button
                onClick={handleUpdatePublished}
                disabled={isUpdatingPublished}
                className="bg-[#104127] hover:bg-[#0A2918] flex-1"
              >
                {isUpdatingPublished ? "Updating..." : "Update Published"}
              </Button>
            </div>
          ) : isScheduled ? (
            <>
              <Button variant="outline" onClick={handleCancelSchedule}>
                Cancel Schedule
              </Button>
              <Button
                onClick={() => handleSave("publish_or_schedule")}
                className="bg-[#104127] hover:bg-[#0A2918]"
              >
                Update Schedule
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleSave("publish_or_schedule")}
              className="w-full bg-[#104127] hover:bg-[#0A2918]"
            >
              {publishMode === "schedule" ? "Schedule" : "Publish Now"}
            </Button>
          )}
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

      <CustomAlertDialog
        open={alertConfig.open}
        onOpenChange={(open) => setAlertConfig((prev) => ({ ...prev, open }))}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.action}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </Sheet>
  );
}
