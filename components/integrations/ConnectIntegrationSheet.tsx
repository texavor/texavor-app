import { fetchFromPlatform } from "@/lib/api/authors";
import { discoverIntegrationSettings } from "@/lib/api/integrations";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import React, { useEffect, useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, ExternalLink, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomAlertDialog } from "@/components/ui/CustomAlertDialog";
import { MediumForm } from "./forms/MediumForm";
import { DevtoForm } from "./forms/DevtoForm";
import { HashnodeForm } from "./forms/HashnodeForm";
import { WordpressForm } from "./forms/WordpressForm";
import { WebflowForm } from "./forms/WebflowForm";
import { ShopifyForm } from "./forms/ShopifyForm";
import { CustomWebhookForm } from "./forms/CustomWebhookForm";
import { SubstackForm } from "./forms/SubstackForm";

import { useAppStore } from "@/store/appStore";

interface ConnectIntegrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform | null;
  onSuccess: (integrationId: string | number) => void;
  connectMutation: any; // Using any for now to avoid complex type matching with React Query
  disconnectMutation: any;
}

export default function ConnectIntegrationSheet({
  open,
  onOpenChange,
  platform,
  onSuccess,
  connectMutation,
  disconnectMutation,
}: ConnectIntegrationSheetProps) {
  const { blogs } = useAppStore();
  const [formData, setFormData] = useState<any>({});
  const [mappingData, setMappingData] = useState<Record<string, string>>({});
  const [customHeaders, setCustomHeaders] = useState<
    { key: string; value: string }[]
  >([]);

  // Discovery state
  const [discoveredData, setDiscoveredData] = useState<any>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showDiscoveryFields, setShowDiscoveryFields] = useState(false);

  const [isDisconnectAlertOpen, setIsDisconnectAlertOpen] = useState(false);

  // Shopify blog selection state
  const [shopifyBlogs, setShopifyBlogs] = useState<
    { id: string; title: string; handle: string }[]
  >([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [isFetchingBlogs, setIsFetchingBlogs] = useState(false);

  // Fetch Shopify blogs when connected and needs blog selection
  useEffect(() => {
    if (platform?.id === "shopify" && platform.is_connected) {
      // Check if blog selection is needed
      if (platform.settings?.needs_blog_selection) {
        fetchShopifyBlogs();
      } else if (platform.settings?.blog_id) {
        // Already has a blog selected
        setSelectedBlogId(platform.settings.blog_id);
      }
    }
  }, [platform]);

  const fetchShopifyBlogs = async () => {
    if (!platform?.integration_id) return;

    setIsFetchingBlogs(true);
    try {
      const blogId = (window as any).blogs?.id; // Get from store or context
      const response = await fetch(
        `/api/v1/blogs/${blogId}/integrations/${platform.integration_id}/shopify/blogs`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch blogs");

      const data = await response.json();
      setShopifyBlogs(data.blogs || []);

      // Auto-select if only one blog
      if (data.auto_selected && data.blogs?.length === 1) {
        setSelectedBlogId(data.blogs[0].id);
      }
    } catch (error) {
      console.error("Error fetching Shopify blogs:", error);
      toast.error("Failed to load Shopify blogs");
    } finally {
      setIsFetchingBlogs(false);
    }
  };

  // Reset form when platform changes and load existing settings if connected
  useEffect(() => {
    if (!platform) {
      setFormData({});
      setMappingData({});
      setCustomHeaders([]);
      return;
    }

    // If platform is connected, pre-populate with existing settings
    if (platform.is_connected && platform.settings) {
      const newFormData: Record<string, string> = {};
      const MASKED_VALUE = "*********************"; // 10 asterisks for masked credentials

      switch (platform.id) {
        case "medium":
          // Mask token (sensitive), show user_id (non-sensitive)
          newFormData.token = MASKED_VALUE;
          if (platform.settings.user_id) {
            newFormData.user_id = platform.settings.user_id;
          }
          break;

        case "devto":
          // Mask API key (sensitive)
          newFormData.api_key = MASKED_VALUE;
          break;

        case "hashnode":
          // Mask token (sensitive), show publication_id (non-sensitive)
          newFormData.token = MASKED_VALUE;
          if (platform.settings.publication_id) {
            newFormData.publication_id = platform.settings.publication_id;
          }
          break;

        case "wordpress":
          // Show site_url and username, mask password (sensitive)
          if (platform.settings.site_url) {
            newFormData.site_url = platform.settings.site_url;
          }
          if (platform.settings.username) {
            newFormData.username = platform.settings.username;
          }
          newFormData.password = MASKED_VALUE;
          break;

        case "webflow":
          // Mask token (sensitive), show site_id and collection_id (non-sensitive)
          newFormData.token = MASKED_VALUE;
          if (platform.settings.site_id) {
            newFormData.site_id = platform.settings.site_id;
          }
          if (platform.settings.collection_id) {
            newFormData.collection_id = platform.settings.collection_id;
          }
          break;

        case "shopify":
          // Mask access_token (sensitive), show shop_domain, blog_id, blog_handle (non-sensitive)
          console.log("Shopify settings:", platform.settings);
          newFormData.access_token = MASKED_VALUE;
          // Use domain or myshopify_domain from settings
          const shopDomain =
            platform.settings.domain ||
            platform.settings.myshopify_domain ||
            platform.settings.shop_domain;
          console.log("Shop domain found:", shopDomain);
          if (shopDomain) {
            newFormData.shop_domain = shopDomain;
          }
          if (platform.settings.blog_id) {
            newFormData.blog_id = platform.settings.blog_id;
            setSelectedBlogId(platform.settings.blog_id);
          }
          if (platform.settings.blog_handle) {
            newFormData.blog_handle = platform.settings.blog_handle;
          }
          break;

        case "custom_webhook":
          // Show all webhook settings (non-sensitive)
          if (platform.settings.webhook_url) {
            newFormData.webhook_url = platform.settings.webhook_url;
          }
          if (platform.settings.label) {
            newFormData.label = platform.settings.label;
          }
          if (platform.settings.content_format) {
            newFormData.content_format = platform.settings.content_format;
          }
          if (platform.settings.response_id_field) {
            newFormData.response_id_field = platform.settings.response_id_field;
          }
          if (platform.settings.auth_type) {
            newFormData.auth_type = platform.settings.auth_type;
          }
          if (platform.settings.content_format) {
            newFormData.content_format = platform.settings.content_format;
          }
          if (platform.settings.response_id_field) {
            newFormData.response_id_field = platform.settings.response_id_field;
          }
          if (platform.settings.response_url_field) {
            newFormData.response_url_field =
              platform.settings.response_url_field;
          }
          if (platform.settings.public_url_pattern) {
            newFormData.public_url_pattern =
              platform.settings.public_url_pattern;
          }
          if (platform.settings.update_url) {
            newFormData.update_url = platform.settings.update_url;
          }
          if (platform.settings.delete_url) {
            newFormData.delete_url = platform.settings.delete_url;
          }
          if (platform.settings.update_method) {
            newFormData.update_method = platform.settings.update_method;
          }
          if (platform.settings.timeout) {
            newFormData.timeout = platform.settings.timeout;
          }
          if (platform.settings.api_key_location) {
            newFormData.api_key_location = platform.settings.api_key_location;
          }
          if (platform.settings.api_key_name) {
            newFormData.api_key_name = platform.settings.api_key_name;
          }
          if (platform.settings.cookie_name) {
            newFormData.cookie_name = platform.settings.cookie_name;
          }

          // Load custom headers
          if (platform.settings.headers) {
            const headers = Object.entries(platform.settings.headers).map(
              ([key, value]) => ({ key, value: value as string }),
            );
            setCustomHeaders(headers);
          }

          // Load field mapping
          if (platform.settings.field_mapping) {
            const mapping: Record<string, string> = {};
            Object.entries(platform.settings.field_mapping).forEach(
              ([key, value]) => {
                mapping[value as string] = key;
              },
            );
            setMappingData(mapping);
          }
          if (platform.settings.field_mapping) {
            const mapping: Record<string, string> = {};
            Object.entries(platform.settings.field_mapping).forEach(
              ([key, value]) => {
                mapping[value as string] = key;
              },
            );
            setMappingData(mapping);
          }
          break;

        case "substack":
          // Mask cookie (sensitive), show subdomain
          if (platform.settings.subdomain) {
            newFormData.subdomain = platform.settings.subdomain;
          } else if (platform.settings.username) {
            newFormData.subdomain = platform.settings.username;
          }
          newFormData.cookie = MASKED_VALUE;
          break;
      }

      // Load primary setting if it exists
      if (platform.settings.primary) {
        newFormData.primary = platform.settings.primary;
      }

      setFormData(newFormData);
    } else {
      // Reset for new connections
      setFormData({});
      setMappingData({});
      setCustomHeaders([]);
    }
  }, [platform]);

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: any } },
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;

    // Substack Validation
    if (platform.id === "substack") {
      if (!formData.subdomain) {
        toast.error("Please enter your Substack subdomain");
        return;
      }
      if (!formData.cookie) {
        toast.error("Please enter your Session Cookie");
        return;
      }
    }

    // For Shopify blog selection (when editing existing integration with blog selector)
    if (
      platform.id === "shopify" &&
      platform.is_connected &&
      platform.settings?.needs_blog_selection
    ) {
      if (!selectedBlogId) {
        toast.error("Please select a blog");
        return;
      }

      const selectedBlog = shopifyBlogs.find((b) => b.id === selectedBlogId);
      if (!selectedBlog) {
        toast.error("Please select a valid blog");
        return;
      }

      try {
        const blogId =
          (window as any).blogs?.id || localStorage.getItem("currentBlogId");
        const response = await fetch(
          `/api/v1/blogs/${blogId}/integrations/${platform.integration_id}/shopify/settings`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blog_id: selectedBlogId,
              blog_handle: selectedBlog.handle,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update blog selection");
        }

        toast.success("Blog selection updated successfully");
        onOpenChange(false);
        if (platform.integration_id) {
          onSuccess(platform.integration_id);
        }
        return;
      } catch (error: any) {
        console.error("Error updating Shopify blog:", error);
        toast.error(error.message || "Failed to update blog selection");
        return;
      }
    }

    // Shopify OAuth flow (for new connections)
    if (platform.id === "shopify") {
      if (!formData.shop_domain) {
        toast.error("Please enter your shop domain");
        return;
      }

      try {
        // Normalize shop domain
        let shop = formData.shop_domain.trim().toLowerCase();
        // Remove https:// or http:// if present
        shop = shop.replace(/^https?:\/\//, "");
        // Remove trailing slash
        shop = shop.replace(/\/$/, "");
        // Add .myshopify.com if not present
        if (!shop.includes(".myshopify.com")) {
          shop = `${shop}.myshopify.com`;
        }

        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const installUrl = `${backendUrl}/api/v1/shopify/oauth/install?shop=${shop}`;

        // Redirect to backend OAuth endpoint
        window.location.href = installUrl;
        return;
      } catch (error) {
        console.error("Shopify connection error:", error);
        toast.error("Failed to initiate Shopify connection");
        return;
      }
    }

    try {
      // Construct payload based on platform requirements
      const payload: any = {
        platform: platform.id,
        credentials: {},
        settings: {},
      };

      // Map form data to payload based on platform
      switch (platform.id) {
        case "medium":
          payload.credentials.token = formData.token;
          if (formData.user_id) payload.credentials.user_id = formData.user_id;
          break;
        case "devto":
          payload.credentials.api_key = formData.api_key;
          break;
        case "hashnode":
          payload.credentials.token = formData.token;
          payload.settings.publication_id = formData.publication_id;
          break;
        case "wordpress":
          payload.credentials.username = formData.username;
          payload.credentials.password = formData.password;
          payload.settings.site_url = formData.site_url;
          break;
        case "webflow":
          payload.credentials.token = formData.token;
          payload.settings.site_id = formData.site_id;
          payload.settings.collection_id = formData.collection_id;
          break;
        case "shopify":
          // Should not reach here due to early return, but kept for safety
          payload.credentials.access_token = formData.access_token;
          payload.settings.shop_domain = formData.shop_domain;
          break;
        case "custom_webhook":
          payload.settings.webhook_url = formData.webhook_url;
          payload.settings.label = formData.label;
          payload.settings.content_format =
            formData.content_format || "markdown";
          payload.settings.auth_type = formData.auth_type;

          // Map credentials based on auth_type
          switch (formData.auth_type) {
            case "bearer":
              payload.credentials.auth_token = formData.auth_token;
              break;
            case "api_key":
              payload.credentials.api_key = formData.api_key;
              payload.settings.api_key_location =
                formData.api_key_location || "header";
              payload.settings.api_key_name =
                formData.api_key_name || "X-API-Key";
              break;
            case "basic":
              payload.credentials.username = formData.username;
              payload.credentials.password = formData.password;
              break;
            case "session":
              payload.credentials.session_token = formData.session_token;
              payload.settings.cookie_name =
                formData.cookie_name || "session_id";
              break;
            case "custom":
              if (customHeaders.length > 0) {
                const headers: Record<string, string> = {};
                customHeaders.forEach(({ key, value }) => {
                  if (key.trim()) headers[key.trim()] = value;
                });
                payload.credentials.custom_headers = headers;
              }
              break;
          }

          if (formData.response_id_field) {
            payload.settings.response_id_field = formData.response_id_field;
          }
          if (formData.response_url_field) {
            payload.settings.response_url_field = formData.response_url_field;
          }
          if (formData.public_url_pattern) {
            payload.settings.public_url_pattern = formData.public_url_pattern;
          }
          if (formData.update_url) {
            payload.settings.update_url = formData.update_url;
          }
          if (formData.delete_url) {
            payload.settings.delete_url = formData.delete_url;
          }
          if (formData.update_method) {
            payload.settings.update_method = formData.update_method;
          }
          if (formData.timeout) {
            payload.settings.timeout = Number(formData.timeout);
          }

          // Legacy custom headers support (if keeping for direct header injection mostly for non-sensitive or custom auth debug)
          // Ideally rely on auth_type="custom" for headers, but this can remain as global headers
          if (customHeaders.length > 0 && formData.auth_type !== "custom") {
            const headers: Record<string, string> = {};
            customHeaders.forEach(({ key, value }) => {
              if (key.trim()) {
                headers[key.trim()] = value;
              }
            });

            if (Object.keys(headers).length > 0) {
              payload.settings.headers = headers;
            }
          }

          if (Object.keys(mappingData).length > 0) {
            const fieldMapping: Record<string, string> = {};
            Object.entries(mappingData).forEach(([variable, key]) => {
              if (key && key.trim()) {
                fieldMapping[key.trim()] = variable;
              }
            });

            if (Object.keys(fieldMapping).length > 0) {
              payload.settings.field_mapping = fieldMapping;
            }
          }
          break;
        case "substack":
          payload.credentials.subdomain = formData.subdomain;
          payload.credentials.cookie = formData.cookie;
          break;
        // Add other cases as needed
        default:
          // Fallback: dump everything into credentials for now
          payload.credentials = { ...formData };
      }

      // If we are in "Discovery/Update" mode (already connected or just connected and found options)
      if (showDiscoveryFields && platform.integration_id) {
        try {
          const blogId = blogs?.id || localStorage.getItem("currentBlogId");
          if (!blogId) {
            toast.error("Blog ID not found. Please select a blog.");
            return;
          }

          // use the same patch endpoint as Shopify or general update
          const settingsPayload: any = {};

          if (platform.id === "hashnode") {
            if (formData.publication_id)
              settingsPayload.publication_id = formData.publication_id;
          } else if (platform.id === "webflow") {
            if (formData.collection_id)
              settingsPayload.collection_id = formData.collection_id;
            if (formData.authors_collection_id)
              settingsPayload.authors_collection_id =
                formData.authors_collection_id;
          }

          if (Object.keys(settingsPayload).length > 0) {
            const response = await fetch(
              `/api/v1/blogs/${blogId}/integrations/${platform.integration_id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  integration: { settings: settingsPayload },
                }),
              },
            );

            if (!response.ok) throw new Error("Failed to save settings");
            toast.success("Settings saved successfully");
          }

          onSuccess(platform.integration_id);
          onOpenChange(false);
          return;
        } catch (e) {
          console.error("Failed to save settings", e);
          toast.error("Failed to save settings");
          return;
        }
      }

      const result = await connectMutation.mutateAsync({
        data: payload,
        integrationId: platform.is_connected
          ? platform.integration_id
          : undefined,
      });

      if (result.success) {
        toast.success(`Connected to ${platform.name} successfully!`);

        // Check if platform supports discovery
        if (["devto", "hashnode", "webflow"].includes(platform.id)) {
          try {
            const blogId = blogs?.id || localStorage.getItem("currentBlogId");
            // Attempt to find ID in various common locations
            const integrationId =
              result.integration_id || result.integration?.id || result.id;

            if (blogId && integrationId) {
              setIsDiscovering(true);
              const discoveryResult = await discoverIntegrationSettings(
                blogId,
                integrationId,
              );

              if (discoveryResult.success && discoveryResult.discovered) {
                setDiscoveredData(discoveryResult.discovered);
                setShowDiscoveryFields(true);

                // Update the platform object locally to have the integration_id so we can save later

                // We need to temporarily mock/update the platform ID for this component's lifecycle.
                // Or better, use a local state for `currentIntegrationId`.

                onSuccess(result.integration_id);
                // DONT close sheet.

                // Store the ID for the next "Save" pass
                platform.integration_id = result.integration_id;
                // Dirty hack? Yes. But standard objects in JS are references.
                // If `platform` is from a list in parent, this might update it in memory.
                // Better approach: Use a ref or state variable.

                // toast.message("Additional options fetched.");
                return;
              }
            } else {
              console.error("Missing ID for discovery:", {
                blogId,
                integrationId,
              });
              if (!blogId)
                toast.error("Could not fetch options: Blog ID missing.");
              if (!integrationId)
                toast.error("Could not fetch options: Integration ID missing.");
            }
          } catch (err) {
            console.error("Discovery failed", err);
            // Fallback: just close if discovery fails?
            toast.error("Connected, but failed to fetch options.");
          } finally {
            setIsDiscovering(false);
          }
        }

        onSuccess(result.integration_id);
        onOpenChange(false);

        // Auto-fetch authors for supported platforms
        if (["devto", "hashnode", "custom_webhook"].includes(platform.id)) {
          try {
            const blogId = blogs?.id;
            const integrationId =
              result.integration_id || result.integration?.id || result.id;
            if (blogId && integrationId) {
              await fetchFromPlatform(blogId, integrationId);
              // toast.success("Authors fetched successfully");
            }
          } catch (error) {
            console.error("Failed to auto-fetch authors:", error);
          }
        }
      } else {
        toast.error("Failed to connect. Please check your credentials.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      // toast.error("An error occurred while connecting.");
    }
  };

  const renderFields = () => {
    if (!platform) return null;

    switch (platform.id) {
      case "medium":
        return <MediumForm formData={formData} handleChange={handleChange} />;
      case "devto":
        return (
          <DevtoForm
            formData={formData}
            handleChange={handleChange}
            discovered={discoveredData}
          />
        );
      case "hashnode":
        return (
          <HashnodeForm
            formData={formData}
            handleChange={handleChange}
            discovered={discoveredData}
          />
        );
      case "substack":
        return <SubstackForm formData={formData} handleChange={handleChange} />;
      case "wordpress":
        return (
          <WordpressForm formData={formData} handleChange={handleChange} />
        );
      case "webflow":
        return (
          <WebflowForm
            formData={formData}
            handleChange={handleChange}
            discovered={discoveredData}
          />
        );
      case "shopify":
        return (
          <>
            <ShopifyForm formData={formData} handleChange={handleChange} />

            {/* Blog Selection - Show if connected and either needs selection or has selected blog */}
            {platform.is_connected &&
              (platform.settings?.needs_blog_selection ||
                platform.settings?.blog_id) && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="blog_select"
                    className="text-foreground/80 font-inter"
                  >
                    Shopify Blog
                  </Label>
                  {isFetchingBlogs ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-600 font-inter">
                        Loading blogs...
                      </span>
                    </div>
                  ) : shopifyBlogs.length > 0 ? (
                    <>
                      <select
                        id="blog_select"
                        value={selectedBlogId}
                        onChange={(e) => setSelectedBlogId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">-- Select a blog --</option>
                        {shopifyBlogs.map((blog) => (
                          <option key={blog.id} value={blog.id}>
                            {blog.title} ({blog.handle})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-muted-foreground">
                        Choose which Shopify blog to publish articles to
                      </p>
                    </>
                  ) : platform.settings?.blog_id ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                      <p className="text-sm text-gray-700 font-inter">
                        Current blog:{" "}
                        {platform.settings.blog_handle ||
                          platform.settings.blog_id}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-start">
              <ExternalLink className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-blue-800 font-inter font-semibold mb-1">
                  Redirects to Shopify
                </p>
                <p className="text-xs text-blue-700 font-inter">
                  You'll be redirected to Shopify to authorize the connection.
                </p>
              </div>
            </div>
          </>
        );
      case "custom_webhook":
        return (
          <CustomWebhookForm
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            customHeaders={customHeaders}
            setCustomHeaders={setCustomHeaders}
            mappingData={mappingData}
            setMappingData={setMappingData}
            blogId={
              (window as any).blogs?.id || localStorage.getItem("currentBlogId")
            }
            integrationId={platform.integration_id}
          />
        );
      default:
        return null;
    }
  };

  const computedLogoUrl = useMemo(() => {
    if (platform?.id === "custom_webhook") {
      return "/integration/webhook.png";
    }
    return platform?.logo_url;
  }, [platform]);

  const handleManualDiscovery = async () => {
    if (
      !platform?.integration_id ||
      !["devto", "hashnode", "webflow"].includes(platform.id)
    )
      return;

    setIsDiscovering(true);
    try {
      const blogId = blogs?.id || localStorage.getItem("currentBlogId");
      // For existing connections, platform.integration_id is reliable
      const integrationId = platform.integration_id;

      if (blogId && integrationId) {
        const discoveryResult = await discoverIntegrationSettings(
          blogId,
          integrationId,
        );
        if (discoveryResult.success && discoveryResult.discovered) {
          setDiscoveredData(discoveryResult.discovered);
          setShowDiscoveryFields(true);
          toast.success("Options refreshed successfully");
        } else {
          toast.info("No new options found");
        }
      } else {
        toast.error("Missing ID for discovery");
      }
    } catch (err) {
      console.error("Manual discovery failed", err);
      toast.error("Failed to fetch options");
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border rounded-xl shadow-md">
              <AvatarImage src={computedLogoUrl} />
              <AvatarFallback className="text-lg font-bold">
                {platform?.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                Connect {platform?.name}
              </SheetTitle>
              <SheetDescription className="font-inter">
                Enter your credentials to connect your {platform?.name} account.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
          {/* Connected Account Information */}
          {platform?.is_connected && platform?.settings && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
                  Connected Account
                </h3>
                {/* Manual Discovery Button */}
                {["devto", "hashnode", "webflow"].includes(platform.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualDiscovery}
                    disabled={isDiscovering}
                    className="h-7 text-xs"
                  >
                    {isDiscovering ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Refresh Options
                  </Button>
                )}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-emerald-200 shadow-sm">
                    <AvatarImage src={platform.settings.profile_image} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                      {platform.settings.site_short_name
                        ?.substring(0, 2)
                        .toUpperCase() ||
                        platform.settings.name?.substring(0, 2).toUpperCase() ||
                        platform.settings.username
                          ?.substring(0, 2)
                          .toUpperCase() ||
                        platform.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    {platform.settings.name && (
                      <p className="font-semibold text-emerald-900 font-poppins">
                        {platform?.settings?.site_name ||
                          platform?.settings?.name}
                      </p>
                    )}

                    {platform?.id !== "custom_webhook" && (
                      <p className="text-sm text-emerald-700 font-inter">
                        @
                        {platform?.id === "shopify"
                          ? platform?.settings?.domain ||
                            platform?.settings?.myshopify_domain
                          : platform?.settings?.site_short_name ||
                            platform?.settings?.username}
                      </p>
                    )}

                    {platform?.settings?.label && !platform?.settings?.name && (
                      <p className="font-semibold text-emerald-900 font-poppins">
                        {platform.settings.label}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <form id="connect-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Integration Switch */}
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-gray-50/50">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="primary-integration" className="font-medium">
                    Set as Primary Integration
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          This will be used to fetch URL and passed to other
                          platform as canonical URL
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs text-muted-foreground">
                  Mark this integration as the primary source for canonical
                  URLs.
                </span>
              </div>
              <Switch
                id="primary-integration"
                checked={Boolean(formData.primary)}
                onCheckedChange={async (checked) => {
                  setFormData({ ...formData, primary: checked });

                  // If connected, update immediately
                  if (platform?.is_connected) {
                    try {
                      await connectMutation.mutateAsync({
                        data: {
                          platform: platform.id,
                          settings: {
                            primary: checked,
                          },
                        },
                        integrationId: platform.integration_id,
                      });
                      toast.success("Primary status updated");
                    } catch (error) {
                      console.error("Failed to update primary status:", error);
                      toast.error("Failed to update primary status");
                      // Revert on error
                      setFormData({ ...formData, primary: !checked });
                    }
                  }
                }}
              />
            </div>

            <section className="space-y-4">
              <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
                Configuration
              </h3>
              <div className="space-y-4">
                {renderFields()}

                {platform?.id !== "shopify" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-start">
                    <Lock className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-800 font-inter font-semibold mb-1">
                        Security Assurance
                      </p>
                      <p className="text-xs text-blue-700 font-inter">
                        Your credentials and keys are stored with caution and
                        are fully encrypted.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </form>
        </div>

        <SheetFooter className="p-6 border-t flex flex-col sm:flex-row gap-3 sm:justify-between bg-white">
          {platform?.is_connected && (
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={disconnectMutation.isPending}
              onClick={() => setIsDisconnectAlertOpen(true)}
            >
              Disconnect
            </Button>
          )}
          <Button
            type="submit"
            form="connect-form"
            className={`bg-[#104127] hover:bg-[#0A2918] text-white font-inter ${
              platform?.is_connected ? "w-full sm:flex-1" : "w-full"
            }`}
            disabled={connectMutation.isPending || isDiscovering}
          >
            {isDiscovering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching options...
              </>
            ) : showDiscoveryFields ? (
              "Save Settings"
            ) : platform?.is_connected ? (
              "Reconnect"
            ) : (
              "Connect"
            )}
          </Button>
        </SheetFooter>

        <CustomAlertDialog
          open={isDisconnectAlertOpen}
          onOpenChange={setIsDisconnectAlertOpen}
          title="Disconnect Integration?"
          description="Are you sure you want to disconnect this integration? This action cannot be undone and may affect your published articles."
          confirmText="Disconnect"
          variant="destructive"
          onConfirm={async () => {
            if (platform?.integration_id) {
              try {
                await disconnectMutation.mutateAsync(platform.integration_id);
                setIsDisconnectAlertOpen(false);
                onOpenChange(false);
              } catch (error) {
                // Error handled by mutation
              }
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
