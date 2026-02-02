"use client";

import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { discoverIntegrationSettings } from "@/lib/api/integrations";
import { fetchAuthors, listIntegrationAuthors } from "@/lib/api/authors";
import { useAppStore } from "@/store/appStore";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { CustomAutocomplete } from "@/components/ui/CustomAutocomplete";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Integration {
  id: string;
  platform: string;
  name: string;
  settings: Record<string, any>;
}

interface IntegrationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (settings: Record<string, any>) => void;
  mode?: "global" | "article";
  articleAuthorId?: string | null;
  integration: Integration | null;
}

const MEDIUM_POPULAR_TAGS = [
  "Technology",
  "Startup",
  "Life",
  "Programming",
  "Web Development",
  "Artificial Intelligence",
  "Design",
  "Writing",
  "Business",
  "Politics",
  "Productivity",
  "Psychology",
  "Money",
  "Health",
  "Science",
  "Self Improvement",
  "Software Development",
  "Machine Learning",
  "Data Science",
  "Education",
  "Cryptocurrency",
  "Javascript",
  "Coding",
  "React",
  "Entrepreneurship",
  "Marketing",
  "UX",
  "Work",
  "Android",
  "iOS",
  "Product Management",
];

const HASHNODE_POPULAR_TAGS = [
  "Programming",
  "Web Development",
  "JavaScript",
  "React",
  "Python",
  "CSS",
  "HTML",
  "Node.js",
  "DevOps",
  "Open Source",
  "Machine Learning",
  "Data Science",
  "Artificial Intelligence",
  "Software Engineering",
  "Java",
  "TypeScript",
  "Git",
  "GitHub",
  "Career Advice",
  "Productivity",
  "Tutorial",
  "Beginner",
  "AWS",
  "Docker",
  "Kubernetes",
  "Linux",
  "Cybersecurity",
  "Blockchain",
  "Web3",
  "Mobile Development",
  "Android",
  "iOS",
  "Flutter",
  "Swift",
  "Go",
  "Rust",
  "C++",
  "C#",
  "SQL",
  "Database",
  "GraphQL",
  "Serverless",
  "Testing",
  "System Design",
  "Architecture",
];

const platformSettings: Record<
  string,
  Array<{
    key: string;
    label: string;
    type:
      | "text"
      | "textarea"
      | "tags"
      | "select"
      | "multi-select"
      | "custom-dropdown"
      | "autocomplete"
      | "radio";
    placeholder?: string;
    description?: string;
    optionsKey?: string;
    options?: { label: string; value: string }[];
  }>
