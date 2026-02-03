"use client";

import { useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstace";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ARTICLE,
  MOCK_KEYWORDS,
  MOCK_AEO_METRICS,
  MOCK_AEO_PROMPTS,
  MOCK_COMPETITIVE_RANKINGS,
  DEMO_BLOG,
} from "../MockData";

export default function MockNetworkInterceptor() {
  useEffect(() => {
    const originalAdapter = axiosInstance.defaults.adapter;

    // Custom Adapter to intercept requests
    axiosInstance.defaults.adapter = async (config) => {
      const url = config.url || "";
      console.log("[MockInterceptor] Intercepting:", url);

      return new Promise((resolve, reject) => {
        // --- AEO METRICS ---
        if (url.includes("/aeo/metrics")) {
          return resolve({
            data: MOCK_AEO_METRICS,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // --- AEO PROMPTS ---
        if (url.includes("/aeo/prompts")) {
          return resolve({
            data: MOCK_AEO_PROMPTS,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // --- COMPETITIVE RANKINGS ---
        if (
          url.includes("/competitive/rankings") ||
          url.includes("/rankings")
        ) {
          return resolve({
            data: MOCK_COMPETITIVE_RANKINGS,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // --- DASHBOARD STATS ---
        if (url.includes("/dashboard/stats")) {
          return resolve({
            data: MOCK_DASHBOARD_STATS,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // --- ARTICLES ---
        if (url.includes("/articles")) {
          // Return list of articles
          return resolve({
            data: {
              articles: [MOCK_ARTICLE],
              pagination: { count: 1, page: 1, pages: 1, per_page: 25 },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // --- AUTH CHECK (/me) ---
        // Even though we bypass AuthChecker, some components might call it.
        if (url.includes("/me")) {
          return resolve({
            data: { user: { id: "demo" }, blogs: [DEMO_BLOG] },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          });
        }

        // Default: If URL doesn't match, return a generic success or 404.
        // For safety in demo, let's return empty success object to prevent errors.
        console.warn("[MockInterceptor] Unhandled URL:", url);
        resolve({
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        });
      });
    };

    return () => {
      // Restore original adapter on unmount
      axiosInstance.defaults.adapter = originalAdapter;
    };
  }, []);

  return null;
}
