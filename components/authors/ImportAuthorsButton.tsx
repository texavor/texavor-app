import { useState } from "react";
import { fetchFromPlatform } from "@/lib/api/authors";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";

interface ImportAuthorsButtonProps {
  blogId: string;
  integrationId: string;
  integrationName: string;
  onSuccess: () => void;
  className?: string; // Manually defined
  variant?:
    | "ghost"
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isReady?: boolean;
  platformId?: string;
  children?: React.ReactNode;
}

export function ImportAuthorsButton({
  blogId,
  integrationId,
  integrationName,
  onSuccess,
  className,
  variant = "ghost",
  size = "sm",
  isReady = true,
  platformId,
  children,
  ...props
}: ImportAuthorsButtonProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!isReady) {
      toast.error(
        `Please complete ${integrationName} settings to fetch authors.`
      );
      return;
    }
    setImporting(true);
    try {
      const result = await fetchFromPlatform(blogId, integrationId);

      if (result.success) {
        toast.success("Authors fetched successfully");
        onSuccess();
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleImport}
      disabled={importing}
      {...props}
    >
      {importing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {importing
        ? "Importing..."
        : children || `Import from ${integrationName}`}
    </Button>
  );
}
