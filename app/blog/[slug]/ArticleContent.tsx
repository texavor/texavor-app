// components/article/ArticleContent.tsx
"use client";

import React, { useEffect, useRef, memo } from "react";
import { createRoot } from "react-dom/client";
import { InjectedRelatedArticles } from "./InjectedRelatedArticles";

// Define the interface for a single related article
interface RelatedArticle {
  slug: string;
  image: string;
  title: string;
}

interface Heading {
  id: string;
  level: number;
  text: string;
  children?: Heading[];
}

// Add relatedArticles prop to the component
export const ArticleContent = memo(function ArticleContent({
  html,
  relatedArticles,
  setHeadings,
  setIsTocLoaded,
}: {
  html: string;
  relatedArticles: RelatedArticle[];
  setHeadings: (headings: Heading[]) => void;
  setIsTocLoaded: (isTocLoaded: boolean) => void;
}) {
  const articleRef = useRef<HTMLElement>(null);
  // It's better to store the roots directly for easier cleanup
  const injectedRoots = useRef<ReturnType<typeof createRoot>[]>([]);

  // Log the incoming HTML to make sure it's what you expect
  // console.log("Received HTML prop:", html);

  useEffect(() => {
    if (articleRef.current) {
      const headingElements = articleRef.current.querySelectorAll("h1, h2, h3");
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

      // Find all <a> elements within the article content
      const linkElements = articleRef.current.querySelectorAll("a");

      linkElements.forEach((link) => {
        if (link.hostname !== window.location.hostname) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      });

      // Find all <pre> elements within the article content
      const preElements = articleRef.current.querySelectorAll("pre");

      preElements.forEach((pre) => {
        // Avoid adding a button if one already exists
        if (pre.parentElement?.classList.contains("code-block-container")) {
          return;
        }

        // --- 1. Create a container for the <pre> tag and the button ---
        const container = document.createElement("div");
        container.className = "code-block-container";
        container.style.position = "relative";

        // --- 2. Create the button ---
        const button = document.createElement("button");
        button.innerText = "Copy";
        button.className =
          "copy-button absolute top-2 right-2 px-2 py-1 text-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600";

        // --- 3. Add event listener to copy code ---
        button.addEventListener("click", () => {
          const codeElement = pre.querySelector("code");
          if (codeElement) {
            const codeToCopy = codeElement.innerText;
            navigator.clipboard.writeText(codeToCopy).then(() => {
              button.innerText = "Copied!";
              setTimeout(() => {
                button.innerText = "Copy";
              }, 2000); // Reset text after 2 seconds
            });
          }
        });

        // --- 4. Wrap the <pre> tag with the container ---
        pre.parentNode?.insertBefore(container, pre);
        container.appendChild(pre);

        // --- 5. Append the button to the container ---
        container.appendChild(button);
      });
    }

    console.log("✅ useEffect is running.");

    const articleElement = articleRef.current;
    if (!articleElement) {
      console.log("❌ Article ref is not available yet.");
      return;
    }

    // --- Cleanup Previous Injections ---
    // This part is for when the component re-renders with new HTML
    injectedRoots.current.forEach((root) => {
      // Find the container div and remove it before unmounting
      //@ts-ignore
      const container = root._internalRoot.containerInfo;
      container.parentNode?.removeChild(container);
      root.unmount();
    });
    injectedRoots.current = [];
    // --- End Cleanup ---

    // Find all <h2> elements within the rendered article
    const h2Elements = articleElement.querySelectorAll("h2");
    console.log(`🔎 Found ${h2Elements.length} h2 elements.`);

    // Ensure you have related articles and at least two h2 elements
    if (
      !relatedArticles ||
      relatedArticles.length === 0 ||
      h2Elements.length < 2
    ) {
      console.log(
        "⚠️ Not enough h2 elements or no related articles to inject.",
      );
      return;
    }

    // Target the second and last <h2> tags
    const secondH2 = h2Elements[1];
    const lastH2 = h2Elements[h2Elements.length - 1];

    // Function to inject the React component
    const inject = (targetElement: Element, position: string, article: any) => {
      if (!targetElement) return;

      console.log(`💉 Injecting related articles before ${position} h2.`);
      const container = document.createElement("div");
      targetElement.parentNode?.insertBefore(container, targetElement);

      const root = createRoot(container);
      root.render(<InjectedRelatedArticles article={article} />);

      // Store the root for cleanup
      injectedRoots.current.push(root);
    };

    // Inject before the second <h2>
    if (secondH2) {
      inject(secondH2, "second", relatedArticles?.[0]);
    }

    // Inject before the last <h2>, only if it's not the same as the second one
    if (lastH2 && lastH2 !== secondH2) {
      inject(lastH2, "last", relatedArticles?.[1]);
    }
  }, [html, relatedArticles]);

  return (
    <article
      ref={articleRef}
      className="prose lg:prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
