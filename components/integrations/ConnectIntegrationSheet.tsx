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
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [mappingData, setMappingData] = useState<Record<string, string>>({});

  // Reset form when platform changes
  // Reset form when platform changes
  useEffect(() => {
    setFormData({});
    setMappingData({});
  }, [platform]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;

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
          payload.credentials.access_token = formData.access_token;
          payload.settings.shop_domain = formData.shop_domain;
          payload.settings.blog_id = formData.blog_id;
          if (formData.blog_handle)
            payload.settings.blog_handle = formData.blog_handle;
          break;
        case "custom_webhook":
          payload.settings.webhook_url = formData.webhook_url;
          payload.settings.label = formData.label;

          if (formData.headers) {
            try {
              payload.settings.headers = JSON.parse(formData.headers);
            } catch (e) {
              toast.error("Invalid JSON format for Headers");
              return;
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
      toast.error("An error occurred while connecting.");
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
                htmlFor="access_token"
                className="text-foreground/80 font-inter"
              >
                Admin API Access Token
              </Label>
              <Input
                id="access_token"
                name="access_token"
                value={formData.access_token || ""}
                onChange={handleChange}
                required
                placeholder="Your Shopify Admin API Token"
                className="font-inter"
              />
            </div>
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
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="blog_id"
                className="text-foreground/80 font-inter"
              >
                Blog ID
              </Label>
              <Input
                id="blog_id"
                name="blog_id"
                value={formData.blog_id || ""}
                onChange={handleChange}
                required
                placeholder="123456789"
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="blog_handle"
                className="text-foreground/80 font-inter"
              >
                Blog Handle (Optional)
              </Label>
              <Input
                id="blog_handle"
                name="blog_handle"
                value={formData.blog_handle || ""}
                onChange={handleChange}
                placeholder="news"
                className="font-inter"
              />
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

            <div className="space-y-1.5">
              <Label
                htmlFor="headers"
                className="text-foreground/80 font-inter"
              >
                Custom Headers (JSON)
              </Label>
              <Textarea
                id="headers"
                name="headers"
                value={formData.headers || ""}
                onChange={(e) =>
                  setFormData({ ...formData, headers: e.target.value })
                }
                placeholder='{"Authorization": "Bearer token123"}'
                className="min-h-[80px] font-inter font-mono text-xs resize-none focus-visible:ring-[0px]"
              />
              <p className="text-[11px] text-muted-foreground">
                JSON object with custom headers for authentication
              </p>
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
          <form id="connect-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-poppins font-medium text-[#0A2918] uppercase tracking-wider">
                Configuration
              </h3>
              <div className="space-y-4">
                {renderFields()}

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-start">
                  <Lock className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-blue-800 font-inter font-semibold mb-1">
                      Security Assurance
                    </p>
                    <p className="text-xs text-blue-700 font-inter">
                      Your credentials and keys are stored with caution and are
                      fully encrypted.
                    </p>
                  </div>
                </div>
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
            ) : (
              "Connect Integration"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
