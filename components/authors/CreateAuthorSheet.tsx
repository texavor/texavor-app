import { useState, useEffect } from "react";
import { Author, createAuthor, updateAuthor } from "@/lib/api/authors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateAuthorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId: string;
  authorToEdit?: Author | null;
  onSuccess: () => void;
}

export function CreateAuthorSheet({
  open,
  onOpenChange,
  blogId,
  authorToEdit,
  onSuccess,
}: CreateAuthorSheetProps) {
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
    } else {
      setFormData({
        name: "",
        bio: "",
        avatar: "",
      });
    }
  }, [authorToEdit, open]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

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
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status !== 403) {
        toast.error("Failed to save author");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border rounded-xl shadow-md">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="text-lg font-bold bg-gray-100">
                <User className="w-6 h-6 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                {authorToEdit ? "Edit Author" : "Add New Author"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground font-inter">
                {authorToEdit
                  ? "Update author details"
                  : "Create a new author for your blog"}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-foreground/80 font-inter">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
              className="font-inter"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-foreground/80 font-inter">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="A short bio about the author..."
              className="font-inter resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatar" className="text-foreground/80 font-inter">
              Avatar URL
            </Label>
            <Input
              id="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
              className="font-inter"
            />
            <p className="text-[11px] text-muted-foreground">
              Link to a profile image for the author
            </p>
          </div>
        </div>

        <SheetFooter className="p-6 border-t sm:justify-end bg-white gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {authorToEdit ? "Save Changes" : "Create Author"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
