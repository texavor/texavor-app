import { Metadata } from "next";
import TeamSettingsClientPage from "./TeamSettingsClientPage";

export const metadata: Metadata = {
  title: "Team Settings",
};

export default function Page() {
  return <TeamSettingsClientPage />;
}
