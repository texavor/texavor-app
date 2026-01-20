import React from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Info, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OutlineFormProps {
  onSubmit: (data: {
    topic: string;
    aeo_optimization: boolean;
    deep_research: boolean;
  }) => void;
  isPending: boolean;
  initialValues?: {
    topic: string;
    aeo_optimization?: boolean;
  };
}

export const OutlineForm: React.FC<OutlineFormProps> = ({
  onSubmit,
  isPending,
  initialValues,
}) => {
  const form = useForm({
    defaultValues: {
      topic: initialValues?.topic || "",
      aeo_optimization: initialValues?.aeo_optimization || false,
    },
    onSubmit: async ({ value }) => {
      onSubmit({ ...value, deep_research: true });
    },
  });

  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-poppins text-black font-medium">
            Generate Outline
          </p>
          <p className="font-inter text-[#7A7A7A] text-sm font-normal">
            Enter a topic to generate a comprehensive article outline.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold font-inter flex items-center gap-1 border border-blue-100">
          <Sparkles className="w-3 h-3" />
          Deep Research Active
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <form.Field
              name="topic"
              children={(field) => (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter a topic (e.g., The Future of AI in Content Creation)"
                    required
                    className="pl-10 bg-white text-black font-inter"
                  />
                </div>
              )}
            />
          </div>

          <form.Field
            name="aeo_optimization"
            children={(field) => (
              <div className="flex items-center space-x-2 pt-1 sm:pt-0">
                <Switch
                  id="aeo-mode"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <label
                  htmlFor="aeo-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 whitespace-nowrap"
                >
                  Optimize for AI
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Adds a "Quick Answer" summary and an "FAQ" section to
                          target Featured Snippets and Google SGE.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
              </div>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-[50%] bg-[#104127] text-white hover:bg-[#104127]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Outline"
          )}
        </Button>
      </form>
    </div>
  );
};
