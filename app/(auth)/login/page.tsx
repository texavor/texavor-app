import { Metadata } from "next";
import LoginClientPage from "./LoginClientPage";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return <LoginClientPage />;
}
