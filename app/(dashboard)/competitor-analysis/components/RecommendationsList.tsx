import {
  ContentGapDetail,
  KeywordOpportunityDetail,
  Recommendation,
} from "@/lib/api/competitors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Lightbulb,
  Search,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({
  recommendations,
}: RecommendationsListProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Recommendations Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            We haven't generated any specific recommendations for this
            competitor yet. Try running a new analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const contentGapRec = recommendations.find((r) => r.type === "content_gaps");
  const keywordOppRec = recommendations.find(
    (r) => r.type === "keyword_opportunities"
  );

  // Helper to render the "Memberships" style list item
  const renderSuggestionItem = (
    title: string,
    index: number,
    total: number
  ) => {
    // Rotate colors for the accent bar
    const colors = [
      "bg-emerald-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-blue-500",
    ];
    const accentColor = colors[index % colors.length];

    return (
      <div className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-3 flex items-center gap-3 overflow-hidden">
        {/* Accent Bar */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
            accentColor
          )}
        />

        <div className="flex-1 min-w-0 pl-2">
          <p
            className="text-sm font-medium text-gray-800 leading-snug"
            title={title}
          >
            {title}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            Suggestion
          </p>
        </div>

        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors shrink-0">
          <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {contentGapRec && contentGapRec.details && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                Content Gaps
              </h3>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                {contentGapRec.message}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-3 py-1 text-sm font-medium rounded-full ${
                contentGapRec.priority === "high"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : contentGapRec.priority === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {contentGapRec.priority} Priority
            </Badge>
          </div>

          {/* Grid Layout for Content Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(contentGapRec.details as ContentGapDetail[]).map((item, idx) => (
              <Card
                key={idx}
                className="bg-white rounded-2xl border-none shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ring-1 ring-gray-100"
              >
                <CardContent className="p-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                        Topic
                      </p>
                      <h4
                        className="font-bold text-lg text-gray-900 leading-tight line-clamp-2"
                        title={item.topic}
                      >
                        {item.topic}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>

                  {/* Example Article (Trial Session style) */}
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 text-gray-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-500 uppercase">
                        Example
                      </p>
                      <p
                        className="text-xs font-medium text-gray-900 truncate"
                        title={item.example_article}
                      >
                        {item.example_article}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  {item.suggested_titles && item.suggested_titles.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Top Suggestions
                        </p>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                          {item.suggested_titles.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {item.suggested_titles
                          .slice(0, 2)
                          .map((title, tIdx) => (
                            <div key={tIdx}>
                              {renderSuggestionItem(
                                title,
                                tIdx,
                                item.suggested_titles!.length
                              )}
                            </div>
                          ))}
                      </div>

                      {item.suggested_titles.length > 2 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full h-8 text-xs text-muted-foreground hover:text-purple-600 hover:bg-purple-50 rounded-lg mt-1 font-medium transition-colors"
                            >
                              View {item.suggested_titles.length - 2} more
                              suggestions
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border-gray-100 no-scrollbar"
                            align="center"
                          >
                            <div className="bg-purple-50 p-3 border-b border-purple-100">
                              <h4 className="font-semibold text-sm text-purple-900">
                                All Suggestions
                              </h4>
                              <p className="text-xs text-purple-700 mt-0.5">
                                For topic: {item.topic}
                              </p>
                            </div>
                            <div className="p-3 max-h-[300px] overflow-y-auto space-y-2 bg-gray-50/50 no-scrollbar">
                              {item.suggested_titles.map((title, i) => (
                                <div key={i}>
                                  {renderSuggestionItem(
                                    title,
                                    i,
                                    item.suggested_titles!.length
                                  )}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground italic">
                        No specific titles suggested.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {keywordOppRec && keywordOppRec.details && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                Keyword Opportunities
              </h3>
              <p className="text-sm text-muted-foreground mt-1 ml-11">
                {keywordOppRec.message}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`capitalize px-3 py-1 text-sm font-medium rounded-full ${
                keywordOppRec.priority === "high"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : keywordOppRec.priority === "medium"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {keywordOppRec.priority} Priority
            </Badge>
          </div>

          {/* Grid Layout for Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(keywordOppRec.details as KeywordOpportunityDetail[]).map(
              (item, idx) => (
                <Card
                  key={idx}
                  className="bg-white rounded-2xl border-none shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ring-1 ring-gray-100"
                >
                  <CardContent className="p-5 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                          Keyword
                        </p>
                        <h4
                          className="font-bold text-lg text-gray-900 leading-tight"
                          title={item.keyword}
                        >
                          {item.keyword}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>

                    {/* Suggestions List */}
                    {item.suggested_titles &&
                    item.suggested_titles.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Top Suggestions
                          </p>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                            {item.suggested_titles.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {item.suggested_titles
                            .slice(0, 3)
                            .map((title, tIdx) => (
                              <div key={tIdx}>
                                {renderSuggestionItem(
                                  title,
                                  tIdx,
                                  item.suggested_titles!.length
                                )}
                              </div>
                            ))}
                        </div>

                        {item.suggested_titles.length > 3 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full h-8 text-xs text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg mt-1 font-medium transition-colors"
                              >
                                View {item.suggested_titles.length - 3} more
                                suggestions
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border-gray-100"
                              align="center"
                            >
                              <div className="bg-blue-50 p-3 border-b border-blue-100">
                                <h4 className="font-semibold text-sm text-blue-900">
                                  All Suggestions
                                </h4>
                                <p className="text-xs text-blue-700 mt-0.5">
                                  For keyword: {item.keyword}
                                </p>
                              </div>
                              <div className="p-3 max-h-[300px] overflow-y-auto space-y-2 bg-gray-50/50">
                                {item.suggested_titles.map((title, i) => (
                                  <div key={i}>
                                    {renderSuggestionItem(
                                      title,
                                      i,
                                      item.suggested_titles!.length
                                    )}
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground italic">
                          No specific titles suggested.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
