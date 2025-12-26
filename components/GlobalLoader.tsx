"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NextTopLoader from "nextjs-toploader";
import NProgress from "nprogress";
import { useAppStore } from "@/store/appStore";

export default function GlobalLoader() {
  const { topLoader, setTopLoader } = useAppStore();
  const pathname = usePathname();

  useEffect(() => {
    if (topLoader) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [topLoader]);

  useEffect(() => {
    // Reset loader state on route change completion
    setTopLoader(false);
  }, [pathname, setTopLoader]);

  return (
    <NextTopLoader
      color="#104127"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #104127,0 0 5px #104127"
    />
  );
}
