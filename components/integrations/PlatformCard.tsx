import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import {
  Globe,
  Rss,
  Link as LinkIcon,
  CheckCircle2,
  PlugZap,
} from "lucide-react";

interface PlatformCardProps {
  platform: Platform;
  onConnect: (platform: Platform) => void;
  isConnected?: boolean;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  onConnect,
  isConnected = false,
}) => {
  // Helper to render icon based on platform.icon string
  const renderIcon = () => {
    console.log(platform.logo_url);
    if (platform.logo_url) {
      return (
        <img
          src={platform.logo_url}
          alt={`${platform.name} logo`}
          className="h-8 w-8 object-contain"
        />
      );
    }

    switch (platform.type) {
      case "rss":
        return <Rss className="h-8 w-8 text-orange-500" />;
      case "api":
        if (
          platform.id === "custom_webhook" ||
          platform.platform === "custom_webhook"
        ) {
          return <PlugZap className="h-8 w-8 text-purple-500" />;
        }
        return <Globe className="h-8 w-8 text-blue-500" />;
      default:
        return <LinkIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const displayName = platform.settings?.label || platform.name;

  return (
    <Card
      className={`flex flex-col justify-between h-full transition-all ${
        isConnected
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/30 shadow-sm"
          : "hover:shadow-md border-gray-200"
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <div
          className={`p-2 rounded-lg ${
            isConnected
              ? "bg-white shadow-sm border border-emerald-100"
              : "bg-gray-50"
          }`}
        >
          {renderIcon()}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg leading-none font-poppins">
              {displayName}
            </h3>
            {platform.type === "oauth" && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-inter bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
              >
                OAuth
              </Badge>
            )}
            {isConnected && (
              <Badge
                variant="outline"
                className="bg-emerald-100 text-emerald-700 border-emerald-300 shrink-0 font-inter"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground capitalize font-inter">
            {platform.type} Integration
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2 font-inter">
          {platform.description ||
            `Connect your ${platform.name} account to automatically import and sync articles.`}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full font-medium font-inter ${
            isConnected
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              : "bg-[#104127] hover:bg-[#0A2918] text-white"
          }`}
          onClick={() => onConnect(platform)}
        >
          {isConnected ? "Manage" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};
