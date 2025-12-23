"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { AuthorsList } from "@/components/authors/AuthorsList";
import { CreateAuthorSheet } from "@/components/authors/CreateAuthorSheet";
import { ImportAuthorsButton } from "@/components/authors/ImportAuthorsButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
        p?.id !== "devto" &&
        p?.id !== "hashnode" &&
        p?.id !== "custom_webhook" &&
        p?.id !== "shopify"
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
              Manage authors for your blog posts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectedIntegrations.map((integration) => (
              <ImportAuthorsButton
                key={integration.id}
                blogId={blogs.id}
                integrationId={integration.integration_id!}
                integrationName={integration.name}
                onSuccess={handleSuccess}
              />
            ))}
            <Button
              onClick={() => {
                setEditingAuthor(null);
                setIsCreateOpen(true);
              }}
              className="bg-[#104127] hover:bg-[#0A2918]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Author
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
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
