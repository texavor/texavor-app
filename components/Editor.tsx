"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import React, { useEffect } from "react";
import "../app/dracula.css";
import { useAppStore } from "@/store/appStore";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Maximize,
  Minimize,
  Settings,
  Download,
  Copy,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Share,
} from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";

/**
 * Enhanced props to include layout elements previously found in the parent page.
 */
type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange?: (value: string) => void;
  thumbnailUrl?: string | null;
  onAddCover?: () => void;
  onSettingsClick?: () => void;
  showMetrics?: boolean;
  onToggleMetrics?: () => void;
};

const Editor = ({
  value,
  onChange,
  title,
  onTitleChange,
  thumbnailUrl,
  onAddCover,
  onSettingsClick,
  showMetrics,
  onToggleMetrics,
}: EditorProps) => {
  const { zenMode, toggleZenMode } = useAppStore();
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  const handleExport = (option: any) => {
    setIsExportOpen(false);

    // Get raw markdown and trim unnecessary whitespace
    const rawMd = (editor?.storage.markdown.getMarkdown() || "").trim();

    // Prepend title as H1 if it exists
    const fullMd = title ? `# ${title}\n\n${rawMd}` : rawMd;

    if (option.id === "copy_md") {
      navigator.clipboard.writeText(fullMd);
      // You might want to show a toast here, but user said 'no toast in axios', this is local.
      // I'll assume standard behavior or no toast for now.
    } else if (option.id === "download_md") {
      const blob = new Blob([fullMd], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "article"}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (option.id === "download_pdf") {
      window.print();
      // Simple print for now as requested "one for down pdf do this"
    }
  };

  const exportOptions = [
    {
      name: "Download Markdown",
      id: "download_md",
      icon: <Download className="w-4 h-4" />,
    },
    {
      name: "Copy Markdown",
      id: "copy_md",
      icon: <Copy className="w-4 h-4" />,
    },
    {
      name: "Download PDF",
      id: "download_pdf",
      icon: <FileText className="w-4 h-4" />,
    },
  ];
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
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: "Write your article here...",
      }),
    ],
    autofocus: false,
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl text-black prose-p:text-black prose-headings:text-black",
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
    <div
      className={`${
        zenMode ? "sticky top-0 h-[calc(100vh-10px)]" : "h-[calc(100vh-100px)]"
      } rounded-xl bg-white font-inter flex flex-col relative group`}
    >
      {editor && <EditorBubbleMenu editor={editor} title={title} />}

      {/* Top Right Controls (Zen, Settings) */}
      <div
        className={`flex items-center justify-between z-50 w-full px-6 ${
          zenMode ? "fixed top-7 left-0" : "absolute top-4 left-0"
        }`}
      >
        {/* Left Side: Add Cover */}
        <div>
          {!thumbnailUrl && (
            <Button
              onClick={onAddCover}
              variant="ghost"
              size="sm"
              className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100 text-gray-600 gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Cover</span>
            </Button>
          )}
        </div>

        {/* Right Side: Controls */}
        <div className="flex gap-2">
          {/* Metrics Toggle */}
          <Button
            onClick={onToggleMetrics}
            variant="ghost"
            size="icon"
            className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
            title={showMetrics ? "Hide Metrics" : "Show Metrics"}
          >
            {showMetrics ? (
              <PanelRightClose className="h-4 w-4 text-gray-600" />
            ) : (
              <PanelRightOpen className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          {/* Export Dropdown */}
          <CustomDropdown
            open={isExportOpen}
            onOpenChange={setIsExportOpen}
            options={exportOptions}
            onSelect={handleExport}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
                title="Export"
              >
                <Share className="h-4 w-4 text-gray-600" />
              </Button>
            }
          />

          <Button
            onClick={toggleZenMode}
            variant="ghost"
            size="icon"
            className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
            title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
          >
            {zenMode ? (
              <Minimize className="h-4 w-4 text-gray-600" />
            ) : (
              <Maximize className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="icon"
            className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
            title="Article Details"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto no-scrollbar flex-grow w-full rounded-xl">
        <div className="px-6 pt-20 pb-10 max-w-4xl mx-auto w-full">
          {/* Cover Image Display (Only if exists) */}
          {thumbnailUrl && (
            <div className="mb-6 group/cover-area relative group/image">
              <img
                src={thumbnailUrl}
                alt="Article cover"
                className="w-full h-64 object-cover rounded-lg shadow-sm"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={onAddCover}
                className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity"
              >
                Change Cover
              </Button>
            </div>
          )}

          {/* Title Input */}
          <Textarea
            placeholder="Article Title..."
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            rows={1}
            className="border-none font-poppins text-5xl font-bold bg-transparent resize-none focus:ring-0 shadow-none focus-visible:ring-[0px] p-0 overflow-hidden text-gray-900 placeholder:text-gray-500"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        <div className="px-6 pb-10 max-w-4xl mx-auto w-full flex-grow">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
