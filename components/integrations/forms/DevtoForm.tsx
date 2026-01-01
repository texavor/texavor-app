import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { CustomMultiSelect } from "@/components/ui/CustomMultiSelect";

interface DevtoFormProps {
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  discovered?: {
    organizations?: any[];
    series?: string[];
    tags?: string[];
  };
  showCredentials?: boolean;
}

export function DevtoForm({
  formData,
  handleChange,
  discovered,
  showCredentials = true,
}: DevtoFormProps) {
  return (
    <div className="space-y-4">
      {showCredentials && (
        <div className="space-y-1.5">
          <Label htmlFor="api_key" className="text-foreground/80 font-inter">
            API Key
          </Label>
          <Input
            id="api_key"
            name="api_key"
            value={formData.api_key || ""}
            onChange={handleChange}
            required={!formData.api_key}
            placeholder="Your Dev.to API Key"
            className="font-inter"
            // If we have discovered data, it means we are connected, so API key is likely set/masked.
            // But user might want to change it.
          />
        </div>
      )}

      {discovered?.organizations && discovered.organizations.length > 0 && (
        <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
          <Label
            htmlFor="organization_id"
            className="text-foreground/80 font-inter"
          >
            Organization (Optional)
          </Label>
          <CustomDropdown
            options={[
              { name: "Personal Account", id: "", icon: null },
              ...discovered.organizations.map((org: any) => ({
                name: `${org.label} (@${org.username})`,
                id: org.value,
                icon: org.profile_image,
              })),
            ]}
            value={formData.organization_id || ""}
            onSelect={(option: any) =>
              handleChange({
                target: { name: "organization_id", value: option.id },
              } as any)
            }
            trigger={
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {formData.organization_id
                  ? (() => {
                      const selected = discovered.organizations.find(
                        (o: any) =>
                          o.value.toString() ===
                          formData.organization_id.toString()
                      );
                      return selected
                        ? `${selected.label} (@${selected.username})`
                        : "Personal Account";
                    })()
                  : "Personal Account"}
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
            Select an organization to publish articles under, or leave empty for
            personal.
          </p>
        </div>
      )}

      {/* Fallback info if no orgs found but discovery ran? Optional. */}
      {discovered &&
        (!discovered.organizations ||
          discovered.organizations.length === 0) && (
          <p className="text-[11px] text-muted-foreground italic">
            No organizations found. Publishing to personal account.
          </p>
        )}

      <div className="space-y-1.5">
        <Label className="font-inter text-foreground/80">
          Series (Optional)
        </Label>
        <Input
          name="series"
          list="series-options"
          value={formData.series || ""}
          onChange={handleChange}
          placeholder="Series Name"
          className="font-inter"
        />
        {discovered?.series && discovered.series.length > 0 && (
          <datalist id="series-options">
            {discovered.series.map((s: string) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
        <p className="text-[11px] text-muted-foreground">
          Enter a series name to add this article to a series.
        </p>
      </div>

      <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
        <Label className="font-inter text-foreground/80">Tags (Max 4)</Label>
        <CustomMultiSelect
          options={discovered?.tags?.map((t) => ({ label: t, value: t })) || []}
          selected={
            Array.isArray(formData.tags)
              ? formData.tags
              : formData.tags
              ? [formData.tags]
              : []
          }
          onChange={(newTags) => {
            // Dev.to tags are alphanumeric + underscore usually.
            // CustomMultiSelect sanitizes? Or we sanitize here?
            // CustomMultiSelect we wrote returns sanitized values if created.
            handleChange({
              target: { name: "tags", value: newTags },
            } as any);
          }}
          placeholder="Select or create tags..."
          creatable={true}
          maxSelected={4}
          className="font-inter"
        />
        <p className="text-[11px] text-muted-foreground">
          Select up to 4 tags. Create new ones by typing and pressing Enter.
        </p>
      </div>
    </div>
  );
}