> = {
  wordpress: [
    {
      key: "author_id",
      label: "Author",
      type: "autocomplete",
      placeholder: "Select Author",
      description: "Author to publish as",
      optionsKey: "authors",
    },
    {
      key: "default_category",
      label: "Category ID",
      type: "text",
      placeholder: "Category ID",
      description: "Default category ID",
    },
    {
      key: "default_tags",
      label: "Tags",
      type: "tags",
      placeholder: "Tags",
      description: "Comma-separated tags",
    },
  ],
  shopify: [
    {
      key: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "Tags",
      description: "Tags for the blog post",
    },
  ],
  medium: [
    {
      key: "tags",
      label: "Tags",
      type: "multi-select",
      placeholder: "Technology, AI",
      description: "Limit 5",
      options: MEDIUM_POPULAR_TAGS.map((tag) => ({ label: tag, value: tag })),
    },
  ],
  devto: [
    {
      key: "organization_id",
      label: "Organization",
      type: "custom-dropdown",
      placeholder: "Select Organization",
      description: "Organization to publish under",
      optionsKey: "organizations",
    },
    {
      key: "series",
      label: "Series",
      type: "select",
      placeholder: "Select Series",
      description: "Series to add article to",
      optionsKey: "series",
    },
    {
      key: "tags",
      label: "Tags",
      type: "multi-select",
      placeholder: "Select Tags",
      description: "Max 4 tags",
      optionsKey: "tags",
    },
  ],
  webflow: [
    {
      key: "author_id",
      label: "Author",
      type: "autocomplete",
      placeholder: "Select Author",
      description: "Author to publish as",
      optionsKey: "authors",
    },
  ],
  customwebhook: [
    {
      key: "author_id",
      label: "Author",
      type: "autocomplete",
      placeholder: "Select Author",
      description: "Author to publish as",
      optionsKey: "authors",
    },
    // {
    //   key: "category",
    //   label: "Category",
    //   type: "text",
    //   placeholder: "e.g. key:value or category_name",
    //   description: "Custom data to send with webhook",
    // },
  ],
  hashnode: [
    {
      key: "subtitle",
      label: "Subtitle",
      type: "text",
      placeholder: "Article Subtitle",
      description: "Optional subtitle",
    },
    {
      key: "series_id",
      label: "Series",
      type: "select",
      placeholder: "Select Series",
      description: "Series to add article to",
      optionsKey: "publications", // Handling specific logic for finding series in publications
    },
    {
      key: "disable_comments",
      label: "Disable Comments",
      type: "radio",
      placeholder: "Enable/Disable",
      options: [
        { label: "No (Enable Comments)", value: "false" },
        { label: "Yes (Disable Comments)", value: "true" },
      ],
    },
    {
      key: "tags",
      label: "Tags",
      type: "multi-select",
      placeholder: "AI, Technology",
      description: "Comma-separated tags",
      options: HASHNODE_POPULAR_TAGS.map((tag) => ({ label: tag, value: tag })),
    },
  ],
  substack: [
    {
      key: "audience",
      label: "Audience",
      type: "custom-dropdown",
      options: [
        { label: "Everyone (Public)", value: "everyone" },
        { label: "Paid Subscribers Only", value: "only_paid" },
        { label: "Free Subscribers Only", value: "only_free" },
      ],
      placeholder: "Select Audience",
      description: "Who can see this post?",
    },
    {
      key: "send_email",
      label: "Send as Newsletter",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      description: "Send via email upon publishing",
    },
    {
      key: "draft",
      label: "Save as Draft",
      type: "radio",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      description: "Create as draft on Substack",
    },
  ],
};

// Fallback tags for Dev.to when discovery API doesn't return tags
const DEVTO_FALLBACK_TAGS = [
  "webdev",
  "javascript",
  "programming",
  "beginners",
  "ai",
  "tutorial",
  "react",
  "productivity",
  "python",
  "devops",
  "archlinux",
  "career",
  "opensource",
  "discuss",
  "java",
  "news",
  "aws",
  "node",
  "blockchain",
  "css",
  "typescript",
  "cloud",
  "web3",
  "rust",
  "security",
  "architecture",
  "android",
  "database",
  "learning",
  "machinelearning",
];

