import React from "react";
import { OutlineData } from "../hooks/useOutlineApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface SavedOutlinesListProps {
  outlines: OutlineData[];
  onSelect: (outline: OutlineData) => void;
  onDelete: (id: string) => void;
}

export const SavedOutlinesList: React.FC<SavedOutlinesListProps> = ({
  outlines,
  onSelect,
  onDelete,
}) => {
  if (!outlines || outlines.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No saved outlines</h3>
        <p className="text-gray-500">Generate an outline to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {outlines.map((outline) => (
        <Card
          key={outline.id}
          className="hover:shadow-md transition-shadow border-gray-200 group relative bg-white"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold line-clamp-2 leading-tight h-10">
              {outline.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Calendar size={12} />
              {outline.created_at
                ? format(new Date(outline.created_at), "MMM d, yyyy")
                : "Unknown date"}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {outline.sections.length} Sections
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (outline.id) onDelete(outline.id);
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelect(outline)}
                  className="h-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-700"
                >
                  <Edit size={14} className="mr-1" /> Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
