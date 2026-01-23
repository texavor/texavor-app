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
import { CustomToolbar } from "./CustomToolbar";
import { CustomHardBreak } from "./editor/extensions/CustomHardBreak";
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
  Save,
  Loader2,
} from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImage } from "@/lib/imageService";
import { toast } from "sonner";

/**
 * Enhanced props to include layout elements previously found in the parent page.
 */
type EditorProps = {
  value: string;
  onChange: (value: string, html?: string) => void;
  title: string;
  onTitleChange?: (value: string) => void;
  thumbnailUrl?: string | null;
  onAddCover?: () => void;
  onRemoveCover?: () => void;
  onSettingsClick?: () => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  showMetrics?: boolean;
  onToggleMetrics?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
};

const Editor = ({
  value,
  onChange,
  title,
  onTitleChange,
  thumbnailUrl,
  onAddCover,
  onRemoveCover,
  onSettingsClick,
  onSave,
  isSaving,
  showMetrics,
  onToggleMetrics,
  isLoading,
  readOnly = false,
}: EditorProps) => {
  const { zenMode, toggleZenMode } = useAppStore();
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    if (readOnly) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, readOnly]);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  // Handle image upload from paste or drop
  const handleImageUpload = async (file: File) => {
    // Validate file
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid image format. Supported: PNG, JPG, JPEG, WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }

    // 1. Create local preview URL
    const previewUrl = URL.createObjectURL(file);

    try {
      // 2. Insert image immediately with preview URL
      // Using "Uploading..." as temporary alt text
      editor
        ?.chain()
        .focus()
        .setImage({ src: previewUrl, alt: "Uploading image..." })
        .run();

      // Show unobtrusive loading toast
      const loadingToast = toast.loading("Uploading image...", {
        id: "upload-toast",
      });

      // 3. Upload image in background
      const serverUrl = await uploadImage(file);

      // 4. Find the image node with previewUrl and swap it for serverUrl
      if (editor) {
        let found = false;
        editor.view.state.doc.descendants((node, pos) => {
          if (found) return false; // Stop if already found
          if (node.type.name === "image" && node.attrs.src === previewUrl) {
            // Found the preview image node
            const transaction = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              src: serverUrl,
              // If user didn't change the alt text from our default, clear it or set to file name
              alt:
                node.attrs.alt === "Uploading image..." ? "" : node.attrs.alt,
            });
            editor.view.dispatch(transaction);
            found = true;
            return false;
          }
          return true;
        });
      }

      // Success feedback
      toast.success("Image uploaded", { id: "upload-toast" });
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image", { id: "upload-toast" });

      // 5. Cleanup on failure: Remove the preview image
      if (editor) {
        let found = false;
        editor.view.state.doc.descendants((node, pos) => {
          if (found) return false;
          if (node.type.name === "image" && node.attrs.src === previewUrl) {
            const transaction = editor.state.tr.delete(
              pos,
              pos + node.nodeSize,
            );
            editor.view.dispatch(transaction);
            found = true;
            return false;
          }
          return true;
        });
      }
    } finally {
      // Always revoke object URL to free memory
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleExport = async (option: any) => {
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
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      // Cleanup - remove element and revoke URL
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch (e) {
          // Element may have already been removed
        }
        URL.revokeObjectURL(url);
      }, 100);
    } else if (option.id === "download_pdf") {
      if (!editor) {
        alert("Editor is not ready. Please try again.");
        return;
      }

      setIsGeneratingPDF(true);
      try {
        const { pdf } = await import("@react-pdf/renderer");
        const PdfDocument = (await import("./PdfDocument")).default;

        // Ensure we get the latest content from the editor
        const contentHTML = editor.getHTML();
        const titleText = title || "Untitled";

        if (
          !contentHTML ||
          contentHTML.trim() === "<p></p>" ||
          contentHTML.trim() === ""
        ) {
          alert(
            "No content to export. Please add some content to your article.",
          );
          setIsGeneratingPDF(false);
          return;
        }

        // Process images: fetch external ones via proxy and convert to Base64
        const processImagesForPdf = async (html: string): Promise<string> => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const images = doc.getElementsByTagName("img");

          await Promise.all(
            Array.from(images).map(async (img) => {
              const src = img.getAttribute("src");
              if (!src) return;

              try {
                // If it's already Base64, skip
                if (src.startsWith("data:")) {
                  return;
                }

                // If it's an external URL, fetch via proxy
                if (src.startsWith("http://") || src.startsWith("https://")) {
                  const { axiosInstance } = await import("@/lib/axiosInstace");
                  const response = await axiosInstance.get(
                    "/api/v1/proxy_image",
                    {
                      params: { url: src },
                      responseType: "blob",
                    },
                  );

                  // Convert blob to Base64
                  const blob = response.data;
                  const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });

                  img.src = base64;
                } else if (src.startsWith("/")) {
                  // Make relative URLs absolute
                  img.src = `${window.location.origin}${src}`;
                }
              } catch (err) {
                // Keep original src as fallback
              }
            }),
          );

          return doc.body.innerHTML;
        };

        const processedContent = await processImagesForPdf(contentHTML);

        // Process cover image if present
        let processedCoverUrl = thumbnailUrl;
        if (
          thumbnailUrl &&
          (thumbnailUrl.startsWith("http://") ||
            thumbnailUrl.startsWith("https://"))
        ) {
          try {
            const { axiosInstance } = await import("@/lib/axiosInstace");
            const response = await axiosInstance.get("/api/v1/proxy_image", {
              params: { url: thumbnailUrl },
              responseType: "blob",
            });

            // Convert blob to Base64
            const blob = response.data;
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            processedCoverUrl = base64;
          } catch (err) {
            console.error("Failed to process cover image:", err);
            // Keep original URL as fallback
          }
        }

        const blob = await pdf(
          <PdfDocument
            content={processedContent}
            title={titleText}
            coverUrl={processedCoverUrl}
          />,
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${titleText}.pdf`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        // Cleanup - remove element and revoke URL
        setTimeout(() => {
          try {
            document.body.removeChild(a);
          } catch (e) {
            // Element may have already been removed
          }
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert(
          "Failed to generate PDF. Please ensure content is valid and try again.",
        );
      } finally {
        setIsGeneratingPDF(false);
      }
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
        hardBreak: false,
      }),
      CustomHardBreak,
      Image.configure({
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        linkify: true,
        breaks: false,
        transformPastedText: false,
        transformCopiedText: false,
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
        spellcheck: "false",
        "data-gramm": "false", // Disable Grammarly
        translate: "no", // Disable translation
      },
      handleDrop: (view, event, _slice, moved) => {
        if (readOnly) return false;
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (readOnly) return false;
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown();
      const html = editor.getHTML();
      onChange(md, html);
    },
  });

  // Sync readOnly state → editor
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  // Sync external value → editor
  useEffect(() => {
    if (!editor) return;

    // Don't overwrite if the editor is focused (user is typing)
    if (editor.isFocused) return;

    const current = editor.storage.markdown.getMarkdown();
    // Only update if content is genuinely different (avoid whitespace loops)
    if (value && value.trim() !== current.trim()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Loading Skeleton State (also shown during hydration to prevent mismatches)
  if (!mounted || isLoading) {
    return (
      <div
        className={`${
          mounted && zenMode
            ? "sticky top-0 h-[calc(100vh-10px)]"
            : "h-[calc(100vh-100px)]"
        } rounded-xl bg-white font-inter flex flex-col relative group p-6 space-y-8`}
      >
        {/* Placeholder for toolbar */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-32 h-8 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {/* Cover image placeholder */}
          <Skeleton className="w-full h-10 rounded-md" />

          {/* Title placeholder */}
          <Skeleton className="w-3/4 h-12 rounded-md mt-8" />

          {/* Content placeholder */}
          <div className="space-y-4 mt-8">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-5/6 h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-4/5 h-4 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        zenMode ? "sticky top-0 h-[calc(100vh-10px)]" : "h-[calc(100vh-100px)]"
      } rounded-xl bg-white font-inter flex flex-col relative group`}
    >
      {/* Custom Floating Toolbar - appears on text selection */}
      <CustomToolbar editor={editor} title={title} />

      {/* Top Right Controls (Zen, Settings) */}
      <div
        className={`flex items-center justify-between z-50 w-full px-6 ${
          zenMode ? "fixed top-7 left-0" : "absolute top-4 left-0"
        }`}
      >
        {/* Left Side: Add/Change Cover - Hide if readOnly */}
        {!readOnly && (
          <div>
            <Button
              onClick={onAddCover}
              variant="ghost"
              size="sm"
              className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100 text-gray-600 gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {thumbnailUrl ? "Change Cover" : "Add Cover"}
              </span>
            </Button>
          </div>
        )}

        {/* Right Side: Controls */}
        <div className="flex gap-2">
          {/* Save Button - Hide if readOnly */}
          {!readOnly && (
            <Button
              onClick={onSave}
              disabled={isSaving || !onSave}
              variant="ghost"
              size="icon"
              className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
              title="Save (Ctrl+S / Cmd+S)"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          )}

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

          {!readOnly && (
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="icon"
              className="bg-white shadow-sm hover:bg-gray-100 border border-gray-100"
              title="Article Details"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Dialog for PDF Generation */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 min-w-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-sm font-medium">
              Generating PDF, please wait...
            </p>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto no-scrollbar flex-grow w-full rounded-xl">
        <div className="px-6 pt-20 pb-10 max-w-4xl mx-auto w-full">
          {/* Cover Image Display (Only if exists) */}
          {thumbnailUrl && (
            <div className="mb-6 group/cover-area relative group/image">
              <img
                src={thumbnailUrl}
                alt="Article cover"
                className="w-full h-90 object-cover rounded-lg shadow-sm"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemoveCover}
                className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity"
              >
                Remove Cover
              </Button>
            </div>
          )}

          {/* Title Input */}
          <Textarea
            placeholder="Article Title..."
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            disabled={readOnly}
            rows={1}
            className="border-none font-poppins text-5xl font-bold bg-transparent resize-none focus:ring-0 shadow-none focus-visible:ring-[0px] p-0 overflow-hidden text-gray-900 placeholder:text-gray-500 disabled:opacity-100 disabled:cursor-default"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        <div
          className="px-6 pb-[50vh] max-w-4xl mx-auto w-full flex-grow"
          suppressHydrationWarning
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
