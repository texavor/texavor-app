import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ContentGapDetail,
  KeywordOpportunityDetail,
  Recommendation,
} from "@/lib/api/competitors";
import { ExternalLink, FileText, Lightbulb } from "lucide-react";

interface RecommendationDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

export default function RecommendationDetailsSheet({
  isOpen,
  onClose,
  recommendation,
}: RecommendationDetailsSheetProps) {
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
      return (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[150px]">Topic</TableHead>
                <TableHead>Example Article</TableHead>
                <TableHead>Suggested Titles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium align-top">
                    <Badge variant="outline" className="bg-white">
                      {detail.topic}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{detail.example_article}</span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    {detail.suggested_titles &&
                    detail.suggested_titles.length > 0 ? (
                      <ul className="space-y-2">
                        {detail.suggested_titles.map((title, tIdx) => (
                          <li
                            key={tIdx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                            <span className="text-gray-700">{title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Handle Keyword Opportunities
    if (isKeywordOpp) {
      const details = recommendation.details as KeywordOpportunityDetail[];
      return (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[180px]">Keyword</TableHead>
                <TableHead>Suggested Titles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium align-top">
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      {detail.keyword}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    {detail.suggested_titles &&
                    detail.suggested_titles.length > 0 ? (
                      <ul className="space-y-2">
                        {detail.suggested_titles.map((title, tIdx) => (
                          <li
                            key={tIdx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                            <span className="text-gray-700">{title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
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
          <SheetTitle className="text-xl">{recommendation.action}</SheetTitle>
          <SheetDescription className="text-base">
            {recommendation.message}
          </SheetDescription>
        </SheetHeader>

        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}
