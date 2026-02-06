"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

const CrispChat = () => {
  const { user, blogs } = useAppStore();
  const controls = useAnimation();
  const isDragging = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only load in browser
    if (typeof window === "undefined") return;

    // Set Website ID
    const WEBSITE_ID =
      process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "PLACEHOLDER_ID";

    if (WEBSITE_ID === "PLACEHOLDER_ID") {
      console.warn("Crisp Chat: NEXT_PUBLIC_CRISP_WEBSITE_ID is not set.");
    }

    // Initialize Crisp
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = WEBSITE_ID;

    (function () {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();

    // Check system theme - REMOVED for forced Light Mode
    // const match = window.matchMedia("(prefers-color-scheme: dark)");
    // const setMode = () => {
    //   const mode = match.matches ? "dark" : "light";
    //   (window as any).$crisp.push(["config", "color:mode", [mode]]);
    // };
    // // Initial set provided logic
    // setMode();
    // // Listen
    // match.addEventListener("change", setMode);

    // Force Light Mode & Set Theme
    (window as any).$crisp.push(["config", "color:mode", ["light"]]);
    (window as any).$crisp.push(["config", "color:theme", ["green"]]);

    // return () => match.removeEventListener("change", setMode);
  }, []);

  // Update User Info when user changes
  useEffect(() => {
    if (user && (window as any).$crisp) {
      // ... existing logic
      if (user.email) {
        (window as any).$crisp.push(["set", "user:email", [user.email]]);
      }
      if (user.first_name || user.last_name) {
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        if (name) {
          (window as any).$crisp.push(["set", "user:nickname", [name]]);
        }
      }
      if (user.avatar_url) {
        (window as any).$crisp.push(["set", "user:avatar", [user.avatar_url]]);
      }

      // Helper to ensure valid string data
      const safeString = (val: any): string | null => {
        if (val === null || val === undefined) return null;
        if (typeof val === "string") return val;
        if (typeof val === "number") return String(val);
        return String(val);
      };

      // Session Data Construction
      const potentialData: [string, any][] = [];

      // User Data
      if (user.id) potentialData.push(["user_id", user.id]);
      if (user.role) potentialData.push(["role", user.role]);

      // Blog Data
      if (blogs && blogs.id) {
        potentialData.push(["blog_id", blogs.id]);
        potentialData.push(["blog_name", blogs.name]);
        if (blogs.website_url)
          potentialData.push(["website_url", blogs.website_url]);
      }

      // Filter and Format
      const sessionData = potentialData
        .map(([key, val]) => [key, safeString(val)] as [string, string | null])
        .filter(
          (item): item is [string, string] =>
            item[1] !== null &&
            item[1] !== "null" &&
            item[1] !== "undefined" &&
            item[1] !== "",
        );

      if (sessionData.length > 0 && (window as any).$crisp) {
        // Wrap in try-catch to prevent unhandled promise rejections
        try {
          (window as any).$crisp.push(["set", "session:data", [sessionData]]);
        } catch (e) {
          console.error("CrispChat: Push failed", e);
        }
      }
    }
  }, [user, blogs]);

  // Ensure chat is hidden on load and close
  useEffect(() => {
    if ((window as any).$crisp) {
      // Hide defaults immediately
      (window as any).$crisp.push(["do", "chat:hide"]);

      // Event Listeners
      const handleOpen = () => {
        setIsOpen(true);
      };

      const handleClose = () => {
        setIsOpen(false);
        (window as any).$crisp.push(["do", "chat:hide"]);
      };

      (window as any).$crisp.push(["on", "chat:opened", handleOpen]);
      (window as any).$crisp.push(["on", "chat:closed", handleClose]);
      (window as any).$crisp.push([
        "on",
        "chat:initiated",
        () => {
          (window as any).$crisp.push(["do", "chat:hide"]);
        },
      ]);
    }
  }, []);

  const toggleChat = () => {
    if (isDragging.current) return;

    if ((window as any).$crisp) {
      if (isOpen) {
        (window as any).$crisp.push(["do", "chat:close"]);
      } else {
        (window as any).$crisp.push(["do", "chat:show"]);
        (window as any).$crisp.push(["do", "chat:open"]);
      }
    }
  };

  // Snap to corner logic
  const handleDragEnd = (event: any, info: any) => {
    // Reset drag status after a small delay to block click
    setTimeout(() => {
      isDragging.current = false;
    }, 100);

    const parentWidth = window.innerWidth;
    const parentHeight = window.innerHeight;
    const btnSize = 56; // 14 * 4
    const margin = 24;

    const x = info.point.x;
    const y = info.point.y;

    const currentRight = 24;
    const currentBottom = 24;

    const targetX = x > parentWidth / 2 ? 0 : -(parentWidth - btnSize - 48);
    const targetY = y > parentHeight / 2 ? 0 : -(parentHeight - btnSize - 48);

    controls.start({
      x: targetX,
      y: targetY,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed z-[50]"
      style={{ bottom: 24, right: 24, touchAction: "none" }}
    >
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-2xl bg-[#104127] hover:bg-[#104127]/90 transition-all font-sans"
        onClick={toggleChat}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white" />
        )}
      </Button>
    </motion.div>
  );
};

export default CrispChat;
