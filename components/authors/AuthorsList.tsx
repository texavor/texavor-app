import { useEffect, useState } from "react";
import { Author, fetchAuthors, deleteAuthor } from "@/lib/api/authors";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";
import { CustomTable } from "@/components/ui/CustomTable";
import { getColumns } from "@/app/(dashboard)/settings/authors/columns";

interface AuthorsListProps {
  blogId: string;
  onEdit: (author: Author) => void;
  refreshTrigger: number;
}

export function AuthorsList({
  blogId,
  onEdit,
  refreshTrigger,
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

  const columns = getColumns(onEdit, handleDelete);

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
