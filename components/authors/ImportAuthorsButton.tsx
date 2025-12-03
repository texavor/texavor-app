import { useState } from "react";
import { importAuthors } from "@/lib/api/authors";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";

interface ImportAuthorsButtonProps {
  blogId: string;
  integrationId: string;
  integrationName: string;
  onSuccess: () => void;
}

export function ImportAuthorsButton({
  blogId,
  integrationId,
  integrationName,
  onSuccess,
}: ImportAuthorsButtonProps) {
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await importAuthors(blogId, integrationId);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      }

      if (result.errors && result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="bg-white hover:bg-gray-50 border-0 shadow-sm"
      onClick={handleImport}
      disabled={importing}
    >
      {importing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {importing ? "Importing..." : `Import from ${integrationName}`}
    </Button>
  );
}
