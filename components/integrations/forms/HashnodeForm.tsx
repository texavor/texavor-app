import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React, { useMemo } from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";

interface HashnodeFormProps {
  formData: any;
  handleChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: any } }
  ) => void;
  discovered?: {
    publications?: any[];
    tags?: string[];
  };
  showCredentials?: boolean;
}

export function HashnodeForm({
  formData,
  handleChange,
  discovered,
  showCredentials = true,
}: HashnodeFormProps) {
  const selectedPublication = useMemo(() => {
    return discovered?.publications?.find(
      (p: any) => p.value === formData.publication_id
    );
  }, [discovered?.publications, formData.publication_id]);

  const seriesOptions = selectedPublication?.series || [];

  return (
    <div className="space-y-4">
      {/* Token Input (Always present, usually for connection phase) */}
      {showCredentials && (
        <div className="space-y-1.5">
          <Label htmlFor="token" className="text-foreground/80 font-inter">
            Personal Access Token
          </Label>
          <Input
            id="token"
            name="token"
            value={formData.token || ""}
            onChange={handleChange as any}
            // required={!formData.token} // Optional if editing article settings
            placeholder="Your Hashnode PAT"
            className="font-inter"
          />
        </div>
      )}

      {/* Publication Selector */}
      {discovered?.publications && discovered.publications.length > 0 ? (
        <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
          <Label
            htmlFor="publication_id"
            className="text-foreground/80 font-inter"
          >
            Publication
          </Label>
          <CustomDropdown
            options={discovered.publications.map((p: any) => ({
              name: p.label,
              id: p.value,
              icon: null,
            }))}
            value={formData.publication_id || ""}
            onSelect={(option: any) =>
              handleChange({
                target: { name: "publication_id", value: option.id },
              })
            }
            trigger={
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {formData.publication_id
                  ? discovered.publications.find(
                      (p: any) => p.value === formData.publication_id
                    )?.label || "Select Publication"
                  : "Select Publication"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 opacity-50"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            }
          />
          <p className="text-[11px] text-muted-foreground">
            Select the publication you want to post to.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label
            htmlFor="publication_id"
            className="text-foreground/80 font-inter"
          >
            Publication ID
          </Label>
          <Input
            id="publication_id"
            name="publication_id"
            value={formData.publication_id || ""}
            onChange={handleChange as any}
            placeholder="Your Publication ID"
            className="font-inter"
          />
        </div>
      )}

      {/* Subtitle */}
      <div className="space-y-1.5">
        <Label htmlFor="subtitle" className="text-foreground/80 font-inter">
          Subtitle (Optional)
        </Label>
        <Input
          id="subtitle"
          name="subtitle"
          value={formData.subtitle || ""}
          onChange={handleChange as any}
          placeholder="Article subtitle"
          className="font-inter"
        />
      </div>

      {/* Series Selector (Dependent on Publication) */}
      <div className="space-y-1.5">
        <Label htmlFor="series_id" className="text-foreground/80 font-inter">
          Series (Optional)
        </Label>
        <CustomDropdown
          options={[
            { name: "None", id: "" },
            ...seriesOptions.map((s: any) => ({
              name: s.label,
              id: s.value,
              icon: null,
            })),
          ]}
          value={formData.series_id || ""}
          onSelect={(option: any) =>
            handleChange({
              target: { name: "series_id", value: option.id },
            })
          }
          trigger={
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={!formData.publication_id || seriesOptions.length === 0}
            >
              {formData.series_id
                ? seriesOptions.find((s: any) => s.value === formData.series_id)
                    ?.label || "Select Series"
                : "Select Series"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 opacity-50"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          }
        />
        {!formData.publication_id && (
          <p className="text-[11px] text-muted-foreground">
            Select a publication to see series.
          </p>
        )}
        {formData.publication_id && seriesOptions.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            No series found for this publication.
          </p>
        )}
      </div>

      <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
        <Label className="font-inter text-foreground/80">Tags (Max 5)</Label>
        <CustomMultiSelect
          options={
            discovered?.tags?.map((t: string) => ({ label: t, value: t })) || []
          }
          selected={
            Array.isArray(formData.tags)
              ? formData.tags
              : formData.tags
              ? [formData.tags]
              : []
          }
          onChange={(newTags) => {
            handleChange({
              target: { name: "tags", value: newTags },
            } as any);
          }}
          placeholder="Select or create tags..."
          creatable={true}
          maxSelected={5}
          className="font-inter"
        />
        <p className="text-[11px] text-muted-foreground">
          Select up to 5 tags.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="hide_from_feed" className="text-sm font-medium">
            Hide from Feed
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Hide this article from Hashnode's community feed.
          </p>
        </div>
        <Switch
          id="hide_from_feed"
          checked={formData.hide_from_feed || false}
          onCheckedChange={(checked) =>
            handleChange({ target: { name: "hide_from_feed", value: checked } })
          }
        />
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label htmlFor="disable_comments" className="text-sm font-medium">
            Disable Comments
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Turn off comments for this article.
          </p>
        </div>
        <Switch
          id="disable_comments"
          checked={formData.disable_comments || false}
          onCheckedChange={(checked) =>
            handleChange({
              target: { name: "disable_comments", value: checked },
            })
          }
        />
      </div>
    </div>
  );
}
