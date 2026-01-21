"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import { useIntegrationsApi } from "@/app/(dashboard)/integrations/hooks/useIntegrationsApi";
import { Loader2, Settings2, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthorConfigurationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Platform | null;
  onSuccess: () => void;
}

export function AuthorConfigurationSheet({
  open,
  onOpenChange,
  integration,
  onSuccess,
}: AuthorConfigurationSheetProps) {
  const { connectIntegration, getCollections } = useIntegrationsApi();
  const [formData, setFormData] = useState<any>({});
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Webflow collections query
  const collectionsQuery = getCollections(integration?.integration_id || "", {
    enabled: integration?.id === "webflow" && open,
  });

  const [discoveredData, setDiscoveredData] = useState<any>(null);

  useEffect(() => {
    if (collectionsQuery.data) {
      setDiscoveredData({ collections: collectionsQuery.data });
    }
  }, [collectionsQuery.data]);

  useEffect(() => {
    if (integration && open) {
      setFormData(integration.settings || {});
    }
  }, [integration, open]);

  const handleSave = async () => {
    if (!integration) return;

    try {
      const payload = {
        platform: integration.id,
        settings: {
          ...integration.settings,
          ...formData,
        },
      };

      const result = await connectIntegration.mutateAsync({
        data: payload,
        integrationId: integration.integration_id,
      });
      if (result.success) {
        toast.success(`${integration.name} author settings updated`);
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update author settings:", error);
    }
  };

  const renderWebflowConfig = () => {
    const collections = collectionsQuery.data || [];
    const isLoading = collectionsQuery.isLoading;

    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-foreground/80 font-inter">
            Authors Collection
          </Label>
          {isLoading ? (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-600">
                Loading collections...
              </span>
            </div>
          ) : (
            <Select
              value={formData.authors_collection_id || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, authors_collection_id: value })
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select authors collection" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-[11px] text-muted-foreground">
            Select the collection in Webflow that contains your authors.
          </p>
        </div>
      </div>
    );
  };

  const renderCustomWebhookConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="authors_endpoint"
            className="text-foreground/80 font-inter"
          >
            Authors Endpoint URL
          </Label>
          <Input
            id="authors_endpoint"
            value={formData.authors_endpoint || ""}
            onChange={(e) =>
              setFormData({ ...formData, authors_endpoint: e.target.value })
            }
            placeholder="https://api.example.com/users"
            className="font-inter bg-white"
          />
          <p className="text-[11px] text-muted-foreground">
            URL to fetch your authors list from.
          </p>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Field Mapping (Optional)
          </h4>
          <div className="space-y-3 p-3 rounded-lg bg-gray-50 border">
            <div className="space-y-1.5">
              <Label className="text-xs">Author ID Field</Label>
              <Input
                value={formData.author_id_field || ""}
                onChange={(e) =>
                  setFormData({ ...formData, author_id_field: e.target.value })
                }
                placeholder="id"
                className="h-8 text-xs bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Author Name Field</Label>
              <Input
                value={formData.author_name_field || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    author_name_field: e.target.value,
                  })
                }
                placeholder="name"
                className="h-8 text-xs bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Username Field</Label>
              <Input
                value={formData.author_username_field || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    author_username_field: e.target.value,
                  })
                }
                placeholder="username"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[450px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                Configure Authors
              </SheetTitle>
              <SheetDescription className="font-inter text-xs">
                Setup author importing for {integration?.name}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-start mb-4">
            <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 font-inter">
              This configuration allows us to fetch authors from{" "}
              {integration?.name} so you can assign them to your articles.
            </p>
          </div>

          {integration?.id === "webflow" && renderWebflowConfig()}
          {integration?.id === "custom_webhook" && renderCustomWebhookConfig()}

          {integration?.id !== "webflow" &&
            integration?.id !== "custom_webhook" && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 font-inter">
                  No additional configuration required for {integration?.name}.
                  You can import authors directly.
                </p>
              </div>
            )}
        </div>

        <SheetFooter className="p-6 border-t bg-white">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#104127] hover:bg-[#0A2918]"
              onClick={handleSave}
              disabled={connectIntegration.isPending}
            >
              {connectIntegration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
