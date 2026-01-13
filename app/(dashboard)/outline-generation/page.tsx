import React from "react";
import { Metadata } from "next";
import OutlineGenerationClient from "./components/OutlineGenerationClient";

export const metadata: Metadata = {
  title: "Outline Generation",
};

const Page = () => {
  return <OutlineGenerationClient />;
};

export default Page;
