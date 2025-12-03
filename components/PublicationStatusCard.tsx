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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
  };
}

interface PublicationStatusCardProps {
  publication: Publication;
  onRetry: (publicationId: string) => void;
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
  isRetrying = false,
}: PublicationStatusCardProps) {
  const config = statusConfig[publication.status];
  const StatusIcon = config.icon;
  const canRetry =
    publication.status === "failed" && publication.retry_count < 3;

  const getTimestamp = () => {
    if (publication.published_at) {
      return `Published ${formatDistanceToNow(
        new Date(publication.published_at),
        { addSuffix: true }
      )}`;
    }
    if (publication.attempted_at) {
      return `Attempted ${formatDistanceToNow(
        new Date(publication.attempted_at),
        { addSuffix: true }
      )}`;
    }
    return null;
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
      {/* Platform Logo */}
      <Avatar className="h-10 w-10 rounded-lg">
        <AvatarImage
          src={publication.integration.logo_url}
          alt={publication.integration.name}
        />
        <AvatarFallback className="rounded-lg bg-gray-100 text-sm font-medium">
          {publication.integration.platform.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {publication.integration.name}
            </h4>
            <p className="text-xs text-gray-500 capitalize">
              {publication.integration.platform}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              config.bgColor,
              config.color
            )}
          >
            <StatusIcon
              className={cn(
                "h-3.5 w-3.5",
                publication.status === "publishing" && "animate-spin"
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
                Retry attempts: {publication.retry_count}/3
              </p>
            )}
          </div>
        )}

        {/* External Link */}
        {publication.status === "success" && publication.external_url && (
          <a
            href={publication.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            View on {publication.integration.platform}
            <ExternalLink className="h-3 w-3" />
          </a>
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
      </div>
    </div>
  );
}
