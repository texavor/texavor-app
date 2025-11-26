"use client";

import { useState } from "react";
import { SettingHeader } from "../components/SettingHeader";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/ui/CustomTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  useGetApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "../hooks/useApiKeysApi";
import { getColumns } from "./components/columns";
import { CreateApiKeyDialog } from "./components/CreateApiKeyDialog";
import { NewApiKeyDisplayDialog } from "./components/NewApiKeyDisplayDialog";
import { NewApiKey } from "../types";

export default function ApiKeysPage() {
  const { data: apiKeys, isLoading } = useGetApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewApiKey | null>(null);

  const handleCreate = async (data: { name: string; expires_at?: string }) => {
    createApiKey.mutate(data, {
      onSuccess: (newKey) => {
        setCreateDialogOpen(false);
        setNewKeyData(newKey);
      },
    });
  };

  const handleRevoke = (id: number) => {
    revokeApiKey.mutate(id);
  };

  const columns = getColumns({ onRevoke: handleRevoke });

  if (isLoading) {
    return (
      <div>
        <SettingHeader
          title="API Keys"
          description="Create and manage your API access keys"
        />
        <div className="flex justify-end mb-6">
          <Skeleton className="h-10 w-32 bg-[#f9f4f0]" />
        </div>
        <Card className="p-6 border-none">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-[#f9f4f0]" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SettingHeader
        title="API Keys"
        description="Create and manage your API access keys"
      />

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#104127] hover:bg-[#104127]/90"
        >
          Create API Key
        </Button>
      </div>

      <CustomTable
        columns={columns}
        data={apiKeys || []}
        isLoading={isLoading}
        onClick={() => {}}
        className=""
      />

      <CreateApiKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isPending={createApiKey.isPending}
      />

      {newKeyData && (
        <NewApiKeyDisplayDialog
          open={!!newKeyData}
          onOpenChange={(open) => !open && setNewKeyData(null)}
          apiKey={newKeyData.api_key}
          name={newKeyData.name}
        />
      )}
    </div>
  );
}
