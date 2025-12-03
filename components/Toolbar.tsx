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
  Image,
  Link,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";
import { ImageGenerationDialog } from "./ImageGenerationDialog";

type ToolbarProps = {
  editor: Editor | null;
  title: string;
};

export const Toolbar = ({ editor, title }: ToolbarProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isGenDialogOpen, setIsGenDialogOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialStyle, setInitialStyle] = useState("natural");

  if (!editor) {
    return null;
  }

  const onSetLink = (url: string) => {
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  };

  const onSetImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const onMagicThumbnail = () => {
    const content = editor.getText();
    const summary = content.split("\n").slice(1, 4).join(" ").trim();

    const magicPrompt = `A creative thumbnail for an article titled "${title}". Context: ${summary}`;

    setInitialPrompt(magicPrompt);
    setInitialStyle("thumbnail");
    setIsGenDialogOpen(true);
  };

  const buttons = [
    {
      name: "Generate Image",
      command: () => setIsGenDialogOpen(true),
      isActive: false,
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      disabled: false,
    },
    {
      name: "Magic Thumbnail",
      command: onMagicThumbnail,
      isActive: false,
      icon: <Wand2 className="w-4 h-4 text-indigo-500" />,
      disabled: false,
    },
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
      name: "Link",
      command: () => setIsLinkDialogOpen(true),
      isActive: editor.isActive("link"),
      icon: <Link className="w-4 h-4" />,
      disabled: false,
    },
    {
      name: "Image",
      command: () => setIsImageDialogOpen(true),
      isActive: editor.isActive("image"),
      icon: <Image className="w-4 h-4" />,
      disabled: false,
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
    <>
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
      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSetLink={onSetLink}
        initialUrl={editor.getAttributes("link").href}
      />
      <ImageDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onSetImage={onSetImage}
      />
      <ImageGenerationDialog
        isOpen={isGenDialogOpen}
        onClose={() => {
          setIsGenDialogOpen(false);
          setInitialPrompt("");
          setInitialStyle("natural");
        }}
        onInsert={onSetImage}
        initialPrompt={initialPrompt}
        initialStyle={initialStyle}
      />
    </>
  );
};
