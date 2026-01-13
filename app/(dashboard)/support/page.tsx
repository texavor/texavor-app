import { Metadata } from "next";
import SupportClientPage from "./SupportClientPage";

export const metadata: Metadata = {
  title: "Support",
};

export default function Page() {
  return <SupportClientPage />;
}
