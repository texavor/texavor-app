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
  useUpdateLinkStatus,
  LinkSuggestion,
  ExistingLink,
} from "@/hooks/useSmartLinking";

interface SmartLinkingPanelProps {
  articleId: string;
  blogId: string;
  articleContent?: string;
  onApplyLink: (anchorText: string, url: string) => void;
  onRemoveLink: (anchorText: string, url: string) => void;
}

export const SmartLinkingPanel = ({
  articleId,
  blogId,
  articleContent = "",
  onApplyLink,
  onRemoveLink,
}: SmartLinkingPanelProps) => {
  const [includeExternal, setIncludeExternal] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [scanVersion, setScanVersion] = useState(0);

  // Local state for URL edits. Key: "type-index" or just combine suggestions.
  // Since we fetch from query, data is immutable from that source.
  // We need a local override map: key (url+text) -> newUrl
  const [urlOverrides, setUrlOverrides] = useState<Record<string, string>>({});

  const { data, isFetching, refetch } = useSmartLinksQuery(
    blogId,
    articleId,
    includeExternal,
    scanVersion,
    shouldFetch,
  );

  const updateStatus = useUpdateLinkStatus();

  const handleAnalyze = () => {
    setShouldFetch(true);
    // Increment version to trigger new query.
    // Version 1 (0->1) = First fetch (force_refresh=false).
    // Version >1 = Re-fetch (force_refresh=true).
    setScanVersion((v) => v + 1);
  };

  const getEffectiveUrl = (item: LinkSuggestion) => {
    const key = item.anchor_text + item.url; // Use original as key
    return urlOverrides[key] || item.url;
  };

  // Removed regex-based isApplied check in favor of backend status

  const handleApply = (item: LinkSuggestion) => {
    const effectiveUrl = getEffectiveUrl(item);
    onApplyLink(item.anchor_text, effectiveUrl);

    // Update backend status
    updateStatus.mutate({
      blogId,
      articleId,
      suggestionId: item.id,
      isApplied: true,
    });
  };

  const handleApplyAll = () => {
    if (!data) return;

    const internalSuggestions = data.suggestions?.internal || [];
    const externalSuggestions = data.suggestions?.external || [];

    const internalToApply = internalSuggestions.filter(
      (item) => !dismissed.has(item.url + item.anchor_text) && !item.is_applied,
    );
    const externalToApply = externalSuggestions.filter(
      (item) => !dismissed.has(item.url + item.anchor_text) && !item.is_applied,
    );

    const allToApply = [...internalToApply, ...externalToApply];

    allToApply.forEach((item) => {
      const effectiveUrl = getEffectiveUrl(item);
      onApplyLink(item.anchor_text, effectiveUrl);
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
    data?.suggestions?.internal?.filter(
      (item) => !dismissed.has(item.url + item.anchor_text),
    ) || [];

  const externalSuggestions =
    data?.suggestions?.external?.filter(
      (item) => !dismissed.has(item.url + item.anchor_text),
    ) || [];

  const existingLinks = data?.suggestions?.existing || [];

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
          className="bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Scan for Links"
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-2 my-2 bg-gray-50 p-2 rounded-md">
        <Switch
          id="include-external"
          checked={includeExternal}
          onCheckedChange={setIncludeExternal}
        />
        <Label
          htmlFor="include-external"
          className="text-xs font-medium cursor-pointer"
        >
          Include External Links
        </Label>
      </div>

      {!data && !isFetching && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 text-center">
          <p>
            Scan your article to find internal and external linking
            opportunities.
          </p>
        </div>
      )}

      {data && (
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6">
            {/* Suggestions Section */}
            {(internalSuggestions.length > 0 ||
              externalSuggestions.length > 0) && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="font-poppins text-sm font-semibold text-gray-900">
                    Suggestions
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleApplyAll}
                    className="h-6 text-xs text-[#104127] hover:text-[#0d3320] hover:bg-green-50 px-2"
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Apply All
                  </Button>
                </div>

                {internalSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Internal ({internalSuggestions.length})
                    </p>
                    {internalSuggestions.map((item, idx) => (
                      <SuggestionItem
                        key={idx}
                        item={item}
                        type="internal"
                        applied={item.is_applied}
                        currentUrl={getEffectiveUrl(item)}
                        onApply={() => handleApply(item)}
                        onDismiss={() => handleDismiss(item)}
                        onUrlChange={(val) => handleUrlUpdate(item, val)}
                      />
                    ))}
                  </div>
                )}

                {externalSuggestions.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      External ({externalSuggestions.length})
                    </p>
                    {externalSuggestions.map((item, idx) => (
                      <SuggestionItem
                        key={idx}
                        item={item}
                        type="external"
                        applied={item.is_applied}
                        currentUrl={getEffectiveUrl(item)}
                        onApply={() => handleApply(item)}
                        onDismiss={() => handleDismiss(item)}
                        onUrlChange={(val) => handleUrlUpdate(item, val)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {internalSuggestions.length === 0 &&
              externalSuggestions.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  No new suggestions found.
                </div>
              )}

            {/* Existing Links Section */}
            <div className="space-y-3">
              <h4 className="font-poppins text-sm font-semibold text-gray-900 border-b pb-1">
                Link Inventory
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                Links already found in the original scan.
              </p>
              {existingLinks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
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
            </div>
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
}: {
  item: LinkSuggestion;
  type: "internal" | "external";
  applied: boolean;
  currentUrl: string;
  onApply: () => void;
  onDismiss: () => void;
  onUrlChange: (val: string) => void;
}) => (
  <div
    className={`bg-white border ${applied ? "border-green-200 bg-green-50/50" : "border-gray-100"} rounded-lg p-3 shadow-sm hover:shadow-md transition-all group`}
  >
    <div className="flex justify-between items-start mb-2">
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 ${
          type === "internal"
            ? "bg-blue-50 text-blue-700 border-blue-100"
            : "bg-purple-50 text-purple-700 border-purple-100"
        }`}
      >
        {type === "internal" ? "Internal" : "External"}
      </Badge>
      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-red-500"
          onClick={onDismiss}
          title="Dismiss"
        >
          <X size={14} />
        </Button>
      </div>
    </div>

    <div className="mb-2">
      <p className="text-xs text-gray-500 mb-0.5">Anchor Text:</p>
      <p className="font-medium text-sm text-gray-900 bg-gray-50 inline-block px-1 rounded">
        {item.anchor_text}
      </p>
    </div>

    <div className="mb-3">
      <p className="text-xs text-gray-500 mb-0.5">Target URL:</p>
      <div className="flex items-center gap-1.5">
        <Input
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="h-7 text-xs flex-1"
          disabled={applied}
        />
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
          title="Open Link"
        >
          {type === "internal" ? (
            <Link2 size={14} />
          ) : (
            <ExternalLink size={14} />
          )}
        </a>
      </div>
    </div>

    {item.reason && (
      <p className="text-xs text-gray-600 italic mb-3">"{item.reason}"</p>
    )}

    {applied ? (
      <Button
        size="sm"
        disabled
        className="w-full h-8 text-xs bg-green-100 text-green-700 border border-green-200 shadow-none opacity-100"
      >
        <Check size={14} className="mr-1.5" /> Applied
      </Button>
    ) : (
      <Button
        size="sm"
        onClick={onApply}
        className="w-full h-8 text-xs bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none"
      >
        <Check size={14} className="mr-1.5" /> Apply Link
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
  <div className="bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg p-2.5 transition-colors flex justify-between items-center group">
    <div className="overflow-hidden">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            item.type === "internal" ? "bg-blue-500" : "bg-purple-500"
          }`}
        />
        <span className="font-medium text-sm text-gray-900 truncate">
          {item.anchor_text}
        </span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-gray-500 hover:text-blue-600 hover:underline truncate block max-w-[220px]"
      >
        {item.url}
      </a>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-gray-400 hover:text-red-600 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={onRemove}
      title="Remove Link"
    >
      <Unlink size={14} />
    </Button>
  </div>
);
