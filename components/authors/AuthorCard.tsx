import { Author } from "@/lib/api/authors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";

interface AuthorCardProps {
  author: Author;
  onEdit: (author: Author) => void;
  onDelete: (author: Author) => void;
}

export function AuthorCard({ author, onEdit, onDelete }: AuthorCardProps) {
  const isOwner = author.role === "owner";

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-gray-100">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-gray-50 text-gray-600 font-medium">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-base text-[#0A2918]">
                {author.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isOwner ? "default" : "secondary"}
                  className="capitalize font-normal px-2 py-0.5 h-5 text-xs"
                >
                  {author.role}
                </Badge>
                {author.external_platform && (
                  <Badge
                    variant="outline"
                    className="capitalize font-normal px-2 py-0.5 h-5 text-xs text-muted-foreground bg-gray-50"
                  >
                    Imported from {author.external_platform}
                  </Badge>
                )}
              </div>
            </div>
            {author.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1 font-inter">
                {author.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(author)}
            title="Edit Author"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {!isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(author)}
              className="text-destructive hover:text-destructive"
              title="Delete Author"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
