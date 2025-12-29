"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { AuthorsList } from "@/components/authors/AuthorsList";
import { CreateAuthorSheet } from "@/components/authors/CreateAuthorSheet";
import { ImportAuthorsButton } from "@/components/authors/ImportAuthorsButton";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useIntegrationsApi } from "@/app/(dashboard)/integrations/hooks/useIntegrationsApi";
import { Author } from "@/lib/api/authors";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorConfigurationSheet } from "@/components/authors/AuthorConfigurationSheet";
import { Settings2 } from "lucide-react";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";

export default function AuthorsSettingsPage() {
  const { blogs } = useAppStore();
  const { getIntegrations } = useIntegrationsApi();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [configIntegration, setConfigIntegration] = useState<Platform | null>(
    null
  );

  const connectedIntegrations =
    getIntegrations.data?.filter(
      (p) => p.is_connected && (p.supports_authors || p.id === "custom_webhook")
    ) || [];

  const handleSuccess = () => {
    setIsCreateOpen(false);
    setEditingAuthor(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setIsCreateOpen(true);
  };

  const isLoading = !blogs?.id || getIntegrations.isLoading;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
              Authors
            </h1>
            <p className="font-inter text-gray-600">
              Manage your authors and sync from connected platforms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingAuthor(null);
                setIsCreateOpen(true);
              }}
              className="bg-[#104127] hover:bg-[#0A2918]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Manual Author
            </Button>
          </div>
        </div>

        {/* Unified Sync Actions */}
        {isLoading ? (
          <div className="flex flex-wrap gap-2 mt-6 items-center p-3 rounded-lg border border-none bg-[#f9f4f0]/50 shadow-none">
            <Skeleton className="h-4 w-20 bg-[#f9f4f0]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32 bg-[#f9f4f0] rounded-md" />
              <Skeleton className="h-8 w-32 bg-[#f9f4f0] rounded-md" />
            </div>
          </div>
        ) : (
          connectedIntegrations.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6 items-center px-4 py-0 rounded-xl bg-[#f9f4f0]/30">
              <div className="flex items-center gap-2 pr-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-[#0A2918] font-poppins">
                  Sync Authors:
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {connectedIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center gap-1.5 p-1 pr-2 rounded-lg bg-white border border-gray-100 hover:border-emerald-100 transition-all duration-200 group shadow-none"
                  >
                    <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-emerald-50 transition-colors shrink-0">
                      <img
                        src={
                          integration.id === "custom_webhook"
                            ? "/integration/webhook.png"
                            : integration.logo_url
                        }
                        alt={integration.name}
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <ImportAuthorsButton
                      blogId={blogs.id}
                      integrationId={integration.integration_id!}
                      integrationName={integration.name}
                      isReady={integration.is_ready_for_authors}
                      platformId={integration.id}
                      onSuccess={handleSuccess}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-transparent"
                    >
                      {integration.name}
                    </ImportAuthorsButton>
                    <div className="w-px h-4 bg-gray-100 mx-0.5" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md transition-all ${
                        !integration.is_ready_for_authors
                          ? "text-amber-500 hover:text-amber-600 bg-amber-50 animate-pulse"
                          : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50"
                      }`}
                      onClick={() => setConfigIntegration(integration)}
                      title={
                        !integration.is_ready_for_authors
                          ? "Configure authors to enable import"
                          : "Author configuration"
                      }
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border-none shadow-none space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 w-full">
                  <Skeleton className="w-10 h-10 rounded-full bg-[#f9f4f0] shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-40 bg-[#f9f4f0]" />
                    <Skeleton className="h-3 w-24 bg-[#f9f4f0]" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full bg-[#f9f4f0] ml-auto" />
                  <Skeleton className="h-4 w-4 bg-[#f9f4f0] ml-4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AuthorsList
            blogId={blogs.id}
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
            integrations={getIntegrations.data}
          />
        )}
      </div>

      <CreateAuthorSheet
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingAuthor(null);
        }}
        blogId={blogs.id}
        authorToEdit={editingAuthor}
        onSuccess={handleSuccess}
      />

      <AuthorConfigurationSheet
        open={!!configIntegration}
        onOpenChange={(open) => !open && setConfigIntegration(null)}
        integration={configIntegration}
        onSuccess={() => {
          getIntegrations.refetch();
        }}
      />
    </div>
  );
}
