"use client";

import { BubbleMenu, Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Codepen,
  Sparkles,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { LinkDialog } from "./LinkDialog";
import { ImageDialog } from "./ImageDialog";
import { ImageGenerationDialog } from "./ImageGenerationDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EditorBubbleMenuProps = {
  editor: Editor;
  title: string;
};

export const EditorBubbleMenu = ({ editor, title }: EditorBubbleMenuProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isGenDialogOpen, setIsGenDialogOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialStyle, setInitialStyle] = useState("natural");

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
      const { empty, to } = editor.state.selection;
      if (!empty) {
        // Insert after selection
        editor
          .chain()
          .focus()
          .setTextSelection(to)
          .insertContent({ type: "image", attrs: { src: url } })
          .run();
      } else {
        editor.chain().focus().setImage({ src: url }).run();
      }
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

  const items = [
    {
      name: "Bold",
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      icon: <Bold className="w-4 h-4" />,
      tooltip: "Bold (Cmd+B)",
    },
    {
      name: "Italic",
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      icon: <Italic className="w-4 h-4" />,
      tooltip: "Italic (Cmd+I)",
    },
    {
      name: "Heading 1",
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      icon: <span className="text-xs font-bold">H1</span>,
      tooltip: "Heading 1",
    },
    {
      name: "Heading 2",
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      icon: <Heading2 className="w-4 h-4" />,
      tooltip: "Heading 2",
    },
    {
      name: "Heading 3",
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      icon: <span className="text-xs font-bold">H3</span>,
      tooltip: "Heading 3",
    },
    {
      name: "Link",
      command: () => {
        setIsLinkDialogOpen(true);
      },
      isActive: editor.isActive("link"),
      icon: <LinkIcon className="w-4 h-4" />,
      tooltip: "Link",
    },
    {
      name: "Code",
      command: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
      icon: <Code className="w-4 h-4" />,
      tooltip: "Code",
    },
  ];

  // Modified AI items to be icon-only and trigger the dialog
  const aiItems = [
    {
      name: "Generate Image",
      command: () => {
        // Get selected text for prompt
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");
        if (text) {
          setInitialPrompt(`Generate with the context: ${text}`);
          setInitialStyle("natural"); // Default style for inline images
        }

        setIsGenDialogOpen(true);
        // Blur the editor to hide the bubble menu
        editor.commands.blur();
      },
      isActive: false,
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      tooltip: "Generate Image with AI",
    },
  ];

  if (isLinkDialogOpen || isGenDialogOpen) {
    return (
      <>
        <LinkDialog
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          onSetLink={onSetLink}
          initialUrl={editor.getAttributes("link").href}
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
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex items-center gap-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <TooltipProvider>
          {items.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant={item.isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={item.command}
                  className="p-2 h-8 w-8"
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Changed to map aiItems similarly to items (icon only) */}
          {aiItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.command}
                  className="p-2 h-8 w-8"
                >
                  {item.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </BubbleMenu>

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSetLink={onSetLink}
        initialUrl={editor.getAttributes("link").href}
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
