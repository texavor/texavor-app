"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import React from "react";
import "../app/dracula.css";
import { Toolbar } from "./Toolbar";

const Editor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
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
    content: value || undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  return (
    <div className="rounded-xl bg-white font-inter border">
      <Toolbar editor={editor} />
      <div className="p-4 h-[calc(100vh-270px)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
