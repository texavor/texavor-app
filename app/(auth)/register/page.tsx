import { Metadata } from "next";
import RegisterClientPage from "./RegisterClientPage";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return <RegisterClientPage />;
}
