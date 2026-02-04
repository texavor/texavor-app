"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { DEMO_USER, DEMO_BLOG } from "../MockData";

export default function DemoStoreInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setBlogs, setMainLoading } = useAppStore();

  useEffect(() => {
    // Seed the store with demo data
    setUser(DEMO_USER);
    setBlogs([DEMO_BLOG]);
    // Important: Set mainLoading to false so the UI renders
    setMainLoading(false);
  }, [setUser, setBlogs, setMainLoading]);

  return <>{children}</>;
}
