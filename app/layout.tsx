import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "./ReactQueryProvider";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "EasyWrite",
  description:
    "The AI content strategist for developers. Generate high-impact article ideas optimized for Google, AI Chatbots, and E-E-A-T. Built for technical content that gets discovered.",
  verification: {
    google: "WHjrUK7V1Y8n5aQ0gmeOk06LmzeSsadLBul9X_sQgTU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <ReactQueryProvider>
          {children}
          <Toaster />
        </ReactQueryProvider>
      </body>
      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="c1a4ed5c-37ee-4742-9432-13a5cffedf7d"
        strategy="afterInteractive"
      />
    </html>
  );
}
