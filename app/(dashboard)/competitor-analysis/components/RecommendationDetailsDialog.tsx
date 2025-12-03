import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ContentGapDetail,
  KeywordOpportunityDetail,
  Recommendation,
} from "@/lib/api/competitors";
import { ExternalLink, FileText, Lightbulb } from "lucide-react";
import { CustomTable } from "@/components/ui/CustomTable";
import { ColumnDef } from "@tanstack/react-table";

interface RecommendationDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

export default function RecommendationDetailsDialog({
  isOpen,
  onClose,
  recommendation,
}: RecommendationDetailsDialogProps) {
  if (!recommendation) return null;

  const isContentGap = recommendation.type === "content_gaps";
  const isKeywordOpp = recommendation.type === "keyword_opportunities";

  const renderContent = () => {
    if (!recommendation.details || recommendation.details.length === 0) {
      return <p className="text-muted-foreground">No details available.</p>;
    }

    // Handle string array (fallback)
    if (typeof recommendation.details[0] === "string") {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {(recommendation.details as string[]).map((detail, idx) => (
            <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
              {detail}
            </Badge>
          ))}
        </div>
      );
    }

    // Handle Content Gap Details
    if (isContentGap) {
      const details = recommendation.details as ContentGapDetail[];

      const columns: ColumnDef<ContentGapDetail>[] = [
        {
          accessorKey: "topic",
          header: "Topic",
          cell: ({ row }) => (
            <Badge variant="outline" className="bg-white">
              {row.original.topic}
            </Badge>
          ),
        },
        {
          accessorKey: "example_article",
          header: "Example Article",
          cell: ({ row }) => (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{row.original.example_article}</span>
            </div>
          ),
        },
        {
          accessorKey: "suggested_titles",
          header: "Suggested Titles",
          cell: ({ row }) =>
            row.original.suggested_titles &&
            row.original.suggested_titles.length > 0 ? (
              <ul className="space-y-2">
                {row.original.suggested_titles.map((title, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                    <span className="text-gray-700">{title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            ),
        },
      ];

      return (
        <div className="mt-6">
          <CustomTable
            columns={columns}
            data={details}
            onClick={() => {}}
            className="max-h-[60vh]"
          />
        </div>
      );
    }

    // Handle Keyword Opportunities
    if (isKeywordOpp) {
      const details = recommendation.details as KeywordOpportunityDetail[];

      const columns: ColumnDef<KeywordOpportunityDetail>[] = [
        {
          accessorKey: "keyword",
          header: "Keyword",
          cell: ({ row }) => (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {row.original.keyword}
            </Badge>
          ),
        },
        {
          accessorKey: "suggested_titles",
          header: "Suggested Titles",
          cell: ({ row }) =>
            row.original.suggested_titles &&
            row.original.suggested_titles.length > 0 ? (
              <ul className="space-y-2">
                {row.original.suggested_titles.map((title, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                    <span className="text-gray-700">{title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            ),
        },
      ];

      return (
        <div className="mt-6">
          <CustomTable
            columns={columns}
            data={details}
            onClick={() => {}}
            className="max-h-[60vh]"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`capitalize ${
                recommendation.priority === "high"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : recommendation.priority === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {recommendation.priority} Priority
            </Badge>
          </div>
          <DialogTitle className="text-xl">{recommendation.action}</DialogTitle>
          <DialogDescription className="text-base">
            {recommendation.message}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
