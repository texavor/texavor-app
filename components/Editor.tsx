"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import React, { useEffect } from "react";
import "../app/dracula.css";
import { Toolbar } from "./Toolbar";
import { useAppStore } from "@/store/appStore";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

const Editor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { zenMode } = useAppStore();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        linkify: true,
        breaks: true,
      }),
      Placeholder.configure({
        placeholder: "Write your article here...",
      }),
    ],
    autofocus: true,
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
      handlePaste: (view, event, slice) => {
        if (slice.content.size > 0) {
          return false;
        }
        if (event.clipboardData?.getData("text/html")) {
          return false;
        }
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          const editor = (view as any).editor;
          event.preventDefault();
          const parsedContent = editor.storage.markdown.parser.parse(text);
          editor.commands.insertContent(parsedContent);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown();
      onChange(md);
    },
  });

  // Sync external value → editor
  useEffect(() => {
    if (!editor) return;

    const current = editor.storage.markdown.getMarkdown();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="rounded-xl bg-white font-inter border ">
      <Toolbar editor={editor} />
      <div
        className={`p-4 overflow-y-auto no-scrollbar ${
          zenMode ? "h-[calc(100vh-220px)]" : "h-[calc(100vh-290px)]"
        }`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
