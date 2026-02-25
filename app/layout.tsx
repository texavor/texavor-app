import type { Metadata } from "next";
import { Poppins, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "./ReactQueryProvider";
import { UpgradePromptProvider } from "@/components/UpgradePromptProvider";
import GlobalLoader from "@/components/GlobalLoader";
import Script from "next/script";
// import Script from "next/script";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Texavor",
    default: "Texavor - Authority for your blog",
  },
  description:
    "AI developer content strategist. Generate high-impact, E-E-A-T-optimized technical article ideas for Google & AI Chatbots. Maximize discovery & authority.",
  openGraph: {
    title: "Texavor - Authority for your blog",
    description:
      "AI developer content strategist. Generate high-impact, E-E-A-T-optimized technical article ideas for Google & AI Chatbots. Maximize discovery & authority.",
    images: "/easywriteOpenGraph.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Texavor - Authority for your blog",
    description:
      "AI developer content strategist. Generate high-impact, E-E-A-T-optimized technical article ideas for Google & AI Chatbots. Maximize discovery & authority.",
    images: "/easywriteOpenGraph.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <UpgradePromptProvider>
            <GlobalLoader />
            {children}
            <Toaster />
          </UpgradePromptProvider>
        </ReactQueryProvider>
      </body>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="631658d6-064e-4602-bd71-b9a6011aff8b"
        strategy="afterInteractive"
      />
    </html>
  );
}
