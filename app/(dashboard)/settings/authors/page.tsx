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

export default function AuthorsSettingsPage() {
  const { blogs } = useAppStore();
  const { getIntegrations } = useIntegrationsApi();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const connectedIntegrations =
    getIntegrations.data?.filter(
      (p) =>
        p.is_connected &&
        ["medium", "devto", "hashnode", "custom_webhook"].includes(p.id)
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

  if (!blogs?.id) {
    return <div>Loading...</div>;
  }

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
        {connectedIntegrations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 items-center p-3 rounded-lg border bg-gray-50/50">
            <div className="flex items-center gap-2 mr-2">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Sync from:
              </span>
            </div>
            {connectedIntegrations.map((integration) => (
              <ImportAuthorsButton
                key={integration.id}
                blogId={blogs.id}
                integrationId={integration.integration_id!}
                integrationName={integration.name}
                onSuccess={handleSuccess}
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white border-gray-200 hover:border-gray-300 shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <AuthorsList
          blogId={blogs.id}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
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
    </div>
  );
}
