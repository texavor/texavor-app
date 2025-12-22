// components/article/ArticleContent.tsx
"use client";

import React, { useEffect, useRef, memo } from "react";

interface Heading {
  id: string;
  level: number;
  text: string;
  children?: Heading[];
}

// SIMPLIFIED VERSION - Testing if DOMParser causes removeChild error
export const ArticleContent = memo(function ArticleContent({
  html,
  relatedArticles,
  setHeadings,
  setIsTocLoaded,
}: {
  html: string;
  relatedArticles: any[];
  setHeadings: (headings: Heading[]) => void;
  setIsTocLoaded: (isTocLoaded: boolean) => void;
}) {
  const articleRef = useRef<HTMLElement>(null);

  // Extract headings for TOC (only feature we keep for now)
  useEffect(() => {
    const articleElement = articleRef.current;
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll("h1, h2, h3");
    const newHeadings: Heading[] = [];
    const parentHeadings: Heading[] = [];

    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || "";
      const id = text.toLowerCase().replace(/\s/g, "-");
      heading.id = id;

      const newHeading: Heading = { id, level, text };

      while (
        parentHeadings.length > 0 &&
        parentHeadings[parentHeadings.length - 1].level >= level
      ) {
        parentHeadings.pop();
      }

      if (parentHeadings.length > 0) {
        const parent = parentHeadings[parentHeadings.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newHeading);
      } else {
        newHeadings.push(newHeading);
      }

      parentHeadings.push(newHeading);
    });

    setHeadings(newHeadings);
    setIsTocLoaded(true);
  }, [html, setHeadings, setIsTocLoaded]);

  // SIMPLIFIED: Just render HTML without any DOMParser manipulation
  return (
    <article
      ref={articleRef}
      className="prose lg:prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
