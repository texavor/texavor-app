"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Heading2,
  Code,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { LinkDialog } from "./LinkDialog";
import { ImageGenerationDialog } from "./ImageGenerationDialog";
import { ImageUploadDialog } from "./ImageUploadDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CustomToolbarProps = {
  editor: Editor | null;
  title: string;
};

export const CustomToolbar = ({ editor, title }: CustomToolbarProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isGenDialogOpen, setIsGenDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [initialStyle, setInitialStyle] = useState("natural");
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      const { from, to, empty } = editor.state.selection;

      // Hide toolbar if no text is selected
      if (empty) {
        setIsVisible(false);
        return;
      }

      // Get the DOM coordinates of the selection
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Calculate toolbar position (centered above selection)
      const centerX = (start.left + end.right) / 2;
      const toolbarWidth = toolbarRef.current?.offsetWidth || 0;

      setPosition({
        top: start.top - 60, // Position above the selection
        left: centerX - toolbarWidth / 2, // Center horizontally
      });
      setIsVisible(true);
    };

    // Update on selection change
    editor.on("selectionUpdate", updateToolbar);
    editor.on("update", updateToolbar);

    // Initial update
    updateToolbar();

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("update", updateToolbar);
    };
  }, [editor]);

  if (!editor || !isVisible) return null;

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

  const onInsertImage = (url: string, altText?: string) => {
    if (url) {
      editor?.chain().focus().setImage({ src: url, alt: altText }).run();
    }
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
    {
      name: "Image",
      command: () => setIsImageDialogOpen(true),
      isActive: false,
      icon: <ImageIcon className="w-4 h-4" />,
      tooltip: "Insert Image",
    },
  ];

  const aiItems = [
    {
      name: "Generate Image",
      command: () => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");
        if (text) {
          setInitialPrompt(`${text}`);
          setInitialStyle("natural");
        }
        setIsGenDialogOpen(true);
      },
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      tooltip: "Generate Image with AI",
    },
  ];

  return (
    <>
      {/* Floating Toolbar */}
      <div
        ref={toolbarRef}
        className="fixed z-50 flex items-center gap-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
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

          <div className="w-px h-6 bg-gray-300 mx-1" />

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
      </div>

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

      <ImageUploadDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onInsert={onInsertImage}
      />
    </>
  );
};
