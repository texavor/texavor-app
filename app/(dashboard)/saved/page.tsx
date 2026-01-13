import React from "react";
import { Metadata } from "next";
import SavedResultsClient from "./components/SavedResultsClient";

export const metadata: Metadata = {
  title: "Saved Results",
};

export default function SavedResultsPage() {
  return (
    <div className="w-full">
      <SavedResultsClient />
    </div>
  );
}
