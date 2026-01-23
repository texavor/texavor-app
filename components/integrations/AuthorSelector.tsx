import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listIntegrationAuthors } from "@/lib/api/authors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface AuthorSelectorProps {
  blogId: string;
  integrationId: string;
  selectedAuthorId?: string | null;
  onSelect: (authorId: string | null) => void;
  disabled?: boolean;
}

export const AuthorSelector: React.FC<AuthorSelectorProps> = ({
  blogId,
  integrationId,
  selectedAuthorId,
  onSelect,
  disabled,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["integration-authors", blogId, integrationId],
    queryFn: async () => {
      const res = await listIntegrationAuthors(blogId, integrationId);
      return res.authors || [];
    },
    enabled: !!blogId && !!integrationId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const authors = Array.isArray(data) ? data : [];

  if (authors.length === 0) {
    return null;
  }

  // Find selected author object for display
  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  const options = authors.map((author) => ({
    id: author.id, // Internal UUID
    name: author.name,
    icon: (
      <Avatar className="h-5 w-5 mr-2">
        <AvatarImage src={author.avatar} />
        <AvatarFallback className="text-[9px]">
          {author.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
    description: author.username ? `@${author.username}` : undefined,
  }));

  return (
    <div className="mt-2 ml-7">
      <CustomDropdown
        options={options}
        selectedValue={selectedAuthorId || ""}
        onSelect={(value: any) => onSelect(value.id)}
        placeholder="Select author..."
        disabled={disabled}
        className="h-8 text-xs w-[200px]"
        trigger={
          <button
            className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50/50 border-gray-200 hover:bg-white hover:border-gray-300 w-[200px] h-8`}
          >
            <span className="truncate">
              {options.find((o) => o.id === selectedAuthorId)?.name ||
                "Select author..."}
            </span>
            <Loader2 className="h-3 w-3 opacity-0" /> {/* Spacer */}
          </button>
        }
      />
    </div>
  );
};
