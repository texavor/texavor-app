import React from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles } from "lucide-react";

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
    },
    onSubmit: async ({ value }) => {
      onSubmit({ ...value, deep_research: true, aeo_optimization: true });
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
        <div className="w-full">
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