export default function IntegrationSettingsDialog({
  open,
  onOpenChange,
  integration,
  onSave,
  mode = "global",
  articleAuthorId,
}: IntegrationSettingsDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [dropdownsOpen, setDropdownsOpen] = useState<Record<string, boolean>>(
    {},
  );
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  const normalizePlatformName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[.\s-_]/g, "");
  };

  // Use React Query to pre-fetch and cache discovery and author data
  const blogId = blogs?.id;
  const integrationId = (integration as any)?.integration_id || integration?.id;
  const normalizedPlatform = integration
    ? normalizePlatformName(integration.platform || integration.id)
    : "";

  // Pre-fetch discovery data using React Query
  // Enable discovery for ANY platform that may have options (Dev.to, Hashnode, WordPress, Webflow, CustomWebhook)
  // Medium and Shopify generally don't have dynamic discovery in this guide? (Medium has tags text, Shopify has tags)
  const { data: discoveryData, isLoading: isDiscovering } = useQuery({
    queryKey: ["integration-discovery", blogId, integrationId],
    queryFn: async () => {
      if (!blogId || !integrationId) return null;
      const res = await discoverIntegrationSettings(blogId, integrationId);
      return res.success ? res.discovered : null;
    },
    enabled:
      !!blogId &&
      !!integrationId &&
      ["devto", "hashnode", "webflow", "wordpress", "customwebhook"].includes(
        normalizedPlatform,
      ),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all authors for the blog to support filtering and defaults
  const { data: authorsData, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ["blog-authors", blogId],
    queryFn: async () => {
      if (!blogId) return [];
      return await fetchAuthors(blogId);
    },
    enabled: !!blogId,
  });

  // Fetch integration-specific authors for custom webhooks to avoid merging logic issues
  const { data: integrationAuthors } = useQuery({
    queryKey: ["integration-authors", blogId, integrationId],
    queryFn: async () => {
      if (!blogId || !integrationId) return [];
      const res = await listIntegrationAuthors(blogId, integrationId);
      return res.authors || (res as any);
    },
    enabled:
      !!blogId && !!integrationId && normalizedPlatform === "customwebhook",
    staleTime: 5 * 60 * 1000,
  });

  // Decide which authors list to use:
  // For customwebhook: use the specific integrationAuthors (if loaded)
  // For others: use global authorsData
  const activeAuthorsData =
    normalizedPlatform === "customwebhook" && integrationAuthors
      ? integrationAuthors
      : authorsData;

  const discoveredData = discoveryData;

  useEffect(() => {
    if (integration && open) {
      const loadedSettings = integration.settings || {};

      // Handle Platform Defaults or Article Author Prefill
      // If setting is missing (author_id or organization_id), try to fill it.
      const targetField =
        normalizedPlatform === "devto" ? "organization_id" : "author_id";

      if (!loadedSettings[targetField] && authorsData) {
        let matchedAuthor = null;

        // 1. Try to match by articleAuthorId if provided
        if (articleAuthorId) {
          matchedAuthor = authorsData.find(
            (a: any) => a.id === articleAuthorId,
          );
        }

        // 2. If no match yet, try finding a platform default (fallback)
        // Only if we shouldn't strictly enforce article author??
        // Actually, if articleAuthorId is set but doesn't map to this platform, we fall back to global default?
        // Let's stick to the existing logic for defaults + articleAuthorId priority.
        if (
          !matchedAuthor &&
          (normalizedPlatform === "webflow" ||
            normalizedPlatform === "customwebhook")
        ) {
          matchedAuthor = authorsData.find((a: any) => {
            if (!a.platform_defaults) return false;
            return a.platform_defaults.some((pd: any) => {
              if (typeof pd === "string") {
                return (
                  pd === normalizedPlatform || pd === integration?.platform
                );
              }
              return (
                (pd.platform === normalizedPlatform ||
                  pd.platform === integration?.platform) &&
                (pd.integration_id ? pd.integration_id === integrationId : true)
              );
            });
          });
        }

        // If we found a candidate author, verify it works for this platform/integration
        if (matchedAuthor) {
          // Check if author is compatible with this platform/integration
          const isCompatible =
            matchedAuthor.external_platform === normalizedPlatform || // Matches platform (e.g. devto)
            (normalizedPlatform === "customwebhook" &&
              matchedAuthor.integration_id === integrationId); // Matches integration

          // For Dev.to, if we have an author, we use their external_id as organization_id
          // But only if they have one.
          if (matchedAuthor.external_id) {
            // For Dev.to authors, external_id is usually a number (org id) or "personal" string?
            // Or sometimes empty if it's just a user.
            // If we found a match, use it.
            // Note: For Dev.to, if external_id is null/missing, it might be "Personal" (null).
            // But we only overwrite if loadedSettings is EMPTY.

            // Additional check: If it's the "Personal" author for Dev.to, external_id might be "personal" or similar.
            // We need to map it to what the dropdown expects.

            loadedSettings[targetField] = matchedAuthor.external_id;
          }
        }
      }

      setFormData(loadedSettings);
    }
  }, [integration, open, normalizedPlatform, authorsData, articleAuthorId]);

  const updateMutation = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const res = await axiosInstance.patch(
        `/api/v1/integrations/${integration?.id}`,
        {
          integration: { settings },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration settings updated");
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to update settings";
      toast.error(message);
    },
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const processedData = { ...formData };

    // Strict adherence: ensure types match requirement (string array for tags, correct mapping for author_id if needed)
    // Note: author_id in generic select will store as string/value.

    if (processedData.organization_id === "null") {
      processedData.organization_id = null;
    }

    if (mode === "article" && onSave) {
      onSave(processedData);
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(processedData);
  };

  if (!integration) return null;

  const platformKey = integration.platform || integration.name || "";
  const settings =
    platformSettings[normalizedPlatform] || platformSettings[platformKey] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-0 bg-white">
        <DialogHeader className="border-b-[1px] border-[#E5E7EB] pb-2">
          <DialogTitle className="font-poppins px-4">
            {integration.name} Settings
          </DialogTitle>
          <DialogDescription className="font-inter px-4">
            Configure platform-specific settings for{" "}
            {integration.platform || integration.name || "this platform"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 px-4 overflow-y-visible">
          {settings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              {isDiscovering ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching
                  options...
                </span>
              ) : (
                "No additional settings available for this platform"
              )}
            </p>
          ) : (
            settings.map((setting) => {
              // Prepare options
              let options: any[] = setting.options || [];

              // Handle Author Options explicitly using fetched authors
              if (setting.optionsKey === "authors" && authorsData) {
                // Filter authors based on platform requirements
                // User said: "send external_ids from the authors" and filter.
                // Implied: Show all authors that *have* an external_id for this platform, OR maybe all authors?
                // "support search to search the name rather than based on where it belong Authors api to do that based on the and authro should be prefetched"
                // Let's filter by external_platform matching.

                const targetPlatform =
                  normalizedPlatform === "customwebhook"
                    ? "custom_webhook"
                    : normalizedPlatform;

                options = authorsData
                  .filter((a: any) => {
                    const isStrictPlatform =
                      normalizedPlatform === "wordpress" ||
                      normalizedPlatform === "webflow";

                    if (isStrictPlatform) {
                      return a.external_platform === targetPlatform;
                    }

                    // For custom webhooks, we must strict filter by integration ID if possible
                    // The user's JSON shows "external_id" might be holding a unique ID (like "1", "2")
                    // but the integration object passed to this dialog has an 'id'.
                    // We need to check if we can verify which webhook this author belongs to.
                    // The JSON shows `external_platform: "custom_webhook"`.
                    // But maybe we should check if the author was imported from *this specific* integration?
                    // The Author object usually has `integration_id` if it was imported from one.

                    if (targetPlatform === "custom_webhook") {
                      // Strict filter: Author MUST belong to this integration
                      if (
                        a.integration_id &&
                        a.integration_id === integrationId
                      ) {
                        return true;
                      }
                      // For custom webhooks, merging is not allowed.
                      // If no integration_id match, it's hidden.
                      return false;
                    }

                    return a.external_platform === targetPlatform;
                  })
                  .map((a: any) => ({
                    label: a.name,
                    value: a.external_id || a.id, // Use external_id if present
                    id: a.external_id || a.id,
                    item: a, // Keep full object for icon
                    avatar: a.avatar, // generic avatar field
                  }));

                // If no specific authors found, maybe show all? User seemed specific about "send external_ids".
                // If strictly filtering:
                if (options.length === 0) {
                  // fallback to showing all but maybe warning? Or just all.
                  // Let's stick to showing all validated ones. if empty, maybe show all users as fallback?
                  // User example showed "imported?" true for platform ones.
                }
              } else if (setting.optionsKey) {
                const discovered = discoveredData?.[setting.optionsKey];
                if (discovered) {
                  if (
                    normalizedPlatform === "hashnode" &&
                    setting.optionsKey === "publications"
                  ) {
                    const allSeries: any[] = [];
                    if (Array.isArray(discovered)) {
                      discovered.forEach((pub: any) => {
                        if (pub.series && Array.isArray(pub.series)) {
                          allSeries.push(...pub.series);
                        }
                      });
                    }
                    options = allSeries;
                  } else if (
                    normalizedPlatform === "devto" &&
                    setting.optionsKey === "organizations"
                  ) {
                    // Add "Personal" option and handle images
                    options = [
                      { label: "Personal", value: "null", icon: null }, // distinct null value
                      ...discovered.map((org: any) => ({
                        ...org,
                        icon: org.profile_image || org.avatar, // Map profile_image or avatar to icon
                      })),
                    ];

                    // MERGE: Backfill from authorsData (e.g. imported authors like Texavor)
                    // if they are missing from discovery for some reason
                    if (authorsData) {
                      const existingValues = new Set(
                        options.map((o: any) => String(o.value || o.id)),
                      );

                      authorsData.forEach((author: any) => {
                        if (
                          author.external_platform === "devto" &&
                          author.external_id &&
                          author.external_id !== "personal" &&
                          !existingValues.has(String(author.external_id))
                        ) {
                          options.push({
                            label: author.name,
                            value: author.external_id,
                            icon: author.avatar,
                            id: author.external_id,
                            ...author,
                          });
                          existingValues.add(String(author.external_id));
                        }
                      });
                    }
                  } else if (
                    normalizedPlatform === "devto" &&
                    setting.optionsKey === "tags"
                  ) {
                    // Use discovered tags if available, otherwise use fallback
                    options =
                      discovered.length > 0 ? discovered : DEVTO_FALLBACK_TAGS;
                  } else {
                    options = discovered;
                  }
                } else if (
                  normalizedPlatform === "devto" &&
                  setting.optionsKey === "tags"
                ) {
                  // If no discovered data at all, use fallback tags
                  options = DEVTO_FALLBACK_TAGS;
                }
              }

              // Normalization for components
              const normalizedOptions = options.map((opt: any) => {
                const value =
                  typeof opt === "string"
                    ? opt
                    : opt.value || opt.id || opt.external_id;
                const label =
                  typeof opt === "string"
                    ? opt
                    : opt.label || opt.name || opt.display_name;
                const icon = opt.icon || opt.avatar_url || opt.avatar; // Handle avatar for authors
                return {
                  ...opt,
                  value,
                  label: String(label),
                  name: String(label),
                  id: value,
                  icon,
                };
              });

              // Common Skeleton Loader for dynamic fields
              // If options are expected (optionsKey exists) but empty, and we are loading:
              if (
                setting.optionsKey &&
                normalizedOptions.length === 0 &&
                (isDiscovering ||
                  (setting.optionsKey === "authors" && isLoadingAuthors))
              ) {
                return (
                  <div key={setting.key} className="space-y-2">
                    <Label className="font-inter">{setting.label}</Label>
                    <Skeleton className="h-10 w-full" />
                  </div>
                );
              }

              if (setting.type === "multi-select") {
                return (
                  <div key={setting.key} className="space-y-2">
                    <Label className="font-inter">{setting.label}</Label>
                    <CustomMultiSelect
                      options={normalizedOptions}
                      selected={formData[setting.key] || []}
                      onChange={(val) => handleChange(setting.key, val)}
                      placeholder={setting.placeholder}
                      creatable={true} // Allow creating tags
                    />
                    {setting.description && (
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    )}
                  </div>
                );
              }

              if (setting.type === "custom-dropdown") {
                const selectedOption = normalizedOptions.find(
                  (o: any) => String(o.value) === String(formData[setting.key]),
                );
                return (
                  <div key={setting.key} className="space-y-2">
                    <Label className="font-inter">{setting.label}</Label>
                    <CustomDropdown
                      open={!!dropdownsOpen[setting.key]}
                      onOpenChange={(isOpen: boolean) =>
                        setDropdownsOpen((prev) => ({
                          ...prev,
                          [setting.key]: isOpen,
                        }))
                      }
                      options={normalizedOptions}
                      value={formData[setting.key]}
                      onSelect={(opt: any) => {
                        handleChange(setting.key, opt.value || opt.id);
                        setDropdownsOpen((prev) => ({
                          ...prev,
                          [setting.key]: false,
                        }));
                      }}
                      trigger={
                        <button className="focus-visible:ring-[0px] flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50">
                          <span className="truncate">
                            {selectedOption
                              ? selectedOption.name
                              : setting.placeholder}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </button>
                      }
                    />
                    {setting.description && (
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    )}
                  </div>
                );
              }

              if (setting.type === "autocomplete") {
                return (
                  <div key={setting.key} className="space-y-2">
                    <Label className="font-inter">{setting.label}</Label>
                    <CustomAutocomplete
                      options={normalizedOptions}
                      value={formData[setting.key]}
                      onSelect={(opt) => handleChange(setting.key, opt.id)}
                      placeholder={setting.placeholder}
                      searchPlaceholder={`Search ${setting.label}...`}
                    />
                    {setting.description && (
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    )}
                  </div>
                );
              }

              if (setting.type === "radio") {
                return (
                  <div key={setting.key} className="space-y-2">
                    <Label className="font-inter">{setting.label}</Label>
                    <RadioGroup
                      value={String(formData[setting.key])} // Ensure string for value matching
                      onValueChange={(val) => handleChange(setting.key, val)}
                      defaultValue={options[0]?.value} // Default to first (e.g. false/No)
                      className="flex gap-4"
                    >
                      {options.map((opt: any) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={String(opt.value)}
                            id={`${setting.key}-${opt.value}`}
                          />
                          <Label htmlFor={`${setting.key}-${opt.value}`}>
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {setting.description && (
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    )}
                  </div>
                );
              }

              // Fallback to select or input
              if (setting.type === "select") {
                // Reuse normalizedOptions
                if (!normalizedOptions || normalizedOptions.length === 0) {
                  return (
                    <div key={setting.key} className="space-y-2">
                      <Label className="font-inter">{setting.label}</Label>
                      <Input
                        value={formData[setting.key] || ""}
                        onChange={(e) =>
                          handleChange(setting.key, e.target.value)
                        }
                        placeholder={setting.placeholder}
                      />
                    </div>
                  );
                }

                return (
                  <div key={setting.key} className="space-y-2">
                    <Label htmlFor={setting.key} className="font-inter">
                      {setting.label}
                    </Label>
                    <select
                      id={setting.key}
                      value={formData[setting.key] || ""}
                      onChange={(e) =>
                        handleChange(setting.key, e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      <option value="">Select {setting.label}</option>
                      {normalizedOptions.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {setting.description && (
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={setting.key} className="space-y-2">
                  <Label htmlFor={setting.key} className="font-inter">
                    {setting.label}
                  </Label>
                  {setting.type === "textarea" ? (
                    <Textarea
                      id={setting.key}
                      value={formData[setting.key] || ""}
                      onChange={(e) =>
                        handleChange(setting.key, e.target.value)
                      }
                      placeholder={setting.placeholder}
                      className="font-inter"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={setting.key}
                      value={
                        Array.isArray(formData[setting.key])
                          ? formData[setting.key].join(", ")
                          : formData[setting.key] || ""
                      }
                      onChange={(e) =>
                        handleChange(setting.key, e.target.value)
                      }
                      placeholder={setting.placeholder}
                      className="font-inter"
                    />
                  )}
                  {setting.description && (
                    <p className="text-xs text-gray-500">
                      {setting.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="p-4 border-t border-[#E5E7EB]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || settings.length === 0}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
