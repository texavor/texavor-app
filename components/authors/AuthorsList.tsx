import { useEffect, useState, useMemo } from "react";
import {
  Author,
  fetchAuthors,
  deleteAuthor,
  setDefaultAuthor,
} from "@/lib/api/authors";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";
import { CustomTable } from "@/components/ui/CustomTable";
import { getColumns } from "@/app/(dashboard)/settings/authors/columns";

interface AuthorsListProps {
  blogId: string;
  onEdit: (author: Author) => void;
  refreshTrigger: number;
  integrations?: any[];
}

export function AuthorsList({
  blogId,
  onEdit,
  refreshTrigger,
  integrations = [],
}: AuthorsListProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthors(blogId);
      setAuthors(data);
    } catch (error) {
      toast.error("Failed to load authors");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      loadAuthors();
    }
  }, [blogId, refreshTrigger]);

  const handleDelete = async (author: Author) => {
    if (!confirm(`Are you sure you want to delete ${author.name}?`)) return;

    try {
      await deleteAuthor(blogId, author.id);
      toast.success("Author deleted successfully");
      loadAuthors();
    } catch (error) {
      toast.error("Failed to delete author");
      console.error(error);
    }
  };

  const handleSetDefault = async (author: Author) => {
    if (!author.external_platform && !author.integration_id) {
      toast.error("Manual authors cannot be set as platform defaults.");
      return;
    }

    try {
      let integrationId = author.integration_id;

      // Fallback: If integration_id is missing, try to find a matching one from the integrations list
      if (!integrationId && author.external_platform) {
        const platform = author.external_platform.toLowerCase();
        // Custom Webhook might be tricky, so we handle it specifically if needed
        const matchingIntegration = integrations.find((i) => {
          if (platform === "webhook" || platform === "custom_webhook") {
            return i.id === "custom_webhook";
          }
          return i.id === platform;
        });

        if (matchingIntegration) {
          integrationId = matchingIntegration.integration_id;
        }
      }

      if (!integrationId) {
        toast.error(
          `Could not find a connected ${author.external_platform} integration to set default.`
        );
        return;
      }

      const result = await setDefaultAuthor(blogId, integrationId, author.id);
      if (result.success) {
        toast.success(`${author.name} is now the default author.`);
        loadAuthors();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = getColumns(onEdit, handleDelete, handleSetDefault);

  return (
    <div className="space-y-4">
      <CustomTable
        columns={columns}
        data={authors}
        isLoading={loading}
        onClick={() => {}} // No row click action for now
        className=""
      />
    </div>
  );
}
