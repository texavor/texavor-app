import { Metadata } from "next";
import IntegrationsClientPage from "./IntegrationsClientPage";

export const metadata: Metadata = {
  title: "Integrations",
};

export default function Page() {
  return <IntegrationsClientPage />;
}
