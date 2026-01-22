"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { cn, formatPlatformName } from "@/lib/utils";
import {
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
  format,
} from "date-fns";
import { useMemo } from "react";

const PLATFORM_IMAGES: Record<string, string> = {
  devto: "/integration/devto.png",
  hashnode: "/integration/hashnode.png",
  medium: "/integration/medium.png",
  shopify: "/integration/shopify.png",
  webflow: "/integration/webflow.png",
  wordpress: "/integration/wordpress.png",
  custom_webhook: "/integration/webhook.png",
};

interface Publication {
  id: string;
  status: "pending" | "publishing" | "success" | "failed";
  external_url: string | null;
  external_id: string | null;
  error_message: string | null;
  retry_count: number;
  published_at: string | null;
  attempted_at: string | null;
  integration: {
    id: string;
    platform: string;
    name: string;
    logo_url?: string;
    settings?: {
      label?: string;
      [key: string]: any;
    };
  };
}

interface PublicationStatusCardProps {
  publication: Publication;
  onRetry: (publicationId: string) => void;
  onUnpublish?: (integrationId: string) => void;
  isRetrying?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    label: "Pending",
  },
  publishing: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Publishing",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-100",
    label: "Published",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    label: "Failed",
  },
};

export default function PublicationStatusCard({
  publication,
  onRetry,
  onUnpublish,
  isRetrying = false,
}: PublicationStatusCardProps) {
  const config = statusConfig[publication.status];
  const StatusIcon = config.icon;
  const isDev = process.env.NODE_ENV === "development";
  const canRetry = publication.status === "failed";
  const showRaiseQuery = false; // Always allow retry now

  const getTimestamp = () => {
    const dateStr = publication.published_at || publication.attempted_at;
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const prefix = publication.published_at ? "Published" : "Attempted";

    if (isToday(date)) {
      return `${prefix} Today at ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `${prefix} Yesterday at ${format(date, "HH:mm")}`;
    }
    return `${prefix} ${format(date, "MMM dd, yyyy")}`;
  };

  const logoUrl = useMemo(() => {
    if (publication.integration.logo_url)
      return publication.integration.logo_url;
    const key = (
      publication.integration.platform || publication.integration.id
    ).toLowerCase();
    return PLATFORM_IMAGES[key];
  }, [publication.integration]);

  // For custom webhooks, use the label from settings as the display name
  const displayName = useMemo(() => {
    if (publication.integration.platform === "custom_webhook") {
      return (
        publication.integration.settings?.label || publication.integration.name
      );
    }
    return publication.integration.name;
  }, [publication.integration]);

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-white">
      {/* Platform Logo */}
      <Avatar className="h-10 w-10 rounded-lg">
        <AvatarImage
          src={logoUrl}
          className="object-contain"
          alt={publication.integration.name}
        />
        <AvatarFallback className="rounded-lg bg-gray-100 text-sm font-medium">
          {publication.integration.platform?.slice(0, 2).toUpperCase() || "PL"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {displayName}
            </h4>
            <p className="text-xs text-gray-500">
              {formatPlatformName(publication.integration.platform)}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              config.bgColor,
              config.color,
            )}
          >
            <StatusIcon
              className={cn(
                "h-3.5 w-3.5",
                publication.status === "publishing" && "animate-spin",
              )}
            />
            {config.label}
          </div>
        </div>

        {/* Timestamp */}
        {getTimestamp() && (
          <p className="text-xs text-gray-500 mt-1">{getTimestamp()}</p>
        )}

        {/* Error Message */}
        {publication.status === "failed" && publication.error_message && (
          <div className="mt-2 p-2 rounded bg-red-50 border border-red-100">
            <p className="text-xs text-red-700">{publication.error_message}</p>
            {publication.retry_count > 0 && (
              <p className="text-xs text-red-600 mt-1">
                Retry attempts: {publication.retry_count}
              </p>
            )}
          </div>
        )}

        {/* External Link */}
        {publication.status === "success" && (
          <div className="flex items-center gap-2 mt-2">
            {publication.external_url && (
              <a
                href={publication.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                View on {formatPlatformName(publication.integration.platform)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {onUnpublish && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnpublish(publication.integration.id)}
                className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Unpublish
              </Button>
            )}
          </div>
        )}

        {/* Retry Button */}
        {canRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(publication.id)}
            disabled={isRetrying}
            className="mt-2 h-7 text-xs"
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry Publication
              </>
            )}
          </Button>
        )}

        {/* Raise Query Button (Prod only, exhausted retries) */}
        {showRaiseQuery && (
          <a href="/support" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Raise Query
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
