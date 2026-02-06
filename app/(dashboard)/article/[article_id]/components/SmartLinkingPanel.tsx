import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Link2,
  ExternalLink,
  Loader2,
  Check,
  X,
  CheckCheck,
  Unlink,
} from "lucide-react";
import {
  useSmartLinksQuery,
  useRegenerateSmartLinks,
  useUpdateLinkStatus,
  LinkSuggestion,
  ExistingLink,
} from "@/hooks/useSmartLinking";
import { useSmartLinkStore } from "@/store/smartLinkStore";

interface SmartLinkingPanelProps {
  articleId: string;
  blogId: string;
  articleContent?: string;
  onApplyLink: (suggestion: LinkSuggestion) => void;
  onRemoveLink: (anchorText: string, url: string) => void;
  onHighlightText?: (text: string) => void;
}

export const SmartLinkingPanel = ({
  articleId,
  blogId,
  articleContent = "",
  onApplyLink,
  onRemoveLink,
  onHighlightText,
}: SmartLinkingPanelProps) => {
  const [includeExternal, setIncludeExternal] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Local state for URL edits
  const [urlOverrides, setUrlOverrides] = useState<Record<string, string>>({});

  // Use global store for data
  const { data: storeData, setData: setStoreData } = useSmartLinkStore();

  // Query is used for fetching stored suggestions
  const { data: queryData, isFetching: isQueryFetching } = useSmartLinksQuery(
    blogId,
    articleId,
    includeExternal,
    true, // enabled
  );

  // Mutation for regenerating suggestions
  const regenerateLinks = useRegenerateSmartLinks();

  // Sync query result to store
  useEffect(() => {
    if (queryData) {
      setStoreData(queryData);
    }
  }, [queryData, setStoreData]);

  const updateStatus = useUpdateLinkStatus();

  // Prefer store data, fallback to query data if needed
  const displayData = storeData || queryData;
  const isFetching = isQueryFetching || regenerateLinks.isPending;

  const handleAnalyze = () => {
    regenerateLinks.mutate({
      blogId,
      articleId,
      includeExternal,
    });
  };

  const getEffectiveUrl = (item: LinkSuggestion) => {
    const key = item.anchor_text + item.url; // Use original as key
    return urlOverrides[key] || item.url;
  };

  // Removed regex-based isApplied check in favor of backend status

  const handleApply = (item: LinkSuggestion) => {
    const effectiveUrl = getEffectiveUrl(item);

    // Pass the full suggestion object with the effective URL
    onApplyLink({
      ...item,
      url: effectiveUrl,
    });

    // Update backend status
    updateStatus.mutate({
      blogId,
      articleId,
      suggestionId: item.id,
      isApplied: true,
    });
  };

  const handleApplyAll = () => {
    if (!displayData) return;

    const internalSuggestions = displayData.suggestions?.internal || [];
    const externalSuggestions = displayData.suggestions?.external || [];

    const internalToApply = internalSuggestions.filter(
      (item) => !dismissed.has(item.url + item.anchor_text) && !item.is_applied,
    );
    const externalToApply = externalSuggestions.filter(
      (item) => !dismissed.has(item.url + item.anchor_text) && !item.is_applied,
    );

    const allToApply = [...internalToApply, ...externalToApply];

    allToApply.forEach((item) => {
      const effectiveUrl = getEffectiveUrl(item);
      onApplyLink({
        ...item,
        url: effectiveUrl,
      });
    });

    // Single bulk update to backend
    if (allToApply.length > 0) {
      updateStatus.mutate({
        blogId,
        articleId,
        applyAll: true,
      });
    }
  };

  const handleRemove = (item: ExistingLink) => {
    onRemoveLink(item.anchor_text, item.url);
  };

  const handleUrlUpdate = (item: LinkSuggestion, newUrl: string) => {
    const key = item.anchor_text + item.url;
    setUrlOverrides((prev) => ({ ...prev, [key]: newUrl }));
  };

  const handleDismiss = (item: LinkSuggestion) => {
    setDismissed((prev) => new Set(prev).add(item.url + item.anchor_text));
  };

  const internalSuggestions =
    displayData?.suggestions?.internal?.filter(
      (item) => !dismissed.has(item.url + item.anchor_text),
    ) || [];

  const externalSuggestions =
    displayData?.suggestions?.external?.filter(
      (item) => !dismissed.has(item.url + item.anchor_text),
    ) || [];

  const existingLinks = displayData?.suggestions?.existing || [];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-black font-poppins">
          Smart Links
        </h3>
        <Button
          onClick={handleAnalyze}
          disabled={isFetching}
          size="sm"
          className="bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none text-xs h-8"
        >
          {regenerateLinks.isPending ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Scanning...
            </>
          ) : (
            "Scan for Links"
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-lg">
        <Switch
          id="include-external"
          checked={includeExternal}
          onCheckedChange={setIncludeExternal}
        />
        <Label
          htmlFor="include-external"
          className="text-sm font-medium cursor-pointer font-inter"
        >
          Include External Links
        </Label>
      </div>

      {!displayData && !isFetching && (
        <div className="bg-primary/5 p-4 rounded-lg text-sm text-gray-600 text-center font-inter">
          <p>
            Scan your article to find internal and external linking
            opportunities.
          </p>
        </div>
      )}

      {displayData && (
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4">
            {/* Suggestions Section */}
            {(internalSuggestions.length > 0 ||
              externalSuggestions.length > 0) && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 font-poppins text-base">
                    Suggestions
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleApplyAll}
                    className="h-7 text-xs text-[#104127] hover:text-[#0d3320] hover:bg-green-50 px-2"
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Apply All
                  </Button>
                </div>

                <div className="space-y-2">
                  {internalSuggestions.map((item, idx) => (
                    <SuggestionItem
                      key={`internal-${idx}`}
                      item={item}
                      type="internal"
                      applied={item.is_applied}
                      currentUrl={getEffectiveUrl(item)}
                      onApply={() => handleApply(item)}
                      onDismiss={() => handleDismiss(item)}
                      onUrlChange={(val) => handleUrlUpdate(item, val)}
                      onHighlightText={onHighlightText}
                    />
                  ))}
                  {externalSuggestions.map((item, idx) => (
                    <SuggestionItem
                      key={`external-${idx}`}
                      item={item}
                      type="external"
                      applied={item.is_applied}
                      currentUrl={getEffectiveUrl(item)}
                      onApply={() => handleApply(item)}
                      onDismiss={() => handleDismiss(item)}
                      onUrlChange={(val) => handleUrlUpdate(item, val)}
                      onHighlightText={onHighlightText}
                    />
                  ))}
                </div>
              </div>
            )}

            {internalSuggestions.length === 0 &&
              externalSuggestions.length === 0 && (
                <div className="text-sm text-gray-500 italic text-center py-4">
                  No new suggestions found.
                </div>
              )}

            {/* Existing Links Section */}
            {/* <div className="bg-primary/5 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-gray-900 font-poppins text-base border-b border-gray-200 pb-2">
                Link Inventory
              </h4>
              <p className="text-xs text-gray-500 font-inter">
                Links already found in the original scan.
              </p>
              {existingLinks.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  No links found in this article.
                </p>
              ) : (
                <div className="space-y-2">
                  {existingLinks.map((item, idx) => (
                    <InventoryItem
                      key={idx}
                      item={item}
                      onRemove={() => handleRemove(item)}
                    />
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const SuggestionItem = ({
  item,
  type,
  applied,
  currentUrl,
  onApply,
  onDismiss,
  onUrlChange,
  onHighlightText,
}: {
  item: LinkSuggestion;
  type: "internal" | "external";
  applied: boolean;
  currentUrl: string;
  onApply: () => void;
  onDismiss: () => void;
  onUrlChange: (val: string) => void;
  onHighlightText?: (text: string) => void;
}) => (
  <div className="bg-primary/5 rounded-lg p-3 border border-transparent hover:border-gray-200 transition-all">
    <div className="flex justify-between items-start mb-2">
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 font-medium ${
          type === "internal"
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-purple-50 text-purple-700 border-purple-200"
        }`}
      >
        {type === "internal" ? "Internal" : "External"}
      </Badge>
      {!applied && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={onDismiss}
          title="Dismiss"
        >
          <X size={12} />
        </Button>
      )}
    </div>

    <div className="space-y-3">
      <div>
        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide font-semibold">
          Anchor Text
        </p>
        <div className="group relative">
          <div
            onClick={() => onHighlightText?.(item.anchor_text)}
            className="text-sm font-mono text-gray-900 transition-colors hover:text-primary cursor-pointer break-words pr-8 leading-relaxed"
          >
            "{item.anchor_text}"
            <button
              className="absolute right-0 top-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-md shadow-sm"
              title="Highlight in editor"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 11-6 6v3h3l6-6" />
                <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide font-semibold">
          Target URL
        </p>
        <div className="flex items-start gap-1.5">
          {applied ? (
            <p className="text-xs text-blue-600/70 font-inter break-all flex-1 py-1 italic">
              {currentUrl}
            </p>
          ) : (
            <Input
              value={currentUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className="h-7 text-xs flex-1 font-inter"
            />
          )}
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition-colors shrink-0"
            title="Open Link"
          >
            {type === "internal" ? (
              <Link2 size={12} />
            ) : (
              <ExternalLink size={12} />
            )}
          </a>
        </div>
      </div>

      {item.reason && (
        <p className="text-xs text-gray-600 italic font-inter leading-relaxed break-words">
          "{item.reason}"
        </p>
      )}
    </div>

    {applied ? (
      <Button
        size="sm"
        disabled
        className="w-full h-7 text-xs bg-gray-100 text-gray-600 border border-gray-200 shadow-none opacity-100 mt-3 font-medium"
      >
        <Check size={12} className="mr-1.5" /> Applied
      </Button>
    ) : (
      <Button
        size="sm"
        onClick={onApply}
        className="w-full h-7 text-xs bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none mt-3 font-medium"
      >
        <Check size={12} className="mr-1.5" /> Apply Link
      </Button>
    )}
  </div>
);

const InventoryItem = ({
  item,
  onRemove,
}: {
  item: ExistingLink;
  onRemove: () => void;
}) => (
  <div className="bg-primary/5 border border-transparent hover:border-gray-200 rounded-lg p-2.5 transition-all flex justify-between items-center group">
    <div className="overflow-hidden flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            item.type === "internal" ? "bg-blue-500" : "bg-purple-500"
          }`}
        />
        <span className="font-medium text-sm text-gray-900 truncate font-inter">
          {item.anchor_text}
        </span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-gray-500 hover:text-blue-600 hover:underline truncate block font-inter"
      >
        {item.url}
      </a>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
      onClick={onRemove}
      title="Remove Link"
    >
      <Unlink size={12} />
    </Button>
  </div>
);
