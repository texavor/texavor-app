import React from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface OutlineFormProps {
  onSubmit: (data: { topic: string }) => void;
  isPending: boolean;
  initialValues?: {
    topic: string;
  };
}

export const OutlineForm: React.FC<OutlineFormProps> = ({
  onSubmit,
  isPending,
  initialValues,
}) => {
  const form = useForm({
    defaultValues: initialValues || {
      topic: "",
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm border border-gray-100">
      <div className="space-y-1">
        <h2 className="font-poppins text-lg font-semibold text-gray-900">
          Generate Outline
        </h2>
        <p className="font-inter text-sm text-gray-500">
          Enter a topic to generate a comprehensive article outline.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
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
                  className="pl-10 bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#104127] text-white hover:bg-[#0d3320] font-medium py-2.5"
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
