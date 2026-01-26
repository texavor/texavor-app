import Image from "@tiptap/extension-image";

export const CustomImage = Image.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write("\n\n");
          state.write(
            `![${state.esc(node.attrs.alt || "")}](${state.esc(node.attrs.src)})`,
          );
          state.write("\n\n");
          state.closeBlock(node);
        },
        parse: {
          // Default parsing logic via DOM/markdown-it should handle standard markdown images fine.
          // We mainly need to override serialization.
        },
      },
    };
  },
});
