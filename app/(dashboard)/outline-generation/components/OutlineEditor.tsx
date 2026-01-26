import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { OutlineData, OutlineSection } from "../hooks/useOutlineApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Trash2,
  Plus,
  Save,
  Loader2,
  FileText,
  Check,
  FileEdit,
  Book,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { ResearchBriefSheet } from "./ResearchBriefSheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OutlineEditorProps {
  initialData: OutlineData;
  onSave: (data: OutlineData) => void;
  onChange?: (data: OutlineData) => void;
  isSaving: boolean;
  isEditMode?: boolean;
  linkedArticle?: any;
}

interface SortableItemProps {
  id: string;
  section: OutlineSection;
  index: number;
  onUpdate: (index: number, section: OutlineSection) => void;
  onRemove: (index: number) => void;
}

const SortableSectionItem = ({
  id,
  section,
  index,
  onUpdate,
  onRemove,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddPoint = () => {
    const newPoints = [...section.key_points, ""];
    onUpdate(index, { ...section, key_points: newPoints });
  };

  const handlePointChange = (pointIndex: number, value: string) => {
    const newPoints = [...section.key_points];
    newPoints[pointIndex] = value;
    onUpdate(index, { ...section, key_points: newPoints });
  };

  const handleRemovePoint = (pointIndex: number) => {
    const newPoints = section.key_points.filter((_, i) => i !== pointIndex);
    onUpdate(index, { ...section, key_points: newPoints });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-4 scroll-mt-20"
      id={`outline-section-${index}`}
    >
      <Card className="border-none shadow-none bg-white">
        <CardHeader className="p-4 pb-1 flex flex-row items-center gap-2 space-y-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:bg-gray-100 p-1 rounded"
          >
            <GripVertical size={20} className="text-gray-400" />
          </div>
          <Input
            value={section.heading}
            onChange={(e) =>
              onUpdate(index, { ...section, heading: e.target.value })
            }
            className="font-semibold text-lg border-transparent hover:border-gray-200 focus:border-green-500 px-2 h-9 flex-1"
            placeholder="Section Heading"
          />
          {section.citations && section.citations.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium cursor-help">
                    <Book size={12} />
                    <span>{section.citations.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="font-semibold mb-1 text-xs">Sources:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {section.citations.map((c, i) => (
                      <li key={i} className="text-xs truncate">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {c.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0 pl-12">
          <ul className="space-y-2">
            {section.key_points.map((point, pIndex) => (
              <li key={pIndex} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                <Input
                  value={point}
                  onChange={(e) => handlePointChange(pIndex, e.target.value)}
                  className="h-8 text-sm border-transparent hover:border-gray-200 focus:border-green-500 bg-gray-50/50"
                  placeholder="Key point"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePoint(pIndex)}
                  className="h-8 w-8 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddPoint}
            className="mt-2 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs font-medium h-8"
          >
            <Plus size={14} className="mr-1" /> Add Key Point
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const OutlineEditor: React.FC<OutlineEditorProps> = ({
  initialData,
  onSave,
  onChange,
  isSaving,
  isEditMode = false,
  linkedArticle,
}) => {
  const router = useRouter();
  const { blogs } = useAppStore();
  const [data, setData] = useState<OutlineData>(initialData);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showResearch, setShowResearch] = useState(false);

  // Mutation to create article from outline
  const createArticleMutation = useMutation({
    mutationFn: async () => {
      let outlineId = data?.id;

      // If outline hasn't been saved yet, save it first
      if (!outlineId) {
        const outlineToSave = {
          ...data,
          sections: items.map((i) => i.section),
        };

        // Save using the saved_results API
        const saveRes = await axiosInstance.post(
          `/api/v1/blogs/${blogs?.id}/saved_results`,
          {
            saved_result: {
              result_type: "outline_generation",
              title: outlineToSave.title,
              search_params: {
                topic: outlineToSave.topic,
                tone: outlineToSave.tone,
                target_audience: outlineToSave.target_audience,
              },
              result_data: {
                title: outlineToSave.title,
                meta_description: outlineToSave.meta_description,
                introduction: outlineToSave.introduction,
                sections: outlineToSave.sections,
                conclusion: outlineToSave.conclusion,
                estimated_word_count: outlineToSave.estimated_word_count,
                target_keywords: outlineToSave.target_keywords,
                tone: outlineToSave.tone,
                target_audience: outlineToSave.target_audience,
                research_brief: outlineToSave.research_brief, // Include Research Brief
              },
            },
          },
        );

        // Extract the saved_result ID from the response
        outlineId = saveRes?.data?.data?.id || saveRes?.data?.id;

        // Update local data with the saved outline ID
        setData((prev) => ({ ...prev, id: outlineId }));
      }

      // Now create the article with the outline ID
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/articles`,
        {
          title: data.title || "Untitled Article",
          content: data.meta_description || "",
          saved_result_id: outlineId,
          source: "texavor",
        },
      );
      return res?.data;
    },
    onSuccess: (articleData) => {
      // Navigate to the article editor
      router.push(`/article/${articleData?.id}`);
    },
  });

  const prevIsSaving = React.useRef(isSaving);
  useEffect(() => {
    if (prevIsSaving.current && !isSaving) {
      setShowSavedMessage(true);
    }
    prevIsSaving.current = isSaving;
  }, [isSaving]);

  // Only sync ID if it changes (e.g. after save)
  useEffect(() => {
    if (initialData.id && initialData.id !== data.id) {
      setData((prev) => ({ ...prev, id: initialData.id }));
    }
    if (initialData.research_brief && !data.research_brief) {
      setData((prev) => ({
        ...prev,
        research_brief: initialData.research_brief,
      }));
    }
  }, [initialData.id, data.id, initialData.research_brief]);

  // Refactored State Management for Sections
  const [items, setItems] = useState<{ id: string; section: OutlineSection }[]>(
    () =>
      initialData.sections.map((s) => ({
        id: `section-${Math.random().toString(36).substr(2, 9)}`,
        section: s,
      })),
  );

  // Reset Saved message on content change
  useEffect(() => {
    if (showSavedMessage) {
      setShowSavedMessage(false);
    }
  }, [
    data.title,
    data.meta_description,
    data.introduction,
    data.conclusion,
    items,
  ]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange({
        ...data,
        sections: items.map((i) => i.section),
      });
    }
  }, [
    data.title,
    data.meta_description,
    data.introduction,
    data.conclusion,
    items,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEndReal = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSection = (index: number, updatedSection: OutlineSection) => {
    const newItems = [...items];
    newItems[index].section = updatedSection;
    setItems(newItems);
  };

  const removeSection = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const addSection = () => {
    setItems([
      ...items,
      {
        id: `section-${Math.random().toString(36).substr(2, 9)}`,
        section: { heading: "New Section", key_points: [""] },
      },
    ]);
  };

  const handleSave = () => {
    onSave({
      ...data,
      sections: items.map((i) => i.section),
    });
  };

  return (
    <div className="space-y-6 w-full pb-10">
      <ResearchBriefSheet
        open={showResearch}
        onOpenChange={setShowResearch}
        data={data.research_brief}
      />

      {/* Header / Meta Info */}
      <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
        <div className="space-y-3">
          <div className="flex gap-2 justify-end">
            {/* Toggle Research Brief */}
            {data.research_brief && (
              <Button
                variant="outline"
                onClick={() => setShowResearch(true)}
                className="text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100 shadow-none font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                View Research Brief
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#104127] text-white hover:bg-[#0d3320] shadow-none min-w-[140px] transition-all"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : showSavedMessage ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : showSavedMessage
                  ? isEditMode
                    ? "Updated!"
                    : "Saved!"
                  : isEditMode
                    ? "Update"
                    : "Save"}
            </Button>
            {isEditMode && linkedArticle ? (
              <Button
                variant="outline"
                onClick={() => router.push(`/article/${linkedArticle.id}`)}
                className="border-[#104127] text-[#104127] hover:bg-[#EAF9F2] shadow-none border-none"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Return to Article
              </Button>
            ) : !isEditMode ? (
              <Button
                variant="outline"
                onClick={() => createArticleMutation.mutate()}
                disabled={createArticleMutation.isPending}
                className="border-[#104127] text-[#104127] hover:bg-[#EAF9F2] shadow-none border-none"
                title="Create Article from Outline"
              >
                {createArticleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileEdit className="mr-2 h-4 w-4" />
                )}
                {createArticleMutation.isPending
                  ? "Creating..."
                  : "Create Article"}
              </Button>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Article Title
            </label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="text-xl font-bold font-poppins border-transparent hover:border-gray-200 focus:border-green-500 px-2 h-auto py-2 w-full"
              placeholder="Article Title"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Meta Description
          </label>
          <Textarea
            value={data.meta_description}
            onChange={(e) =>
              setData({ ...data, meta_description: e.target.value })
            }
            className="resize-none text-sm text-gray-600 font-inter border-gray-200 focus:border-green-500 min-h-[80px] shadow-none"
            placeholder="Meta description..."
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card
          id="outline-intro"
          className="border-none shadow-none bg-white scroll-mt-20"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.introduction || ""}
              onChange={(e) =>
                setData({ ...data, introduction: e.target.value })
              }
              className="resize-none text-sm text-gray-600 font-inter border-gray-200 focus:border-green-500 min-h-[100px]"
              placeholder="Write an introduction..."
            />
          </CardContent>
        </Card>

        {/* Sections (Draggable) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
              Outline Sections
            </h3>
            <Button
              size="sm"
              onClick={addSection}
              className="bg-[#104127] text-white hover:bg-[#0d3320] shadow-none border-none"
            >
              <Plus size={16} className="mr-1" /> Add Section
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndReal}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {items.map((item, index) => (
                  <SortableSectionItem
                    key={item.id}
                    id={item.id}
                    section={item.section}
                    index={index}
                    onUpdate={updateSection}
                    onRemove={removeSection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Conclusion */}
        <Card
          id="outline-conclusion"
          className="border-none shadow-none bg-white scroll-mt-20"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" /> Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.conclusion || ""}
              onChange={(e) => setData({ ...data, conclusion: e.target.value })}
              className="resize-none text-sm text-gray-600 font-inter border-gray-200 focus:border-green-500 min-h-[100px]"
              placeholder="Write a conclusion..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
