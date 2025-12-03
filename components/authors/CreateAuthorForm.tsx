import { useState, useEffect } from "react";
import { Author, createAuthor, updateAuthor } from "@/lib/api/authors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateAuthorFormProps {
  blogId: string;
  authorToEdit?: Author | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAuthorForm({
  blogId,
  authorToEdit,
  onSuccess,
  onCancel,
}: CreateAuthorFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authorToEdit) {
      setFormData({
        name: authorToEdit.name,
        bio: authorToEdit.bio || "",
        avatar: authorToEdit.avatar || "",
      });
    }
  }, [authorToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authorToEdit) {
        await updateAuthor(blogId, authorToEdit.id, formData);
        toast.success("Author updated successfully");
      } else {
        await createAuthor(blogId, { author: formData });
        toast.success("Author created successfully");
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      // Error handling is done in axios interceptor for limits
      if (error?.response?.status !== 403) {
        toast.error("Failed to save author");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="A short bio about the author..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar URL</Label>
        <Input
          id="avatar"
          type="url"
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {authorToEdit ? "Update Author" : "Create Author"}
        </Button>
      </div>
    </form>
  );
}
