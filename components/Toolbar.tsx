"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Codepen,
} from "lucide-react";
import { Button } from "./ui/button";

type ToolbarProps = {
  editor: Editor | null;
};

export const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      name: "Bold",
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      icon: <Bold className="w-4 h-4" />,
      disabled: !editor.can().chain().focus().toggleBold().run(),
    },
    {
      name: "Italic",
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      icon: <Italic className="w-4 h-4" />,
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      name: "Bullet List",
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      icon: <List className="w-4 h-4" />,
      disabled: false,
    },
    {
      name: "Ordered List",
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      icon: <ListOrdered className="w-4 h-4" />,
      disabled: false,
    },
    {
      name: "Heading",
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      icon: <Heading2 className="w-4 h-4" />,
      disabled: false,
    },
    {
      name: "Blockquote",
      command: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      icon: <Quote className="w-4 h-4" />,
      disabled: false,
    },
    {
      name: "Code",
      command: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
      icon: <Code className="w-4 h-4" />,
      disabled: !editor.can().chain().focus().toggleCode().run(),
    },
    {
      name: "Code Block",
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
      icon: <Codepen className="w-4 h-4" />,
      disabled: false,
    },
  ];

  return (
    <div className="border-b border-gray-200 p-2 flex items-center flex-wrap gap-1">
      {buttons.map((button) => (
        <Button
          key={button.name}
          variant={button.isActive ? "secondary" : "ghost"}
          size="sm"
          onClick={button.command}
          disabled={button.disabled}
          className="p-2"
          aria-label={button.name}
        >
          {button.icon}
        </Button>
      ))}
    </div>
  );
};
