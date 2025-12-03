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
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";

interface Integration {
  id: string;
  platform: string;
  name: string;
  settings: Record<string, any>;
}

interface IntegrationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
  onSave?: (settings: Record<string, any>) => void;
  mode?: "global" | "article";
}

const platformSettings: Record<
  string,
  Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "tags";
    placeholder?: string;
    description?: string;
  }>
> = {
  wordpress: [
    {
      key: "post_status",
      label: "Post Status",
      type: "text",
      placeholder: "publish or draft",
      description: "Default status for published articles",
    },
    {
      key: "default_category",
      label: "Default Category",
      type: "text",
      placeholder: "Blog",
      description: "Category name or ID",
    },
    {
      key: "default_tags",
      label: "Default Tags",
      type: "tags",
      placeholder: "AI, Technology, SEO",
      description: "Comma-separated tags",
    },
  ],
  shopify: [
    {
      key: "blog_id",
      label: "Blog ID",
      type: "text",
      placeholder: "123456789",
      description: "Shopify blog ID",
    },
    {
      key: "blog_handle",
      label: "Blog Handle",
      type: "text",
      placeholder: "news",
      description: "Blog handle for URL",
    },
    {
      key: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "Product Updates, News",
      description: "Comma-separated tags",
    },
  ],
  medium: [
    {
      key: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "Technology, AI, Programming",
      description: "Max 5 tags, comma-separated",
    },
    {
      key: "publication_id",
      label: "Publication ID",
      type: "text",
      placeholder: "Optional",
      description: "Medium publication ID (optional)",
    },
  ],
  devto: [
    {
      key: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "webdev, javascript, tutorial",
      description: "Max 4 tags, comma-separated",
    },
  ],
  webflow: [
    {
      key: "collection_id",
      label: "Collection ID",
      type: "text",
      placeholder: "Collection ID",
      description: "Webflow collection ID",
    },
    {
      key: "site_id",
      label: "Site ID",
      type: "text",
      placeholder: "Site ID",
      description: "Webflow site ID",
    },
  ],
  hashnode: [
    {
      key: "publication_id",
      label: "Publication ID",
      type: "text",
      placeholder: "Publication ID",
      description: "Hashnode publication ID",
    },
    {
      key: "tags",
      label: "Tags",
      type: "tags",
      placeholder: "AI, Technology",
      description: "Comma-separated tags",
    },
  ],
  custom_webhook: [
    {
      key: "webhook_url",
      label: "Webhook URL",
      type: "text",
      placeholder: "https://example.com/webhook",
      description: "Webhook endpoint URL",
    },
  ],
  customwebhook: [
    {
      key: "webhook_url",
      label: "Webhook URL",
      type: "text",
      placeholder: "https://example.com/webhook",
      description: "Webhook endpoint URL",
    },
  ],
};

export default function IntegrationSettingsDialog({
  open,
  onOpenChange,
  integration,
  onSave,
  mode = "global",
}: IntegrationSettingsDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (integration) {
      setFormData(integration.settings || {});
    }
  }, [integration]);

  const updateMutation = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const res = await axiosInstance.patch(
        `/api/v1/integrations/${integration?.id}`,
        {
          integration: { settings },
        }
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

    const normalizePlatformName = (name: string) => {
      if (!name) return "";
      return name.toLowerCase().replace(/[.\s-_]/g, "");
    };

    const platformKey = integration?.platform || integration?.name || "";
    const normalizedPlatform = normalizePlatformName(platformKey);
    const settings =
      platformSettings[normalizedPlatform] ||
      platformSettings[platformKey] ||
      [];

    settings.forEach((setting) => {
      if (
        setting.type === "tags" &&
        typeof processedData[setting.key] === "string"
      ) {
        processedData[setting.key] = processedData[setting.key]
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
    });

    if (mode === "article" && onSave) {
      onSave(processedData);
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(processedData);
  };

  if (!integration) return null;

  const normalizePlatformName = (name: string) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[.\s-_]/g, "");
  };

  const platformKey = integration.platform || integration.name || "";
  const normalizedPlatform = normalizePlatformName(platformKey);
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

        <div className="space-y-4 py-4 px-4">
          {settings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No additional settings available for this platform
            </p>
          ) : (
            settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key} className="font-inter">
                  {setting.label}
                </Label>
                {setting.type === "textarea" ? (
                  <Textarea
                    id={setting.key}
                    value={formData[setting.key] || ""}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
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
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={setting.placeholder}
                    className="font-inter"
                  />
                )}
                {setting.description && (
                  <p className="text-xs text-gray-500">{setting.description}</p>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="px-4">
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
