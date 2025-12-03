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
    <div className="bg-white rounded-xl p-4 space-y-2">
      <p className="font-poppins text-black font-medium">Generate Outline</p>
      <p className="font-inter text-[#7A7A7A] text-sm font-normal">
        Enter a topic to generate a comprehensive article outline.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-2"
      >
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
