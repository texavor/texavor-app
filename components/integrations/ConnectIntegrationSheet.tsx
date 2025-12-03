import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Lock,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MAPPABLE_FIELDS = [
  {
    label: "Title",
    variable: "{{title}}",
    description: "The title of the article",
  },
  {
    label: "Content",
    variable: "{{content}}",
    description: "The full HTML content",
  },
  {
    label: "Slug",
    variable: "{{slug}}",
    description: "URL friendly slug",
  },
  {
    label: "Description",
    variable: "{{description}}",
    description: "Short excerpt",
  },
  {
    label: "Tags",
    variable: "{{tags}}",
    description: "List of tags",
  },
  {
    label: "Author Name",
    variable: "{{author.name}}",
    description: "Name of the author",
  },
  {
    label: "Canonical URL",
    variable: "{{canonical_url}}",
    description: "Original URL",
  },
];

interface ConnectIntegrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform | null;
  onSuccess: (integrationId: string | number) => void;
  connectMutation: any; // Using any for now to avoid complex type matching with React Query
}

export default function ConnectIntegrationSheet({
  open,
  onOpenChange,
  platform,
  onSuccess,
  connectMutation,
}: ConnectIntegrationSheetProps) {
  const [formData, setFormData] = useState<any>({});
  const [mappingData, setMappingData] = useState<Record<string, string>>({});
  const [customHeaders, setCustomHeaders] = useState<
    { key: string; value: string }[]
  >([]);

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

          // Load custom headers
          if (platform.settings.headers) {
            const headers = Object.entries(platform.settings.headers).map(
              ([key, value]) => ({ key, value: value as string })
            );
            setCustomHeaders(headers);
          }

          // Load field mapping
          if (platform.settings.field_mapping) {
            const mapping: Record<string, string> = {};
            Object.entries(platform.settings.field_mapping).forEach(
              ([key, value]) => {
                mapping[value as string] = key;
              }
            );
            setMappingData(mapping);
          }
          if (platform.settings.field_mapping) {
            const mapping: Record<string, string> = {};
            Object.entries(platform.settings.field_mapping).forEach(
              ([key, value]) => {
                mapping[value as string] = key;
              }
            );
            setMappingData(mapping);
          }
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;

    // Special handling for Shopify OAuth
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

          if (customHeaders.length > 0) {
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
        // Add other cases as needed
        default:
          // Fallback: dump everything into credentials for now
          payload.credentials = { ...formData };
      }

      const result = await connectMutation.mutateAsync(payload);

      if (result.success) {
        toast.success(`Connected to ${platform.name} successfully!`);
        onSuccess(result.integration_id);
        onOpenChange(false);
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
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-foreground/80 font-inter">
                Integration Token
              </Label>
              <Input
                id="token"
                name="token"
                value={formData.token || ""}
                onChange={handleChange}
                required
                placeholder="Your Medium Integration Token"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="user_id"
                className="text-foreground/80 font-inter"
              >
                User ID <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="user_id"
                name="user_id"
                value={formData.user_id || ""}
                onChange={handleChange}
                placeholder="Optional User ID"
                className="font-inter"
              />
            </div>
          </>
        );
      case "devto":
        return (
          <div className="space-y-1.5">
            <Label htmlFor="api_key" className="text-foreground/80 font-inter">
              API Key
            </Label>
            <Input
              id="api_key"
              name="api_key"
              value={formData.api_key || ""}
              onChange={handleChange}
              required
              placeholder="Your Dev.to API Key"
              className="font-inter"
            />
          </div>
        );
      case "hashnode":
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-foreground/80 font-inter">
                Personal Access Token
              </Label>
              <Input
                id="token"
                name="token"
                value={formData.token || ""}
                onChange={handleChange}
                required
                placeholder="Your Hashnode PAT"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="publication_id"
                className="text-foreground/80 font-inter"
              >
                Publication ID
              </Label>
              <Input
                id="publication_id"
                name="publication_id"
                value={formData.publication_id || ""}
                onChange={handleChange}
                required
                placeholder="Your Publication ID"
                className="font-inter"
              />
            </div>
          </>
        );
      case "wordpress":
        return (
          <>
            <div className="space-y-1.5">
              <Label
                htmlFor="site_url"
                className="text-foreground/80 font-inter"
              >
                Site URL
              </Label>
              <Input
                id="site_url"
                name="site_url"
                value={formData.site_url || ""}
                onChange={handleChange}
                required
                placeholder="https://your-site.com"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-foreground/80 font-inter"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                required
                placeholder="WP Admin Username"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-foreground/80 font-inter"
              >
                Application Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleChange}
                required
                placeholder="Application Password"
                className="font-inter"
              />
            </div>

            {/* WordPress Requirements Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-amber-900 font-inter font-semibold mb-1">
                  WordPress Requirements
                </p>
                <p className="text-xs text-amber-800 font-inter leading-relaxed">
                  Application Passwords are only available on{" "}
                  <span className="font-semibold">self-hosted WordPress</span>{" "}
                  (WordPress.org) or{" "}
                  <span className="font-semibold">
                    WordPress.com Business plan
                  </span>{" "}
                  and above. Free, Personal, and Premium plans do not support
                  Application Passwords.
                </p>
              </div>
            </div>
          </>
        );
      case "webflow":
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-foreground/80 font-inter">
                API Token
              </Label>
              <Input
                id="token"
                name="token"
                value={formData.token || ""}
                onChange={handleChange}
                required
                placeholder="Your Webflow API Token"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="site_id"
                className="text-foreground/80 font-inter"
              >
                Site ID
              </Label>
              <Input
                id="site_id"
                name="site_id"
                value={formData.site_id || ""}
                onChange={handleChange}
                required
                placeholder="Your Webflow Site ID"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="collection_id"
                className="text-foreground/80 font-inter"
              >
                Collection ID
              </Label>
              <Input
                id="collection_id"
                name="collection_id"
                value={formData.collection_id || ""}
                onChange={handleChange}
                required
                placeholder="Your Collection ID"
                className="font-inter"
              />
            </div>
          </>
        );
      case "shopify":
        return (
          <>
            <div className="space-y-1.5">
              <Label
                htmlFor="shop_domain"
                className="text-foreground/80 font-inter"
              >
                Shop Domain
              </Label>
              <Input
                id="shop_domain"
                name="shop_domain"
                value={formData.shop_domain || ""}
                onChange={handleChange}
                required
                placeholder="your-store.myshopify.com"
                className="font-inter"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter your Shopify store domain (e.g., yourstore.myshopify.com)
              </p>
            </div>
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
          <>
            <div className="space-y-1.5">
              <Label htmlFor="label" className="text-foreground/80 font-inter">
                Webhook Label
              </Label>
              <Input
                id="label"
                name="label"
                value={formData.label || ""}
                onChange={handleChange}
                required
                placeholder="My Custom Blog"
                className="font-inter"
              />
              <p className="text-[11px] text-muted-foreground">
                A friendly name for this webhook integration
              </p>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="webhook_url"
                className="text-foreground/80 font-inter"
              >
                Webhook URL
              </Label>
              <Input
                id="webhook_url"
                name="webhook_url"
                value={formData.webhook_url || ""}
                onChange={handleChange}
                required
                placeholder="https://api.example.com/webhook"
                className="font-inter"
              />
              <p className="text-[11px] text-muted-foreground">
                The URL where we should send the article data
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/80 font-inter">
                  Custom Headers
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomHeaders([...customHeaders, { key: "", value: "" }])
                  }
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Header
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">
                Add custom headers for authentication or other purposes.
              </p>

              {customHeaders.length > 0 ? (
                <div className="grid gap-2 border rounded-lg p-4 bg-gray-50/50">
                  {customHeaders.map((header, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-5">
                        <Input
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...customHeaders];
                            newHeaders[index].key = e.target.value;
                            setCustomHeaders(newHeaders);
                          }}
                          placeholder="Key (e.g. Authorization)"
                          className="h-8 text-xs font-inter font-mono bg-white"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...customHeaders];
                            newHeaders[index].value = e.target.value;
                            setCustomHeaders(newHeaders);
                          }}
                          placeholder="Value"
                          className="h-8 text-xs font-inter font-mono bg-white"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newHeaders = customHeaders.filter(
                              (_, i) => i !== index
                            );
                            setCustomHeaders(newHeaders);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed rounded-lg bg-gray-50/50">
                  <p className="text-xs text-muted-foreground">
                    No custom headers added.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Label className="text-foreground/80 font-inter">
                Field Mapping (Optional)
              </Label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Enter the JSON key you want to use for each field. Leave empty
                to skip.
              </p>

              <div className="grid gap-3 border rounded-lg p-4 bg-gray-50/50">
                {MAPPABLE_FIELDS.map((field) => (
                  <div
                    key={field.variable}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-4">
                      <Label
                        htmlFor={`mapping-${field.variable}`}
                        className="text-xs font-medium text-gray-700"
                      >
                        {field.label}
                      </Label>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {field.variable}
                      </p>
                    </div>
                    <div className="col-span-8">
                      <Input
                        id={`mapping-${field.variable}`}
                        value={mappingData[field.variable] || ""}
                        onChange={(e) =>
                          setMappingData({
                            ...mappingData,
                            [field.variable]: e.target.value,
                          })
                        }
                        placeholder={`Key for ${field.label}`}
                        className="h-8 text-xs font-inter font-mono bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border rounded-xl shadow-md">
              <AvatarImage src={platform?.logo_url} />
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
              <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
                Connected Account
              </h3>
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
                        platform: platform.id,
                        settings: {
                          primary: checked,
                        },
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

        <SheetFooter className="p-6 border-t sm:justify-between bg-white">
          <Button
            type="submit"
            form="connect-form"
            disabled={connectMutation.isPending}
            className="w-full bg-[#104127] hover:bg-[#0A2918] text-white font-inter"
          >
            {connectMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : platform?.id === "shopify" ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect Shopify Store
              </>
            ) : (
              "Connect Integration"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
