"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight/lib/core";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import java from "highlight.js/lib/languages/java";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import { useEffect } from "react";
import "../app/dracula.css";

// Register languages for syntax highlighting
lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);
lowlight.registerLanguage("python", python);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("java", java);
lowlight.registerLanguage("cpp", cpp);
lowlight.registerLanguage("c", c);

// Import custom extensions (adjust paths as needed)
import { CustomHardBreak } from "./editor/extensions/CustomHardBreak";
import { CustomImage } from "./editor/extensions/CustomImage";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

const MarkdownViewer = ({ content, className }: MarkdownViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        hardBreak: false,
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CustomHardBreak,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: true, // Enable clicking links in viewer
        HTMLAttributes: {
          class: "text-blue-500 hover:underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        linkify: true,
        breaks: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none focus:outline-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg text-black prose-p:text-black prose-headings:text-black ${className || ""}`,
      },
    },
    editable: false,
    content: content,
  });

  // Update content if prop changes
  useEffect(() => {
    if (editor && content !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
};

export default MarkdownViewer;
