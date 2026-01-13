"use client";

import React, { useState } from "react";
import { useIntegrationsApi } from "./hooks/useIntegrationsApi";
import { PlatformCard } from "@/components/integrations/PlatformCard";
import ConnectIntegrationSheet from "@/components/integrations/ConnectIntegrationSheet";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORM_IMAGES: Record<string, string> = {
  devto: "/integration/devto.png",
  hashnode: "/integration/hashnode.png",
  medium: "/integration/medium.png",
  shopify: "/integration/shopify.png",
  webflow: "/integration/webflow.png",
  wordpress: "/integration/wordpress.png",
  custom_webhook: "/integration/webhook.png",
};

export default function IntegrationsClientPage() {
  const { getIntegrations, connectIntegration, disconnectIntegration } =
    useIntegrationsApi();

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsSheetOpen(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      await disconnectIntegration.mutateAsync(integrationId);
    }
  };

  // Show skeleton only while integrations are loading
  if (getIntegrations.isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-[#f9f4f0]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-none shadow-md">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <Skeleton className="w-12 h-12 rounded-lg bg-[#f9f4f0]" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24 bg-[#f9f4f0]" />
                    <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full bg-[#f9f4f0]" />
                    <Skeleton className="h-3 w-3/4 bg-[#f9f4f0]" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md bg-[#f9f4f0]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get all platforms from integrations API
  const rawPlatforms = getIntegrations.data || [];

  const allPlatforms = rawPlatforms.map((p) => {
    const key = (p.platform || p.id).toLowerCase();
    const localImage = PLATFORM_IMAGES[key];

    if (localImage) {
      return { ...p, logo_url: localImage };
    }
    return p;
  });

  return (
    <div className="space-y-8 pb-4">
      {/* Available Integrations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-poppins text-[#0A2918]">
          Available Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onConnect={handleConnect}
              isConnected={platform.is_connected}
            />
          ))}

          {/* Add Custom Webhook Card */}
          {allPlatforms.filter(
            (p) => p.platform === "custom_webhook" || p.id === "custom_webhook"
          ).length < 5 && (
            <Card
              className="flex flex-col justify-center items-center h-full min-h-[200px] border-none shadow-none cursor-pointer group bg-white"
              onClick={() => {
                const dummy: Platform = {
                  id: "custom_webhook",
                  name: "Custom Webhook",
                  type: "api",
                  icon: "custom_webhook",
                  logo_url: "",
                  is_connected: false,
                } as any;
                setSelectedPlatform(dummy);
                setIsSheetOpen(true);
              }}
            >
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#104127]/10 transition-colors">
                <Plus className="h-6 w-6 text-gray-500 group-hover:text-[#104127]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#104127] font-poppins">
                Add Custom Webhook
              </h3>
              <p className="text-sm text-gray-500 mt-2 text-center px-4 font-inter">
                Connect your own endpoint
              </p>
            </Card>
          )}
        </div>
      </div>

      <ConnectIntegrationSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        platform={selectedPlatform}
        onSuccess={() => setIsSheetOpen(false)}
        connectMutation={connectIntegration}
      />
    </div>
  );
}
