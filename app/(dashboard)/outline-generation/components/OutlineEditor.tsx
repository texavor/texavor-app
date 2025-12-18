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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

interface OutlineEditorProps {
  initialData: OutlineData;
  onSave: (data: OutlineData) => void;
  onChange?: (data: OutlineData) => void;
  isSaving: boolean;
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
            className="font-semibold text-lg border-transparent hover:border-gray-200 focus:border-green-500 px-2 h-9"
            placeholder="Section Heading"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 ml-auto"
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
}) => {
  const router = useRouter();
  const { blogs } = useAppStore();
  const [data, setData] = useState<OutlineData>(initialData);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Mutation to create article from outline
  const createArticleMutation = useMutation({
    mutationFn: async () => {
      let outlineId = data?.id;

      console.log("Initial outline ID:", outlineId);

      // If outline hasn't been saved yet, save it first
      if (!outlineId) {
        const outlineToSave = {
          ...data,
          sections: items.map((i) => i.section),
        };

        console.log("Saving outline first...", outlineToSave);

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
              },
            },
          }
        );

        console.log("Save response:", saveRes?.data);
        // Extract the saved_result ID from the response
        outlineId = saveRes?.data?.data?.id || saveRes?.data?.id;
        console.log("Extracted outline ID:", outlineId);

        // Update local data with the saved outline ID
        setData((prev) => ({ ...prev, id: outlineId }));
      }

      console.log("Creating article with saved_result_id:", outlineId);
      console.log("Article payload:", {
        title: data.title || "Untitled Article",
        content: data.meta_description || "",
        saved_result_id: outlineId,
        source: "texavor",
      });

      // Now create the article with the outline ID
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/articles`,
        {
          title: data.title || "Untitled Article",
          content: data.meta_description || "",
          saved_result_id: outlineId,
          source: "texavor",
        }
      );
      return res?.data;
    },
    onSuccess: (articleData) => {
      // Navigate to the article editor
      router.push(`/article/${articleData?.id}`);
    },
  });

  // Track previous isSaving to detect completion
  useEffect(() => {
    if (!isSaving && showSavedMessage) {
      const timer = setTimeout(() => setShowSavedMessage(false), 2000);
      return () => clearTimeout(timer);
    }
    // If just finished saving (was saving, now not), triggering logic handled in button click or just assume false->true->false cycle
    // We can just rely on the parent changing isSaving from true to false
  }, [isSaving, showSavedMessage]);

  // Use a ref to track previous value because we can't inspect previous prop in useEffect directly without it
  const prevIsSaving = React.useRef(isSaving);
  useEffect(() => {
    if (prevIsSaving.current && !isSaving) {
      setShowSavedMessage(true);
    }
    prevIsSaving.current = isSaving;
  }, [isSaving]);

  // Only sync ID if it changes (e.g. after save), do not reset other state to avoid loops
  useEffect(() => {
    if (initialData.id && initialData.id !== data.id) {
      setData((prev) => ({ ...prev, id: initialData.id }));
    }
  }, [initialData.id, data.id]);

  // Refactored State Management for Sections
  const [items, setItems] = useState<{ id: string; section: OutlineSection }[]>(
    () =>
      initialData.sections.map((s) => ({
        id: `section-${Math.random().toString(36).substr(2, 9)}`,
        section: s,
      }))
  );

  // Notify parent of changes whenever data or items change
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
  ]); // Watch specific fields to avoid loops if we watched 'data' directly and it was derived

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header / Meta Info */}
      <div className="bg-white p-6 rounded-xl shadow-none border-none space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 w-full mr-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Article Title
            </label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="text-xl font-bold font-poppins border-transparent hover:border-gray-200 focus:border-green-500 px-2 h-auto py-2"
              placeholder="Article Title"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#104127] text-white hover:bg-[#0d3320] min-w-[120px]"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : showSavedMessage ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : showSavedMessage ? "Saved!" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => createArticleMutation.mutate()}
              disabled={createArticleMutation.isPending}
              className="border-[#104127] text-[#104127] hover:bg-[#EAF9F2] min-w-[140px]"
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
            className="resize-none text-sm text-gray-600 font-inter border-gray-200 focus:border-green-500 min-h-[80px]"
            placeholder="Meta description..."
          />
        </div>
      </div>

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
            onChange={(e) => setData({ ...data, introduction: e.target.value })}
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
            variant="outline"
            size="sm"
            onClick={addSection}
            className="text-green-700 border-green-200 hover:bg-green-50"
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
  );
};
