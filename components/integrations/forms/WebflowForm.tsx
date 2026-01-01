import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface WebflowFormProps {
  formData: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  discovered?: {
    collections?: any[];
  };
}

export function WebflowForm({
  formData,
  handleChange,
  discovered,
}: WebflowFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="token" className="text-foreground/80 font-inter">
          API Token
        </Label>
        <Input
          id="token"
          name="token"
          value={formData.token || ""}
          onChange={handleChange}
          required={!formData.token}
          placeholder="Your Webflow API Token"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="site_id" className="text-foreground/80 font-inter">
          Site ID
        </Label>
        <Input
          id="site_id"
          name="site_id"
          value={formData.site_id || ""}
          onChange={handleChange}
          required
          placeholder="Your Webflow Site ID"
          className="font-inter"
          // In real usage, maybe Site ID is also discoverable?
          // But guide only mentioned collections.
          // However, if we have sites list, we could make this a dropdown too.
        />
      </div>

      {discovered?.collections && discovered.collections.length > 0 ? (
        <>
          <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
            <Label
              htmlFor="collection_id"
              className="text-foreground/80 font-inter"
            >
              Main Collection (Blog Posts)
            </Label>
            <select
              id="collection_id"
              name="collection_id"
              value={formData.collection_id || ""}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Collection</option>
              {discovered.collections.map((col: any) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 animation-in fade-in slide-in-from-top-1">
            <Label
              htmlFor="authors_collection_id"
              className="text-foreground/80 font-inter"
            >
              Authors Collection (Optional)
            </Label>
            <select
              id="authors_collection_id"
              name="authors_collection_id"
              value={formData.authors_collection_id || ""}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Collection</option>
              {discovered.collections.map((col: any) => (
                <option key={`auth-${col.value}`} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Required for syncing authors from Webflow.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <Label
            htmlFor="collection_id"
            className="text-foreground/80 font-inter"
          >
            Collection ID
          </Label>
          <Input
            id="collection_id"
            name="collection_id"
            value={formData.collection_id || ""}
            onChange={handleChange}
            required
            placeholder="Your Collection ID"
            className="font-inter"
          />
        </div>
      )}
    </div>
  );
}
