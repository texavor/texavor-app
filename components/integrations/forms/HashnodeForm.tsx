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
    </div>
  );
}
