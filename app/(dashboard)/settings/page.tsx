import { Metadata } from "next";
import SettingsClientPage from "./SettingsClientPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <SettingsClientPage />;
}
